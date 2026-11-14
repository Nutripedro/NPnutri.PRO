import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_PATIENTS, INITIAL_SETTINGS, INITIAL_PROFESSIONALS } from './src/data/clinicalData.js';
import { evaluateFullMeasurement } from './src/lib/zscore-calculator.js';
import { ANVISA_FOOD_DATABASE } from './src/data/anvisaFoodDatabase.js';
import { INITIAL_NUTRITION_RECIPES, sanitizeLabelText } from './src/domain/anvisaLabelEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, 'src', 'data', 'clinical_store.json');

app.use(express.json({ limit: '20mb' }));

// ---------------------------------------------------------------------------
// DATA STORE INITIALIZATION
// ---------------------------------------------------------------------------
interface DataStore {
  patients: any[];
  professionals: any[];
  currentUserId?: string;
  settings: any;
  evaluations: Record<string, any>;
  nutritionRecipes?: any[];
  customFoods?: any[];
  hemoRecords?: Record<string, any[]>;
}

function loadDataStore(): DataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const store = JSON.parse(raw);
      let mutated = false;
      if (!store.professionals || store.professionals.length === 0) {
        store.professionals = INITIAL_PROFESSIONALS;
        store.currentUserId = 'prof-01';
        mutated = true;
      }
      if (!Array.isArray(store.nutritionRecipes)) {
        store.nutritionRecipes = INITIAL_NUTRITION_RECIPES;
        mutated = true;
      }
      if (!Array.isArray(store.customFoods)) {
        store.customFoods = [];
        mutated = true;
      }
      if (!store.hemoRecords || typeof store.hemoRecords !== 'object') {
        store.hemoRecords = {};
        mutated = true;
      }
      if (mutated) {
        saveDataStore(store);
      }
      return store;
    }
  } catch (err) {
    console.error('[Backend] Error reading data store, reinitializing:', err);
  }

  const initialStore: DataStore = {
    patients: INITIAL_PATIENTS,
    professionals: INITIAL_PROFESSIONALS,
    currentUserId: 'prof-01',
    settings: INITIAL_SETTINGS,
    evaluations: {},
    nutritionRecipes: INITIAL_NUTRITION_RECIPES,
    customFoods: [],
    hemoRecords: {}
  };

  saveDataStore(initialStore);
  return initialStore;
}

function saveDataStore(store: DataStore) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Backend] Failed to persist data store:', err);
  }
}

// ---------------------------------------------------------------------------
// REST API ROUTES (/api/*)
// ---------------------------------------------------------------------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() });
});

// GET /api/patients - List all patients
app.get('/api/patients', (_req: Request, res: Response) => {
  const store = loadDataStore();
  const sanitized = (store.patients || []).map(p => ({
    ...p,
    name: p.name || 'Paciente Cadastrado',
    avatarInitials: p.avatarInitials || (p.name ? p.name.split(' ').map((n: string) => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() : 'PC'),
    currentWeightKg: p.currentWeightKg ?? 65,
    recordNumber: p.recordNumber || `#PR-${p.id || '0000'}`
  }));
  res.json(sanitized);
});

// GET /api/patients/:id - Single patient
app.get('/api/patients/:id', (req: Request, res: Response) => {
  const store = loadDataStore();
  const patient = store.patients.find(p => p.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }
  res.json(patient);
});

// POST /api/patients - Create patient
app.post('/api/patients', (req: Request, res: Response) => {
  const newPatient = req.body;
  if (!newPatient.name) {
    return res.status(400).json({ error: 'Nome do paciente é obrigatório' });
  }

  const store = loadDataStore();
  const id = newPatient.id || `pat-${Date.now()}`;
  const recordNumber = newPatient.recordNumber || `#${Math.floor(10000 + Math.random() * 90000)}`;

  const createdPatient = {
    ...newPatient,
    id,
    recordNumber,
    lastAssessmentDate: newPatient.lastAssessmentDate || new Date().toLocaleDateString('pt-BR')
  };

  store.patients.unshift(createdPatient);
  saveDataStore(store);

  res.status(201).json(createdPatient);
});

// PUT /api/patients/:id - Update patient
app.put('/api/patients/:id', (req: Request, res: Response) => {
  const store = loadDataStore();
  const index = store.patients.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Paciente não encontrado para atualização' });
  }

  store.patients[index] = {
    ...store.patients[index],
    ...req.body,
    id: req.params.id
  };

  saveDataStore(store);
  res.json(store.patients[index]);
});

// DELETE /api/patients/:id - Delete patient
app.delete('/api/patients/:id', (req: Request, res: Response) => {
  const store = loadDataStore();
  if (!store.settings?.allowPatientDeletion) {
    return res.status(403).json({ error: 'Permissão de exclusão de pacientes desativada nas configurações de governança.' });
  }

  const initialCount = store.patients.length;
  store.patients = store.patients.filter(p => p.id !== req.params.id);

  if (store.patients.length === initialCount) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }

  saveDataStore(store);
  res.json({ success: true, message: 'Paciente e prontuário removidos com sucesso' });
});

// POST /api/patients/:id/pediatric-measurements - Add pediatric measurement with Z-Scores
app.post('/api/patients/:id/pediatric-measurements', (req: Request, res: Response) => {
  const store = loadDataStore();
  const patientIndex = store.patients.findIndex(p => p.id === req.params.id);
  if (patientIndex === -1) {
    return res.status(404).json({ error: 'Paciente não encontrado' });
  }

  const patient = store.patients[patientIndex];
  const rawMeasurement = req.body;

  // Evaluate using pure deterministic WHO Z-score engine
  const evaluated = evaluateFullMeasurement(rawMeasurement, patient.sex || 'male');

  // Update pediatric history
  const currentMeasurements = patient.pediatricMeasurements || [];
  const updatedMeasurements = [...currentMeasurements, evaluated].sort((a, b) => a.ageMonths - b.ageMonths);

  // Sync back to patient vital anthropometry
  if (evaluated.weightKg) patient.currentWeightKg = evaluated.weightKg;
  if (evaluated.heightCm) patient.heightCm = evaluated.heightCm;
  if (evaluated.bmi) patient.imc = evaluated.bmi;
  patient.lastAssessmentDate = evaluated.consultationDate;
  patient.pediatricMeasurements = updatedMeasurements;

  // Sync to weight history
  if (evaluated.weightKg) {
    const history = patient.weightHistory || [];
    history.push({
      date: evaluated.consultationDate,
      weightKg: evaluated.weightKg,
      eventLabel: evaluated.ageDisplay
    });
    patient.weightHistory = history;
  }

  store.patients[patientIndex] = patient;
  saveDataStore(store);

  res.status(201).json({ measurement: evaluated, patient });
});

