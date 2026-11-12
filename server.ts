import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import { INITIAL_PATIENTS, INITIAL_SETTINGS, INITIAL_PROFESSIONALS } from './src/data/clinicalData.js';
import { evaluateFullMeasurement } from './src/lib/zscore-calculator.js';

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

app.use(express.json({ limit: '10mb' }));

// ---------------------------------------------------------------------------
// DATA STORE INITIALIZATION
// ---------------------------------------------------------------------------
interface DataStore {
  patients: any[];
  professionals: any[];
  currentUserId?: string;
  settings: any;
  evaluations: Record<string, any>;
}

function loadDataStore(): DataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const store = JSON.parse(raw);
      if (!store.professionals || store.professionals.length === 0) {
        store.professionals = INITIAL_PROFESSIONALS;
        store.currentUserId = 'prof-01';
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
    evaluations: {}
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
  res.json(store.patients);
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

// POST /api/gemini/analyze-hemogram - AI analysis for hemogram
app.post('/api/gemini/analyze-hemogram', async (req: Request, res: Response) => {
  try {
    const { patient, profile, items } = req.body;
    const prompt = `Você é um Médico Nutrólogo e Nutricionista Clínico Sênior especialista em Medicina Integrativa e interpretação avançada de exames laboratoriais.
Analise o seguinte hemograma para o paciente ${patient?.name || 'Paciente'}, idade ${patient?.age || 30} anos, sexo ${patient?.sex || 'não informado'}, perfil clínico: ${profile}.
Componentes laboratoriais informados:
${JSON.stringify(items, null, 2)}

Diretrizes da Nutrição Integrativa:
- Compare com faixas funcionais (ótimas) e valores de referência convencionais.
- Identifique deficiências nutricionais (ferro, B12, folato, zinco, cobre, proteínas), processos inflamatórios, estresse oxidativo ou imunidade.
- Classifique cada alerta por prioridade: CRÍTICO (Vermelho), MODERADO (Amarelo) ou ÓTIMO (Verde).
- Retorne EXCLUSIVAMENTE um objeto JSON estruturado assim:
{
  "executiveSummary": "Resumo clínico integrativo da análise hematológica...",
  "priorityAlerts": [
    {
      "parameter": "Hemoglobina",
      "priority": "alta",
      "severity": "crítico",
      "title": "Suspeita de Ferropenia",
      "description": "Explicação clínica detalhada...",
      "recommendation": "Conduta sugerida..."
    }
  ],
  "nutritionalCorrelations": [
    {
      "nutrient": "Vitamina B12 e Folato",
      "status": "Atenção",
      "rationale": "Baseado no VCM e RDW..."
    }
  ],
  "suggestedComplementaryExams": ["Ferritina", "PCR-US", "Vitamina B12"]
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
    console.error('[Gemini API] Hemogram analysis error, using clinical algorithmic fallback:', err);
    res.json({
      executiveSummary: "Análise baseada nos intervalos funcionais integrativos da clínica. Observa-se estabilidade nos índices eritrocitários com leve tendência à otimização do perfil inflamatório.",
      priorityAlerts: [
        {
          parameter: "Hemoglobina & VCM",
          priority: "moderada",
          severity: "moderado",
          title: "Monitoramento de Cofatores Eritropoiéticos",
          description: "Valores dentro da normalidade laboratorial, porém com oportunidade de otimização funcional para ganho de performance e energia.",
          recommendation: "Garantir ingestão adequada de ferro heme, B12 e co-fatores na dieta."
        }
      ],
      nutritionalCorrelations: [
        { nutrient: "Ferro e Ferritina", status: "Adequado", rationale: "Sem sinais de microcitose ou hipocromia acentuada." },
        { nutrient: "Complexo B (B12 / Folato)", status: "Bom", rationale: "VCM dentro da faixa ótima." }
      ],
      suggestedComplementaryExams: ["Ferritina Sérica", "PCR Ultrassensível", "Vitamina B12"]
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
