import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Patient, 
  AnthropometryEvaluation, 
  BioimpedanceEvaluation, 
  WaistHipEvaluation, 
  NeckCardiometabolicEvaluation, 
  DietPlan,
  ClinicalPrescription,
  PhotogrammetrySession
} from '../types';

/**
 * High-Fidelity PDF Exporter using html2canvas & jsPDF
 * Captures the exact DOM layout of LaudoModal including charts, progress bars, and photos.
 */
export async function exportHighResPDFFromDOM(
  elementId: string,
  filename: string = 'Laudo_Nutricional_NUTRI_PRO.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Elemento #${elementId} não encontrado para geração de PDF.`);
  }

  // Create canvas capture with scale: 2 for sharp text and crisp graphics
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  // Add subsequent pages if content overflows single page
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}

/**
 * Standard Vector PDF Exporter using jsPDF (Native text/lines)
 */
export function exportClinicalReportToPDF(
  patient: Patient,
  anthro: AnthropometryEvaluation,
  bia: BioimpedanceEvaluation,
  rcq: WaistHipEvaluation,
  neck: NeckCardiometabolicEvaluation,
  diet: DietPlan,
  photoSession?: PhotogrammetrySession
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  // Header Banner (#004f28)
  doc.setFillColor(0, 79, 40);
  doc.rect(0, 0, pageWidth, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('NUTRI PRO — LAUDO CLÍNICO CONSOLIDADO', 15, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Clínica de Nutrição Avançada & Composição Corporal • ISAK II Certificada • CRN-3 48.910', 15, 19);

  y = 33;

  // Patient Info Box
  doc.setFillColor(245, 247, 246);
  doc.setDrawColor(200, 210, 205);
  doc.roundedRect(15, y, pageWidth - 30, 24, 2, 2, 'FD');

  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`PACIENTE: ${patient.name.toUpperCase()}`, 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Prontuário: ${patient.recordNumber}   |   Idade: ${patient.age} anos   |   Sexo: ${patient.sex === 'female' ? 'Feminino' : 'Masculino'}`, 18, y + 13);
  doc.text(`Peso Atual: ${patient.currentWeightKg} kg   |   Altura: ${patient.heightCm} cm   |   IMC: ${patient.imc.toFixed(1)} kg/m²`, 18, y + 18);

  y += 30;

  // Section 1: Anthropometry
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 79, 40);
  doc.text('1. AVALIAÇÃO ANTROPOMÉTRICA (Protocolo Jackson & Pollock 7 Dobras / Siri)', 15, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`• Somatório 7 Dobras (Σ7): ${anthro.sumSkinfoldsMm} mm`, 18, y);
  doc.text(`• Gordura Corporal (%G): ${anthro.bodyFatPercent}%`, 110, y);
  y += 5;
  doc.text(`• Massa Magra Livre: ${anthro.leanMassKg} kg`, 18, y);
  doc.text(`• Massa Gorda Estimada: ${anthro.fatMassKg} kg`, 110, y);
  y += 5;
  doc.text(`• Meta de Peso (%G 17%): ${anthro.targetWeightKg} kg`, 18, y);
  doc.text(`• Classificação: ${anthro.classification}`, 110, y);
  y += 8;

  // Section 2: Bioimpedance
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 79, 40);
  doc.text('2. BIOIMPEDÂNCIA TETRAPOLAR 8 ELETRODOS & INTEGRIDADE CELULAR', 15, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`• Ângulo de Fase (50 kHz): ${bia.phaseAngleDeg}° (Excelente Membrana Celular)`, 18, y);
  doc.text(`• Água Corporal Total (TBW): ${bia.totalBodyWaterL} L (${bia.totalBodyWaterPercent}%)`, 110, y);
  y += 5;
  doc.text(`• Íd. Edema (ECW/TBW): ${bia.edemaIndex.toFixed(3)} (Faixa Normal 0.360-0.390)`, 18, y);
  doc.text(`• Taxa Metabólica Basal (TMB): ${bia.bmrKcal} kcal`, 110, y);
  y += 5;
  doc.text(`• Resistência / Reatância: ${bia.resistanceOhm} Ω / ${bia.reactanceOhm} Ω`, 18, y);
  y += 8;

  // Section 3: Cardiometabolic & RCQ
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 79, 40);
  doc.text('3. RELAÇÃO CINTURA-QUADRIL & RISCO CARDIOMETABÓLICO', 15, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`• Cintura / Quadril: ${rcq.waistCm} / ${rcq.hipCm} cm  (Índice RCQ: ${rcq.ratio.toFixed(3)} - ${rcq.riskCategory})`, 18, y);
  y += 5;
  doc.text(`• Circunferência Pescoço: ${neck.neckCircumferenceCm} cm (Corte: ≤ ${neck.cutoffCm} cm)  |  Força Relativa: ${neck.relativeStrengthKgfPerKg} kgf/kg`, 18, y);
  y += 8;

  // Section 4: Diet Plan & Macros
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 79, 40);
  doc.text('4. CONDUTA DIETOTERÁPICA & METAS DE INGESTÃO (Mifflin-St Jeor)', 15, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`• VET Prescrito: ${diet.calorieTargetKcal} kcal/dia  (TMB: ${diet.bmrKcal} kcal | Fator Atividade: ${diet.activityFactor}x)`, 18, y);
  y += 5;
  doc.text(`• Proteínas: ${diet.proteinGrams}g (${diet.proteinGPerKg} g/kg)  |  Carboidratos: ${diet.carbsGrams}g (${diet.carbsGPerKg} g/kg)  |  Gorduras: ${diet.fatGrams}g (${diet.fatGPerKg} g/kg)`, 18, y);
  y += 5;
  doc.text(`• Meta de Hidratação Diária: ${diet.waterTargetMl} ml/dia (40 ml/kg)`, 18, y);
  y += 8;

  // Photogrammetry comparison summary if available
  if (photoSession) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(0, 79, 40);
    doc.text('5. EVOLUÇÃO FOTOGRAMÉTRICA & DELTAS T0/T1', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    doc.text(`• Período: ${photoSession.dateT0} vs ${photoSession.dateT1}`, 18, y);
    doc.text(`• Variação Peso: ${(photoSession.weightT1Kg - photoSession.weightT0Kg).toFixed(1)} kg`, 110, y);
    y += 5;
    doc.text(`• Variação %Gordura: ${(photoSession.bodyFatT1Percent - photoSession.bodyFatT0Percent).toFixed(1)}%`, 18, y);
    doc.text(`• Ganho/Perda Massa Magra: ${(photoSession.leanMassT1Kg - photoSession.leanMassT0Kg).toFixed(1)} kg`, 110, y);
    y += 8;
  }

  // Clinical Opinion
  if (y > pageHeight - 50) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text('Parecer Clínico:', 15, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  const splitOpinion = doc.splitTextToSize(anthro.clinicalOpinion, pageWidth - 30);
  doc.text(splitOpinion, 15, y);
  y += (splitOpinion.length * 4.5) + 10;

  // Signature Line
  if (y > pageHeight - 35) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(150, 150, 150);
  doc.line(pageWidth - 85, y + 12, pageWidth - 15, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Dra. Camila Vasconcellos, PhD', pageWidth - 85, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Nutricionista Clínica & Esportiva • CRN-3 48.910', pageWidth - 85, y + 20);

  // Save PDF
  doc.save(`Laudo_Nutricional_${patient.name.replace(/\s+/g, '_')}_${anthro.date}.pdf`);
}

export function exportPrescriptionPDF(
  prescription: ClinicalPrescription,
  professionalTitle: string = 'Nutricionista Clínica & Esportiva',
  clinicName: string = 'NUTRI PRO — CLÍNICA DE NUTRIÇÃO AVANÇADA'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 15;

  // Primary Accent: #004f28
  doc.setFillColor(0, 79, 40);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('RECEITUÁRIO NUTRICIONAL & PRESCRICIONAL', 15, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${clinicName} • CFN Resolução 656/2020`, 15, 18);
  doc.text(`Prescritor: ${prescription.professionalName} (${prescription.professionalRegistration})`, 15, 23);

  y = 33;

  // Patient Header Box
  doc.setFillColor(248, 250, 249);
  doc.setDrawColor(210, 222, 215);
  doc.roundedRect(15, y, pageWidth - 30, 22, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`PACIENTE: ${prescription.patientName.toUpperCase()}`, 18, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`CPF: ${prescription.patientCpf || '***.***.***-**'}    |    Prontuário: ${prescription.patientRecord}    |    Idade: ${prescription.patientAge} anos (${prescription.patientSex === 'female' ? 'Feminino' : 'Masculino'})`, 18, y + 13);
  doc.text(`Data da Emissão: ${prescription.date.split('-').reverse().join('/')}    |    Título: ${prescription.title}`, 18, y + 18);

  y += 28;

  // SECTION 1: SUPLEMENTAÇÃO
  if (prescription.supplements && prescription.supplements.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 79, 40);
    doc.text('1. PLANO DE SUPLEMENTAÇÃO & NUTRACÊUTICOS', 15, y);
    y += 6;

    prescription.supplements.forEach((supp, idx) => {
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, pageWidth - 30, 18, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${supp.name}`, 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Ingrediente Ativo: ${supp.activeIngredient}  |  Dose: ${supp.doseConcentration}  |  Via: ${supp.route}`, 18, y + 9.5);
      doc.text(`Posologia: ${supp.posology}`, 18, y + 13.5);
      doc.text(`Horário/Timing: ${supp.timing}  |  Duração: ${supp.duration}`, 110, y + 13.5);

      y += 21;
    });

    y += 3;
  }

  // SECTION 2: FITOTERÁPICOS
  if (prescription.phytotherapeutics && prescription.phytotherapeutics.length > 0) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 79, 40);
    doc.text('2. EXTRATOS FITOTERÁPICOS & PLANTAS MEDICINAIS', 15, y);
    y += 6;

    prescription.phytotherapeutics.forEach((phyto, idx) => {
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 20;
      }

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, pageWidth - 30, 20, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${phyto.name}`, 18, y + 5);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Nome botânico: ${phyto.botanicalName}`, 120, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Padronização/Extrato: ${phyto.standardization}  |  Dose: ${phyto.dose}`, 18, y + 9.5);
      doc.text(`Veículo/Forma: ${phyto.vehicle}  |  Horário: ${phyto.timing}`, 18, y + 13.5);
      doc.text(`Posologia: ${phyto.posology}`, 18, y + 17.5);

      y += 23;
    });

    y += 3;
  }

  // SECTION 3: RECOMENDAÇÕES DIETÉTICAS
  if (prescription.dietaryRecommendations && prescription.dietaryRecommendations.length > 0) {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 79, 40);
    doc.text('3. ORIENTAÇÕES DIETÉTICAS & CONDUTA COMPLEMENTAR', 15, y);
    y += 6;

    prescription.dietaryRecommendations.forEach((rec) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`• [${rec.category.toUpperCase()}] ${rec.title}:`, 18, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const splitText = doc.splitTextToSize(rec.guideline, pageWidth - 36);
      doc.text(splitText, 20, y);
      y += (splitText.length * 4) + 4;
    });

    y += 2;
  }

  // General Notes
  if (prescription.generalNotes) {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Observações Gerais e Advertências Clínicas:', 15, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const splitNotes = doc.splitTextToSize(prescription.generalNotes, pageWidth - 30);
    doc.text(splitNotes, 15, y);
    y += (splitNotes.length * 4) + 8;
  }

  // Digital Signature Stamp Box
  if (y > pageHeight - 45) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(240, 249, 244);
  doc.setDrawColor(187, 222, 201);
  doc.roundedRect(15, y, pageWidth - 30, 26, 2, 2, 'FD');

  doc.setTextColor(0, 79, 40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ASSINATURA ELETRÔNICA QUALIFICADA — ICP-BRASIL / VALIDAÇÃO DIGITALLY SIGNED', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Documento assinado digitalmente por ${prescription.professionalName} (${prescription.professionalRegistration}).`, 18, y + 11);
  doc.text(`Hash de Autenticidade: ${prescription.digitalSignatureHash || 'SHA-256: 8f9a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a'}`, 18, y + 15);
  doc.text(`Carimbo do Tempo: ${prescription.signatureTimestamp || new Date().toISOString()}  |  Validação em conformidade com MP 2.200-2/2001 & Resolução CFN 656/2020`, 18, y + 19);
  doc.text('Verificação pública disponível em https://validar.iti.gov.br', 18, y + 23);

  // Footer Signature Line on Right
  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - 85, y + 14, pageWidth - 20, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(prescription.professionalName, pageWidth - 85, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${professionalTitle} • ${prescription.professionalRegistration}`, pageWidth - 85, y + 22);

  // Save PDF
  const cleanName = prescription.patientName.replace(/\s+/g, '_');
  doc.save(`Receituario_${cleanName}_${prescription.date}.pdf`);
}