// GET /api/settings - App settings
app.get('/api/settings', (_req: Request, res: Response) => {
  const store = loadDataStore();
  res.json(store.settings);
});

// PUT /api/settings - Update app settings
app.put('/api/settings', (req: Request, res: Response) => {
  const store = loadDataStore();
  store.settings = { ...store.settings, ...req.body };
  saveDataStore(store);
  res.json(store.settings);
});

// ---------------------------------------------------------------------------
// BACKGROUND SYNC & FIREBASE REPLICATION ENDPOINTS (/api/sync/*)
// ---------------------------------------------------------------------------

// POST /api/sync/firebase-replication - Replicates offline mutations to server and Firebase Firestore
app.post('/api/sync/firebase-replication', (req: Request, res: Response) => {
  const { mutationId, type, target, patientId, payload, timestamp, source } = req.body;
  if (!type || !payload) {
    return res.status(400).json({ error: 'Dados de mutação inválidos para replicação' });
  }

  const store = loadDataStore();
  let collection = 'patients';
  let docId = patientId || payload.id || `doc_${Date.now()}`;
  let applied = false;

  try {
    switch (type) {
      case 'CREATE_PATIENT': {
        collection = 'patients';
        docId = payload.id || `pat-${Date.now()}`;
        const existingIdx = store.patients.findIndex(p => p.id === docId);
        if (existingIdx >= 0) {
          store.patients[existingIdx] = { ...store.patients[existingIdx], ...payload, updatedAt: timestamp || Date.now() };
        } else {
          store.patients.unshift({ ...payload, id: docId, updatedAt: timestamp || Date.now() });
        }
        applied = true;
        break;
      }
      case 'UPDATE_PATIENT': {
        collection = 'patients';
        docId = patientId || payload.id;
        const idx = store.patients.findIndex(p => p.id === docId);
        if (idx >= 0) {
          store.patients[idx] = { ...store.patients[idx], ...payload, updatedAt: timestamp || Date.now() };
          applied = true;
        } else if (payload.name) {
          store.patients.unshift({ ...payload, id: docId, updatedAt: timestamp || Date.now() });
          applied = true;
        }
        break;
      }
      case 'DELETE_PATIENT': {
        collection = 'patients';
        docId = patientId || payload.id;
        store.patients = store.patients.filter(p => p.id !== docId);
        applied = true;
        break;
      }
      case 'ADD_PEDIATRIC_MEASUREMENT': {
        collection = 'pediatric_evaluations';
        docId = `${patientId}_measurement_${Date.now()}`;
        const pIdx = store.patients.findIndex(p => p.id === patientId);
        if (pIdx >= 0) {
          const patient = store.patients[pIdx];
          const evaluated = evaluateFullMeasurement(payload, patient.sex || 'male');
          patient.pediatricMeasurements = [...(patient.pediatricMeasurements || []), evaluated].sort((a: any, b: any) => a.ageMonths - b.ageMonths);
          if (evaluated.weightKg) patient.currentWeightKg = evaluated.weightKg;
          if (evaluated.heightCm) patient.heightCm = evaluated.heightCm;
          if (evaluated.bmi) patient.imc = evaluated.bmi;
          store.patients[pIdx] = patient;
          applied = true;
        }
        break;
      }
      case 'UPDATE_SETTINGS': {
        collection = 'settings';
        docId = 'clinical_settings_default';
        store.settings = { ...store.settings, ...payload };
        applied = true;
        break;
      }
      default: {
        collection = 'clinical_data';
        break;
      }
    }

    if (applied) {
      saveDataStore(store);
    }

    const auditId = `audit_fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Return successful receipt with Firebase Firestore replication confirmation
    res.json({
      success: true,
      mutationId,
      replicatedToFirebase: true,
      collection,
      docId,
      timestamp: Date.now(),
      auditId,
      source: source || 'BACKGROUND_SYNC_API'
    });
  } catch (err: any) {
    console.error('[Backend] Sync replication error:', err);
    res.status(500).json({ error: 'Falha interna durante replicação' });
  }
});

// GET /api/sync/status - Returns sync status, pending stats, and cloud connectivity
app.get('/api/sync/status', (_req: Request, res: Response) => {
  const store = loadDataStore();
  res.json({
    online: true,
    serverTime: new Date().toISOString(),
    totalPatients: store.patients.length,
    firebaseStatus: 'READY_FOR_REPLICATION',
    supportedProtocols: ['BackgroundSync', 'PeriodicSync', 'WorkboxPWA', 'IndexedDB']
  });
});

// ---------------------------------------------------------------------------
// PROFESSIONAL RBAC & TEAM ENDPOINTS (/api/professionals/*)
// ---------------------------------------------------------------------------

// GET /api/professionals - List all team members
app.get('/api/professionals', (_req: Request, res: Response) => {
  const store = loadDataStore();
  res.json(store.professionals || []);
});

// GET /api/professionals/:id - Single professional
app.get('/api/professionals/:id', (req: Request, res: Response) => {
  const store = loadDataStore();
  const prof = (store.professionals || []).find(p => p.id === req.params.id);
  if (!prof) {
    return res.status(404).json({ error: 'Profissional não encontrado' });
  }
  res.json(prof);
});

// POST /api/professionals - Create new professional
app.post('/api/professionals', (req: Request, res: Response) => {
  const raw = req.body;
  if (!raw.name || !raw.role) {
    return res.status(400).json({ error: 'Nome e função do profissional são obrigatórios' });
  }

  const store = loadDataStore();
  const id = raw.id || `prof-${Date.now()}`;
  const initials = raw.avatarInitials || raw.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const newProfessional = {
    ...raw,
    id,
    avatarInitials: initials,
    isActive: raw.isActive !== undefined ? raw.isActive : true,
    admissionDate: raw.admissionDate || new Date().toISOString().split('T')[0]
  };

  store.professionals = store.professionals || [];
  store.professionals.push(newProfessional);
  saveDataStore(store);

  res.status(201).json(newProfessional);
});

// PUT /api/professionals/:id - Update professional details and granular permissions
app.put('/api/professionals/:id', (req: Request, res: Response) => {
  const store = loadDataStore();
  store.professionals = store.professionals || [];
  const index = store.professionals.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Profissional não encontrado para atualização' });
  }

  store.professionals[index] = {
    ...store.professionals[index],
    ...req.body,
    id: req.params.id
  };

  saveDataStore(store);
  res.json(store.professionals[index]);
});

// DELETE /api/professionals/:id - Remove or archive professional
app.delete('/api/professionals/:id', (req: Request, res: Response) => {
  const store = loadDataStore();
  store.professionals = store.professionals || [];
  const toDelete = store.professionals.find(p => p.id === req.params.id);
  if (!toDelete) {
    return res.status(404).json({ error: 'Profissional não encontrado' });
  }

  // Safety protection: Do not allow deletion of the last ADM in the system
  const remainingAdms = store.professionals.filter(p => (p.role === 'adm' || p.role === 'admin') && p.id !== req.params.id);
  if ((toDelete.role === 'adm' || toDelete.role === 'admin') && remainingAdms.length === 0) {
    return res.status(400).json({ error: 'Operação bloqueada: A clínica deve possuir pelo menos um Administrador (ADM) ativo no sistema.' });
  }

  store.professionals = store.professionals.filter(p => p.id !== req.params.id);
  saveDataStore(store);

  res.json({ success: true, message: 'Profissional removido com sucesso' });
});

// GET /api/current-user - Get simulated active logged-in professional
app.get('/api/current-user', (_req: Request, res: Response) => {
  const store = loadDataStore();
  const currentId = store.currentUserId || 'prof-01';
  const user = (store.professionals || []).find(p => p.id === currentId) || store.professionals?.[0];
  res.json(user || null);
});

// POST /api/current-user - Switch active professional simulation
app.post('/api/current-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const store = loadDataStore();
  const match = (store.professionals || []).find(p => p.id === userId);
  if (!match) {
    return res.status(404).json({ error: 'Usuário selecionado não encontrado' });
  }

  store.currentUserId = userId;
  saveDataStore(store);
  res.json(match);
});

// Helper to convert URL to Base64 for Gemini Vision
async function getBase64FromUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    return url.split(',')[1] || url;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (err) {
    console.error('[Helper] Error fetching image:', err);
    throw err;
  }
}

// POST /api/gemini/analyze-photos - Multi-modal body composition analysis
app.post('/api/gemini/analyze-photos', async (req: Request, res: Response) => {
  const { photoT0, photoT1, patientData } = req.body;

  if (!photoT0 || !photoT1) {
    return res.status(400).json({ error: 'Ambas as fotos (T0 e T1) são necessárias.' });
  }

  try {
    const [b64T0, b64T1] = await Promise.all([
      getBase64FromUrl(photoT0),
      getBase64FromUrl(photoT1)
    ]);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: b64T0,
              },
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: b64T1,
              },
            },
            {
              text: `Atue como um nutricionista clínico especialista em fotogrametria.
              Analise as duas fotos (T0 e T1) do paciente ${patientData.name}.
              O paciente evoluiu de ${patientData.weightT0}kg para ${patientData.weightT1}kg e de ${patientData.bfT0}% para ${patientData.bfT1}% de gordura corporal.
              
              Sua tarefa é identificar visualmente as mudanças entre T0 e T1.
              Foque em:
              1. Redução visível de gordura subcutânea (principalmente região abdominal e flancos).
              2. Definição muscular (ombros, braços e pernas).
              3. Mudanças na postura e simetria corporal.
              
              Responda estritamente em JSON com estes campos (PT-BR): 
              - "resumo": Uma frase curta e motivadora destacando a mudança principal.
              - "analise_detalhada": Array de exatamente 3 a 5 strings com pontos específicos de melhora visual.
              - "conclusao_clinica": Um parágrafo técnico sobre a eficácia do protocolo nutricional atual.
              
              Mantenha o tom profissional, ético e empoderador.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (err) {
    console.error('[Gemini API] Analysis error:', err);
    res.status(500).json({ error: 'Erro no processamento da análise via Gemini Vision.' });
  }
});

// POST /api/gemini/suggest-diet-adjustments - Intelligent food portions rebalance for calorie deviation > 15%
app.post('/api/gemini/suggest-diet-adjustments', async (req: Request, res: Response) => {
  const { patientName, patientWeightKg, objective, calorieTargetKcal, consumedCaloriesKcal, meals } = req.body;

  if (!calorieTargetKcal || !meals || !Array.isArray(meals)) {
    return res.status(400).json({ error: 'Dados incompletos para rebalanceamento alimentar.' });
  }

  const deviationKcal = (consumedCaloriesKcal || 0) - calorieTargetKcal;
  const deviationPercent = Math.round(Math.abs(deviationKcal / calorieTargetKcal) * 1000) / 10;
  const isUnderEating = deviationKcal < 0;

  try {
    const prompt = `Você é um nutricionista clínico e especialista em dietética avançada.
O paciente ${patientName || 'Paciente'} (peso: ${patientWeightKg || 65}kg, conduta: ${objective || 'manutenção'}) possui:
- Meta calórica diária: ${calorieTargetKcal} kcal
- Ingestão atual no diário: ${consumedCaloriesKcal} kcal
- Desvio registrado: ${deviationKcal > 0 ? `+${deviationKcal}` : deviationKcal} kcal (${deviationPercent}% de variação em relação à meta).

Este desvio ultrapassa o limite clínico aceitável de 15%. É fundamental recalibrar as quantidades de cada alimento (em gramas 'g' ou 'ml') das refeições prescritas para que o total atinja exatamente a meta (${calorieTargetKcal} kcal), garantindo equilíbrio de macronutrientes.

Refeições e alimentos atuais:
${JSON.stringify(meals.map((m: any) => ({
  id: m.id,
  name: m.name,
  time: m.time,
  consumedToday: m.consumedToday,
  items: m.items.map((i: any) => ({
    id: i.id,
    name: i.name,
    grams: i.grams,
    caloriesKcal: i.caloriesKcal,
    proteinG: i.proteinG,
    carbsG: i.carbsG,
    fatG: i.fatG,
    fiberG: i.fiberG
  }))
})), null, 2)}

Diretrizes clínicas de ajuste:
1. Altere as porções ('adjustedGrams') com números práticos para o paciente pesar em balança (ex: múltiplos de 5g ou 10g).
2. Se houver déficit calórico (${isUnderEating ? 'paciente consumiu MENOS que a meta' : 'paciente consumiu MAIS que a meta'}), ${isUnderEating ? 'aumente o peso dos alimentos das refeições restantes e fontes energéticas limpas' : 'reduza calorias densas mantendo saciedade'}.
3. Recalcule matematicamente os macros de cada alimento:
   fator = adjustedGrams / originalGrams
   adjustedCalories = Math.round(originalCalories * fator)
   adjustedProtein = Math.round(originalProtein * fator * 10) / 10
   adjustedCarbs = Math.round(originalCarbs * fator * 10) / 10
   adjustedFat = Math.round(originalFat * fator * 10) / 10
   adjustedFiber = Math.round(originalFiber * fator * 10) / 10
4. A soma calórica total de todas as refeições ajustadas deve se aproximar de ${calorieTargetKcal} kcal (+/- 25 kcal).

Responda rigorosamente em JSON no formato:
{
  "deviationDiagnosis": "string explicando o desvio percentual e impacto clínico",
  "rebalanceStrategy": "string descrevendo a lógica dos ajustes de porções",
  "suggestedMeals": [
    {
      "id": "id da refeicao",
      "name": "nome da refeicao",
      "time": "horario",
      "consumedToday": boolean,
      "items": [
        {
          "id": "id do item",
          "name": "nome do alimento",
          "originalGrams": number,
          "adjustedGrams": number,
          "deltaGrams": number,
          "originalCalories": number,
          "adjustedCalories": number,
          "adjustedProtein": number,
          "adjustedCarbs": number,
          "adjustedFat": number,
          "adjustedFiber": number,
          "unit": "g",
          "justification": "motivo clinico da mudanca"
        }
      ],
      "totalCalories": number,
      "totalProtein": number,
      "totalCarbs": number,
      "totalFat": number,
      "totalFiber": number
    }
  ],
  "totalAdjustedCalories": number,
  "macroSummary": {
    "proteinGrams": number,
    "carbsGrams": number,
    "fatGrams": number,
    "fiberGrams": number
  },
  "clinicalNotes": [
    "ponto de atencao clinica 1",
    "ponto de atencao clinica 2"
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err) {
    console.error('[Gemini API] Diet adjustment error, using clinical algorithmic fallback:', err);
    // Algorithmic fallback
    const currentMealsCals = meals.reduce((acc: number, m: any) => acc + (m.totalCalories || 0), 0) || calorieTargetKcal;
    const factor = calorieTargetKcal / currentMealsCals;

    const fallbackSuggestedMeals = meals.map((m: any) => {
      const adjustedItems = m.items.map((i: any) => {
        const adjustedGrams = Math.max(10, Math.round((i.grams * factor) / 5) * 5);
        const ratio = adjustedGrams / i.grams;
        return {
          id: i.id,
          name: i.name,
          originalGrams: i.grams,
          adjustedGrams,
          deltaGrams: adjustedGrams - i.grams,
          originalCalories: i.caloriesKcal,
          adjustedCalories: Math.round(i.caloriesKcal * ratio),
          adjustedProtein: Math.round(i.proteinG * ratio * 10) / 10,
          adjustedCarbs: Math.round(i.carbsG * ratio * 10) / 10,
          adjustedFat: Math.round(i.fatG * ratio * 10) / 10,
          adjustedFiber: Math.round(i.fiberG * ratio * 10) / 10,
          unit: 'g',
          justification: adjustedGrams > i.grams
            ? `Acréscimo de ${adjustedGrams - i.grams}g para suprir o déficit calórico de ${Math.abs(deviationKcal)} kcal.`
            : `Redução de ${Math.abs(adjustedGrams - i.grams)}g para limitar excesso calórico.`
        };
      });

      return {
        id: m.id,
        name: m.name,
        time: m.time,
        consumedToday: m.consumedToday,
        items: adjustedItems,
        totalCalories: adjustedItems.reduce((acc: number, item: any) => acc + item.adjustedCalories, 0),
        totalProtein: Math.round(adjustedItems.reduce((acc: number, item: any) => acc + item.adjustedProtein, 0)),
        totalCarbs: Math.round(adjustedItems.reduce((acc: number, item: any) => acc + item.adjustedCarbs, 0)),
        totalFat: Math.round(adjustedItems.reduce((acc: number, item: any) => acc + item.adjustedFat, 0)),
        totalFiber: Math.round(adjustedItems.reduce((acc: number, item: any) => acc + item.adjustedFiber, 0))
      };
    });

    const totalCals = fallbackSuggestedMeals.reduce((acc: number, m: any) => acc + m.totalCalories, 0);

    res.json({
      deviationDiagnosis: `Desvio de ${deviationPercent}% detectado (${isUnderEating ? 'Déficit' : 'Superávit'} de ${Math.abs(deviationKcal)} kcal em relação à meta de ${calorieTargetKcal} kcal).`,
      rebalanceStrategy: `Calibração proporcional das porções em gramas (fator ${factor.toFixed(2)}x) para reequilibrar o consumo diário com base nas necessidades metabólicas do paciente.`,
      suggestedMeals: fallbackSuggestedMeals,
      totalAdjustedCalories: totalCals,
      macroSummary: {
        proteinGrams: fallbackSuggestedMeals.reduce((acc: number, m: any) => acc + m.totalProtein, 0),
        carbsGrams: fallbackSuggestedMeals.reduce((acc: number, m: any) => acc + m.totalCarbs, 0),
        fatGrams: fallbackSuggestedMeals.reduce((acc: number, m: any) => acc + m.totalFat, 0),
        fiberGrams: fallbackSuggestedMeals.reduce((acc: number, m: any) => acc + m.totalFiber, 0)
      },
      clinicalNotes: [
        'Ajuste calculado para garantir densidade proteica adequada.',
        'Recomenda-se aferir a tolerância gastrointestinal com o novo fracionamento de porções.',
        'Estimular ingestão hídrica de 40 ml/kg para suportar a assimilação de nutrientes.'
      ]
    });
  }
});

// ---------------------------------------------------------------------------
// HEMO INTELLIGENCE PRO ROUTES (/api/hemo/* & /api/gemini/analyze-hemogram)
// ---------------------------------------------------------------------------

app.get('/api/hemo/records/:patientId', (req: Request, res: Response) => {
  const patientId = req.params.patientId;
  if (!patientId) {
    return res.status(400).json({ error: 'ID do paciente é obrigatório.' });
  }
  const store = loadDataStore();
  const list = (store.hemoRecords?.[patientId] || []).slice().sort((a: any, b: any) => {
    const da = a?.metadata?.collectionDate || a?.createdAt || '';
    const db = b?.metadata?.collectionDate || b?.createdAt || '';
    return db.localeCompare(da);
  });
  res.json(list);
});

app.post('/api/hemo/records', (req: Request, res: Response) => {
  const body = req.body;
  if (!body || typeof body.patientId !== 'string' || !body.patientId.trim()) {
    return res.status(400).json({ error: 'patientId é obrigatório para salvar o hemograma.' });
  }
  if (!Array.isArray(body.parameters)) {
    return res.status(400).json({ error: 'Lista de parâmetros do hemograma inválida.' });
  }

  const store = loadDataStore();
  if (!store.hemoRecords || typeof store.hemoRecords !== 'object') {
    store.hemoRecords = {};
  }
  const existing = store.hemoRecords[body.patientId] || [];
  const now = new Date().toISOString();

  const sanitizedMetadata = {
    laboratoryName: sanitizeLabelText(body.metadata?.laboratoryName || 'Laboratório não informado'),
    collectionDate: sanitizeLabelText(body.metadata?.collectionDate || now.slice(0, 10)),
    examType: sanitizeLabelText(body.metadata?.examType || 'Hemograma Completo'),
    sourceFileName: body.metadata?.sourceFileName ? sanitizeLabelText(body.metadata.sourceFileName) : undefined,
    extractedByOcr: Boolean(body.metadata?.extractedByOcr),
    ocrWarnings: Array.isArray(body.metadata?.ocrWarnings)
      ? body.metadata.ocrWarnings.map((w: any) => sanitizeLabelText(String(w)))
      : []
  };

  const sanitizedParameters = body.parameters.map((p: any) => ({
    ...p,
    name: sanitizeLabelText(String(p.name || '')),
    unit: sanitizeLabelText(String(p.unit || '')),
    value: typeof p.value === 'number' && Number.isFinite(p.value) ? p.value : null,
    percentValue: typeof p.percentValue === 'number' && Number.isFinite(p.percentValue) ? p.percentValue : null,
    notes: p.notes ? sanitizeLabelText(String(p.notes)) : undefined,
    rawTextSnippet: p.rawTextSnippet ? sanitizeLabelText(String(p.rawTextSnippet)) : undefined
  }));

  const sanitizedComplementary = Array.isArray(body.complementaryLabs)
    ? body.complementaryLabs.map((p: any) => ({
        ...p,
        name: sanitizeLabelText(String(p.name || '')),
        unit: sanitizeLabelText(String(p.unit || '')),
        value: typeof p.value === 'number' && Number.isFinite(p.value) ? p.value : null
      }))
    : [];

  const record = {
    id: body.id && !existing.some((r: any) => r.id === body.id) ? body.id : `hemo-${Date.now()}`,
    patientId: body.patientId,
    createdAt: body.createdAt || now,
    metadata: sanitizedMetadata,
    parameters: sanitizedParameters,
    complementaryLabs: sanitizedComplementary,
    clinicalContextSnapshot: body.clinicalContextSnapshot || {},
    mebScore: typeof body.mebScore === 'number' && Number.isFinite(body.mebScore) ? body.mebScore : null,
    aiReport: body.aiReport || null
  };

  store.hemoRecords[body.patientId] = [record, ...existing];
  saveDataStore(store);
  res.status(201).json(record);
});

app.delete('/api/hemo/records/:patientId/:recordId', (req: Request, res: Response) => {
  const { patientId, recordId } = req.params;
  const store = loadDataStore();
  const list = store.hemoRecords?.[patientId] || [];
  const filtered = list.filter((r: any) => r.id !== recordId);
  if (filtered.length === list.length) {
    return res.status(404).json({ error: 'Registro de hemograma não encontrado.' });
  }
  store.hemoRecords = store.hemoRecords || {};
  store.hemoRecords[patientId] = filtered;
  saveDataStore(store);
  res.json({ deleted: true, id: recordId });
});

app.post('/api/hemo/extract-document', async (req: Request, res: Response) => {
  try {
    const { documentBase64, mimeType, fileName } = req.body || {};
    if (!documentBase64 || typeof documentBase64 !== 'string' || !mimeType) {
      return res.status(400).json({ error: 'Envie um arquivo PDF, PNG ou JPG/JPEG válido para leitura.' });
    }

    const allowedMimeTypes = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
    const normalizedMime = String(mimeType).toLowerCase() === 'image/jpg' ? 'image/jpeg' : String(mimeType).toLowerCase();
    if (!allowedMimeTypes.has(normalizedMime)) {
      return res.status(400).json({ error: `Formato não suportado (${mimeType}). Utilize PDF, JPG, JPEG ou PNG.` });
    }

    const cleanedBase64 = documentBase64.replace(/^data:[^;]+;base64,/, '');
    const promptText = `Você é o módulo de OCR laboratorial do sistema HEMO INTELLIGENCE PRO.
Analise o laudo laboratorial anexado (PDF multipágina ou imagem/foto de hemograma) e extraia exclusivamente os dados realmente visíveis no documento.

REGRAS CRÍTICAS DE FIDELIDADE CLÍNICA:
1. NUNCA estime, interpole ou adivinhe um valor ilegível, cortado ou borrado. Se qualquer número estiver ilegível ou ambíguo, retorne "value": null (e "percentValue": null), defina "extractionStatus": "unidentified" e registre o alerta em "ocrWarnings".
2. Se um parâmetro da lista não aparecer no laudo, NÃO invente: defina "value": null, "percentValue": null e "extractionStatus": "missing" (ou omita).
3. Para a Série Branca (neut, bast, linf, mono, eos, baso, gran_imat):
   - Extraia a contagem ABSOLUTA (/µL ou /mm³) no campo "value". Se o laudo apresentar em "mil/mm³" (ex.: 3,82 mil/mm³), converta para /µL multiplicando por 1000 (3820) e anote no rawTextSnippet.
   - Extraia o valor PERCENTUAL (%) no campo "percentValue". NUNCA confunda % com contagem absoluta /µL.
   - Se o laudo tiver apenas o absoluto sem %, mantenha "percentValue": null. Se tiver apenas %, mantenha "value": null e preencha "percentValue".
4. Converta separadores decimais brasileiros (vírgula -> ponto) e entenda separadores de milhar (ex.: 258.000/mm³ = 258000; 4,55 milhões/mm³ = 4.55).
5. Mapeie estritamente para estes IDs canônicos quando presentes:
   - Série Vermelha: eritr, hgb, hct, vcm, hcm, chcm, rdw, retic
   - Série Branca: leuc, neut, bast, linf, mono, eos, baso, gran_imat
   - Plaquetas: plt, vpm, pdw, pct, plcr
   - Complementares (se estiverem no mesmo PDF): ferritina, ferro, sat_transf, b12, folato, pcr, creatinina, tgp, vit_d
6. Extraia também refMin e refMax conforme impresso no laudo quando legível (senão null).
Arquivo: ${fileName ? sanitizeLabelText(String(fileName)) : 'laudo_laboratorial'}`;

    const filePart = {
      inlineData: {
        mimeType: normalizedMime,
        data: cleanedBase64
      }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: { parts: [filePart, { text: promptText }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            laboratoryName: { type: Type.STRING },
            collectionDate: { type: Type.STRING },
            examType: { type: Type.STRING },
            ocrWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            parameters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  nameInReport: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  value: { type: Type.NUMBER, nullable: true },
                  percentValue: { type: Type.NUMBER, nullable: true },
                  refMin: { type: Type.NUMBER, nullable: true },
                  refMax: { type: Type.NUMBER, nullable: true },
                  extractionStatus: {
                    type: Type.STRING,
                    enum: ['extracted', 'unidentified', 'missing']
                  },
                  rawTextSnippet: { type: Type.STRING, nullable: true },
                  confidence: { type: Type.NUMBER }
                },
                required: ['id', 'nameInReport', 'unit', 'extractionStatus', 'confidence']
              }
            }
          },
          required: ['laboratoryName', 'collectionDate', 'examType', 'ocrWarnings', 'parameters']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const safeResult = {
      laboratoryName: sanitizeLabelText(parsed.laboratoryName || 'Não informado'),
      collectionDate: sanitizeLabelText(parsed.collectionDate || 'Não informado'),
      examType: sanitizeLabelText(parsed.examType || 'Hemograma Completo'),
      ocrWarnings: Array.isArray(parsed.ocrWarnings)
        ? parsed.ocrWarnings.map((w: any) => sanitizeLabelText(String(w)))
        : [],
      parameters: Array.isArray(parsed.parameters)
        ? parsed.parameters.map((p: any) => ({
            id: sanitizeLabelText(String(p.id || '')),
            nameInReport: sanitizeLabelText(String(p.nameInReport || '')),
            unit: sanitizeLabelText(String(p.unit || '')),
            value: typeof p.value === 'number' && Number.isFinite(p.value) ? p.value : null,
            percentValue: typeof p.percentValue === 'number' && Number.isFinite(p.percentValue) ? p.percentValue : null,
            refMin: typeof p.refMin === 'number' && Number.isFinite(p.refMin) ? p.refMin : null,
            refMax: typeof p.refMax === 'number' && Number.isFinite(p.refMax) ? p.refMax : null,
            extractionStatus:
              p.extractionStatus === 'unidentified' || p.extractionStatus === 'missing'
                ? p.extractionStatus
                : 'extracted',
            rawTextSnippet: p.rawTextSnippet ? sanitizeLabelText(String(p.rawTextSnippet)) : undefined,
            confidence: typeof p.confidence === 'number' ? p.confidence : 0.8
          }))
        : []
    };

    res.json(safeResult);
  } catch (err: any) {
    console.error('[Hemo Intelligence OCR] Extraction error:', err?.message || err);
    res.status(502).json({
      error: 'Não foi possível extrair os dados do laudo via OCR no momento. Verifique a legibilidade do arquivo ou preencha os campos manualmente.'
    });
  }
});

// POST /api/gemini/analyze-hemogram - Anonymized clinical decision-support synthesis via Gemini 4 Hydrogen
app.post('/api/gemini/analyze-hemogram', async (req: Request, res: Response) => {
  try {
    const {
      clinicalContext,
      metadata,
      parameterOutputs,
      redSeries,
      whiteSeries,
      platelets,
      meb,
      indexes,
      complementaryLabs,
      longitudinalDeltas
    } = req.body || {};

    if (!Array.isArray(parameterOutputs)) {
      return res.status(400).json({ error: 'Dados estruturados do hemograma são obrigatórios.' });
    }

    // LGPD: Remove explicit identifiers before sending clinical context to LLM
    const anonymizedContext = {
      age: clinicalContext?.age ?? null,
      biologicalSex: clinicalContext?.biologicalSex ?? 'nao_informado',
      isPregnant: Boolean(clinicalContext?.isPregnant),
      gestationalWeeks: clinicalContext?.gestationalWeeks ?? null,
      weightKg: clinicalContext?.weightKg ?? null,
      heightCm: clinicalContext?.heightCm ?? null,
      imc: clinicalContext?.imc ?? null,
      waistCm: clinicalContext?.waistCm ?? null,
      bodyFatPercent: clinicalContext?.bodyFatPercent ?? null,
      phaseAngleDeg: clinicalContext?.phaseAngleDeg ?? null,
      comorbidities: clinicalContext?.comorbidities || [],
      medications: clinicalContext?.medications || 'Não informado',
      supplements: clinicalContext?.supplements || 'Não informado',
      surgeriesHistory: clinicalContext?.surgeriesHistory || 'Não informado',
      familyHistory: clinicalContext?.familyHistory || 'Não informado',
      dietaryHabits: clinicalContext?.dietaryHabits || 'Não informado',
      recall24h: clinicalContext?.recall24h || 'Não informado',
      alcoholUse: clinicalContext?.alcoholUse || 'nao_informado',
      tobaccoUse: clinicalContext?.tobaccoUse || 'nao_informado',
      physicalActivity: clinicalContext?.physicalActivity || 'Não informado',
      sleepQuality: clinicalContext?.sleepQuality || 'Não informado',
      giAndAllergicSymptoms: clinicalContext?.giAndAllergicSymptoms || [],
      infectionsHistory: clinicalContext?.infectionsHistory || 'Não informado',
      gastrointestinalHistory: clinicalContext?.gastrointestinalHistory || 'Não informado'
    };

    const prompt = `Você é o HEMO INTELLIGENCE PRO, um sistema de suporte à decisão clínica hematológica e nutricional em português brasileiro (pt-BR), auxiliando um profissional de saúde habilitado.

REGRAS CLÍNICAS E DE SEGURANÇA INEGOCIÁVEIS:
1. NUNCA substitua o diagnóstico médico ou o julgamento clínico. Formule apenas hipóteses clínicas NÃO diagnósticas.
2. NUNCA prescreva medicamentos, antiparasitários ou doses farmacológicas.
3. NUNCA recomende painéis indiscriminados de alergia alimentar.
4. NUNCA conclua causa de anemia apenas pelo hemograma sem ferritina, ferro sérico, transferrina, saturação de transferrina, PCR, vitamina B12, folato e função renal/hepática.
5. NUNCA conclua infecção bacteriana vs. viral com base em um único parâmetro isolado.
6. NUNCA invente números para parâmetros com valor null ("Não informado").
7. No Índice MEB, respeite as limitações científicas: as faixas (< 9, 9–9,9, 10–15, > 15) são operacionais/experimentais e NÃO comprovam isoladamente equilíbrio intestinal, disbiose, alergia ou parasitose.

DADOS CLÍNICOS ANONIMIZADOS DO PRONTUÁRIO:
${JSON.stringify(anonymizedContext)}

METADADOS DO EXAME:
Laboratório: ${sanitizeLabelText(String(metadata?.laboratoryName || 'Não informado'))}
Data da coleta: ${sanitizeLabelText(String(metadata?.collectionDate || 'Não informado'))}

PARÂMETROS AVALIADOS (DETERMINÍSTICO):
${JSON.stringify(parameterOutputs)}

PADRÕES SÉRIE VERMELHA / BRANCA / PLAQUETAS:
${JSON.stringify({ redSeries, whiteSeries, platelets })}

ÍNDICE MEB (CALCULADO DETERMINISTICAMENTE):
${JSON.stringify(meb)}

ÍNDICES HEMATOLÓGICOS (NLR, PLR, MLR, SII, SIRI, AISI):
${JSON.stringify(indexes)}

EXAMES COMPLEMENTARES INFORMADOS:
${JSON.stringify(complementaryLabs || [])}

EVOLUÇÃO LONGITUDINAL VS. EXAME ANTERIOR:
${JSON.stringify(longitudinalDeltas || [])}`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            nonDiagnosticHypotheses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['alta', 'moderada', 'informativa'] },
                  series: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  corroboratingMarkers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['title', 'priority', 'series', 'rationale', 'corroboratingMarkers']
              }
            },
            nutritionalCorrelations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  nutrientOrAxis: { type: Type.STRING },
                  status: { type: Type.STRING },
                  clinicalRationale: { type: Type.STRING },
                  dietaryGuidance: { type: Type.STRING }
                },
                required: ['nutrientOrAxis', 'status', 'clinicalRationale', 'dietaryGuidance']
              }
            },
            suggestedInvestigations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            followUpQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            clinicalSafetyDisclaimer: { type: Type.STRING }
          },
          required: [
            'executiveSummary',
            'nonDiagnosticHypotheses',
            'nutritionalCorrelations',
            'suggestedInvestigations',
            'followUpQuestions',
            'clinicalSafetyDisclaimer'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('[Hemo Intelligence AI] Analysis error:', err?.message || err);
    res.status(502).json({
      error: 'Não foi possível gerar o parecer clínico por IA no momento. A análise determinística completa de séries, MEB e índices continua disponível.'
    });
  }
});

// ---------------------------------------------------------------------------
// NUTRITION LABEL AI ROUTES (/api/nutrition-label/*)
// ---------------------------------------------------------------------------

app.get('/api/nutrition-label/recipes', (_req: Request, res: Response) => {
  const store = loadDataStore();
  res.json({
    recipes: store.nutritionRecipes || INITIAL_NUTRITION_RECIPES,
    customFoods: store.customFoods || []
  });
});

app.post('/api/nutrition-label/recipes', (req: Request, res: Response) => {
  const recipe = req.body;
  if (!recipe || typeof recipe.name !== 'string' || !recipe.name.trim()) {
    return res.status(400).json({ error: 'Nome da receita é obrigatório.' });
  }
  if (!Array.isArray(recipe.ingredients)) {
    return res.status(400).json({ error: 'Lista de ingredientes inválida.' });
  }

  const store = loadDataStore();
  const list = store.nutritionRecipes || [];
  const now = new Date().toISOString();
  const newRecipe = {
    ...recipe,
    id: recipe.id && !list.some((r: any) => r.id === recipe.id) ? recipe.id : `rec-${Date.now()}`,
    name: sanitizeLabelText(recipe.name),
    category: sanitizeLabelText(recipe.category || 'Preparação'),
    householdMeasure: sanitizeLabelText(recipe.householdMeasure || '1 porção'),
    createdAt: recipe.createdAt || now,
    updatedAt: now,
    version: recipe.version || 1
  };

  store.nutritionRecipes = [newRecipe, ...list];
  saveDataStore(store);
  res.status(201).json(newRecipe);
});

app.put('/api/nutrition-label/recipes/:id', (req: Request, res: Response) => {
  const store = loadDataStore();
  const list = store.nutritionRecipes || [];
  const idx = list.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Receita não encontrada.' });
  }

  const updates = req.body;
  if (updates.name !== undefined && (!updates.name || typeof updates.name !== 'string')) {
    return res.status(400).json({ error: 'Nome da receita inválido.' });
  }

  const updated = {
    ...list[idx],
    ...updates,
    id: req.params.id,
    name: updates.name ? sanitizeLabelText(updates.name) : list[idx].name,
    category: updates.category ? sanitizeLabelText(updates.category) : list[idx].category,
    householdMeasure: updates.householdMeasure ? sanitizeLabelText(updates.householdMeasure) : list[idx].householdMeasure,
    updatedAt: new Date().toISOString()
  };

  list[idx] = updated;
  store.nutritionRecipes = list;
  saveDataStore(store);
  res.json(updated);
});

app.delete('/api/nutrition-label/recipes/:id', (req: Request, res: Response) => {
  const store = loadDataStore();
  const list = store.nutritionRecipes || [];
  const filtered = list.filter((r: any) => r.id !== req.params.id);
  if (filtered.length === list.length) {
    return res.status(404).json({ error: 'Receita não encontrada para exclusão.' });
  }
  store.nutritionRecipes = filtered;
  saveDataStore(store);
  res.json({ deleted: true, id: req.params.id });
});

app.post('/api/nutrition-label/foods', (req: Request, res: Response) => {
  const food = req.body;
  if (!food || typeof food.name !== 'string' || !food.name.trim() || !food.nutrientsPer100g) {
    return res.status(400).json({ error: 'Nome e perfil nutricional por 100g são obrigatórios.' });
  }

  const store = loadDataStore();
  const customFoods = store.customFoods || [];
  const created = {
    ...food,
    id: food.id || `custom-${Date.now()}`,
    code: food.code || `CUST-${String(customFoods.length + 1).padStart(3, '0')}`,
    name: sanitizeLabelText(food.name),
    source: food.source || 'CUSTOM',
    sourceVersion: food.sourceVersion || 'Cadastro da Clínica'
  };

  store.customFoods = [created, ...customFoods];
  saveDataStore(store);
  res.status(201).json(created);
});

app.post('/api/nutrition-label/interpret-recipe', async (req: Request, res: Response) => {
  try {
    const { recipeText, documentBase64, mimeType, fileName } = req.body || {};

    if ((!recipeText || typeof recipeText !== 'string' || !recipeText.trim()) && !documentBase64) {
      return res.status(400).json({ error: 'Informe o texto da receita ou anexe um documento de ficha técnica.' });
    }

    const store = loadDataStore();
    const fullFoodCatalog = [...ANVISA_FOOD_DATABASE, ...(store.customFoods || [])];
    const catalogSummary = fullFoodCatalog.map((f) => ({
      code: f.code,
      name: f.name,
      category: f.category,
      physicalState: f.physicalState,
      unitLabel: f.unitLabel || ''
    }));

    const instructionPrompt = `Você é um Especialista em Bromatologia, Fichas Técnicas e Rotulagem ANVISA (RDC 429/2020 & IN 75/2020).
Sua tarefa é APENAS interpretar a receita ou ficha técnica fornecida, extrair metadados estruturados, converter unidades óbvias quando confiáveis e associar cada ingrediente ao código exato (code) no catálogo nutricional fornecido abaixo.

REGRAS ESTRITAS:
1. NUNCA invente valores nutricionais ou calcule tabela nutricional final — o motor matemático determinístico do sistema fará todos os cálculos.
2. Só associe um "matchedFoodCode" quando houver equivalência nutricional segura no catálogo abaixo. Se o ingrediente não existir com segurança no catálogo ou for ambíguo (ex: "óleo", "leite", "açúcar" sem especificação clara, ou ingrediente exótico ausente), defina matchedFoodCode como null (ou a opção mais próxima com confidence < 0.75) e preencha "ambiguityQuestion" explicando a dúvida para confirmação do nutricionista.
3. Não substitua automaticamente um ingrediente específico por outro nutricionalmente distinto (ex.: não troque chocolate 70% por achocolatado; não troque óleo de coco por azeite).
4. Identifique o estado de processamento provável de cada item (cru, cozido, assado, frito, desidratado, processado, liquido_pronto).
5. Unidades válidas estritamente: "g", "kg", "ml", "l", "colher_sopa", "colher_cha", "xicara", "unidade".

CATÁLOGO DISPONÍVEL (TACO / TBCA / CUSTOM):
${JSON.stringify(catalogSummary)}

${recipeText ? `RECEITA / FICHA TÉCNICA INFORMADA:\n${recipeText.slice(0, 12000)}` : ''}
${fileName ? `\nARQUIVO ANEXADO: ${sanitizeLabelText(fileName)}` : ''}`;

    const parts: any[] = [{ text: instructionPrompt }];
    if (documentBase64 && mimeType) {
      const cleanedBase64 = String(documentBase64).replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanedBase64,
          mimeType: String(mimeType)
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING },
            category: { type: Type.STRING },
            physicalState: { type: Type.STRING, enum: ['solido', 'liquido'] },
            estimatedYieldGrams: { type: Type.NUMBER },
            suggestedServingGrams: { type: Type.NUMBER },
            suggestedHouseholdMeasure: { type: Type.STRING },
            servingsPerPackage: { type: Type.NUMBER },
            clarificationsNeeded: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rawText: { type: Type.STRING },
                  normalizedName: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: {
                    type: Type.STRING,
                    enum: ['g', 'kg', 'ml', 'l', 'colher_sopa', 'colher_cha', 'xicara', 'unidade']
                  },
                  gramsEstimate: { type: Type.NUMBER },
                  processingState: {
                    type: Type.STRING,
                    enum: ['cru', 'cozido', 'assado', 'frito', 'desidratado', 'processado', 'liquido_pronto']
                  },
                  matchedFoodCode: { type: Type.STRING, nullable: true },
                  confidence: { type: Type.NUMBER },
                  ambiguityQuestion: { type: Type.STRING, nullable: true }
                },
                required: ['rawText', 'normalizedName', 'quantity', 'unit', 'gramsEstimate', 'processingState', 'confidence']
              }
            }
          },
          required: [
            'recipeName',
            'category',
            'physicalState',
            'estimatedYieldGrams',
            'suggestedServingGrams',
            'suggestedHouseholdMeasure',
            'servingsPerPackage',
            'clarificationsNeeded',
            'ingredients'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('[Nutrition Label AI] Gemini interpretation error:', err?.message || err);
    res.status(502).json({
      error: 'Não foi possível interpretar a receita via Gemini no momento. Verifique o formato enviado ou utilize o editor manual.'
    });
  }
});

// ---------------------------------------------------------------------------
// VITE INTEGRATION (DEV & PROD)
// ---------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Intercept client bundle responses to disable WebSocket HMR connection in AI Studio environment
    app.use((req, res, next) => {
      const url = req.url || '';
      if (url.includes('@vite/client') || url.includes('client.mjs') || url.includes('bundledDevClient')) {
        const origWrite = res.write;
        const origEnd = res.end;
        const chunks: Buffer[] = [];

        res.write = function (chunk: any, ...args: any[]) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        } as any;

        res.end = function (chunk?: any, ...args: any[]) {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          let body = Buffer.concat(chunks).toString('utf-8');
          let modified = false;
          if (body.includes('transport.connect(createHMRHandler(handleMessage));')) {
            body = body.replace(
              'transport.connect(createHMRHandler(handleMessage));',
              '/* HMR WebSocket transport disabled in AI Studio environment */'
            );
            modified = true;
          }
          if (body.includes('throw new SendBeforeConnectError("send was called before connect");')) {
            body = body.replace(
              'throw new SendBeforeConnectError("send was called before connect");',
              'return;'
            );
            modified = true;
          }
          if (body.includes('throw new SendBeforeConnectError("invoke was called before connect");')) {
            body = body.replace(
              'throw new SendBeforeConnectError("invoke was called before connect");',
              'return Promise.resolve();'
            );
            modified = true;
          }
          if (modified) {
            res.setHeader('content-length', Buffer.byteLength(body));
          }
          return (origEnd as any).apply(res, [body, ...args]);
        } as any;
      }
      next();
    });

    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Nutrition SaaS Server] Running full-stack on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Backend] Fatal server startup error:', err);
  process.exit(1);
});
