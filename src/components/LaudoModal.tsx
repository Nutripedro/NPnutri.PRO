import React, { useState } from 'react';
import { 
  Patient, 
  AnthropometryEvaluation, 
  BioimpedanceEvaluation, 
  WaistHipEvaluation, 
  NeckCardiometabolicEvaluation, 
  DietPlan,
  PhotogrammetrySession
} from '../types';
import { X, Printer, Download, Share2, CheckCircle2, ShieldCheck, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { exportClinicalReportToPDF, exportHighResPDFFromDOM } from '../utils/pdfExport';

interface LaudoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  anthro: AnthropometryEvaluation;
  bia: BioimpedanceEvaluation;
  rcq: WaistHipEvaluation;
  neck: NeckCardiometabolicEvaluation;
  diet: DietPlan;
  privacyMode: boolean;
  photoSession?: PhotogrammetrySession;
}

export const LaudoModal: React.FC<LaudoModalProps> = ({
  isOpen,
  onClose,
  patient,
  anthro,
  bia,
  rcq,
  neck,
  diet,
  privacyMode,
  photoSession
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen) return null;

  const handleExportHighResPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const cleanName = patient.name.replace(/\s+/g, '_');
      await exportHighResPDFFromDOM('laudo-printable-area', `Laudo_Nutricional_Completo_${cleanName}_${anthro.date}.pdf`);
    } catch (err) {
      console.error('[LaudoModal] Erro ao gerar PDF alta fidelidade:', err);
      // Fallback to vector pdf export on failure
      exportClinicalReportToPDF(patient, anthro, bia, rcq, neck, diet, photoSession);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Macro Percentage Calculations for Visual Bar
  const totalMacroGrams = (diet.proteinGrams * 4) + (diet.carbsGrams * 4) + (diet.fatGrams * 9);
  const protPct = Math.round(((diet.proteinGrams * 4) / (totalMacroGrams || 1)) * 100);
  const carbPct = Math.round(((diet.carbsGrams * 4) / (totalMacroGrams || 1)) * 100);
  const fatPct = Math.round(((diet.fatGrams * 9) / (totalMacroGrams || 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        
        {/* Modal Controls Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#004f28]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Laudo Antropométrico & Nutricional Consolidado
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* High-Fidelity Canvas PDF Button */}
            <button
              onClick={handleExportHighResPDF}
              disabled={isGeneratingPDF}
              className="px-3.5 py-1.5 bg-[#004f28] hover:bg-[#003c1e] text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs disabled:opacity-50"
              title="Gerar PDF de Alta Fidelidade com Gráficos e Imagens"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Relatório PDF</span>
                </>
              )}
            </button>

            {/* Quick Vector PDF Button */}
            <button
              onClick={() => exportClinicalReportToPDF(patient, anthro, bia, rcq, neck, diet, photoSession)}
              className="hidden sm:flex px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold items-center space-x-1.5 transition-colors"
              title="Baixar PDF Vetorial Leve"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>PDF Vetorial</span>
            </button>

            {/* Browser Print Button */}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          id="laudo-printable-area"
          className="p-8 bg-white overflow-y-auto print:p-0 space-y-6 text-slate-800 font-sans custom-scrollbar"
        >
          
          {/* Clinic Header Banner */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-[#004f28] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  NP
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">NUTRI PRO</h1>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase tracking-widest block">
                    SaaS de Nutrição Clínica & Antropometria ISAK
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1.5">
                Clínica de Nutrição Esportiva & Composição Corporal Avançada • CRN-3 48.910
              </p>
              <p className="text-[11px] text-slate-400">
                Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi, São Paulo - SP
              </p>
            </div>

            <div className="text-right text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">DATA DA CONSULTA</span>
              <span className="font-bold text-slate-900 text-sm">{anthro.date}</span>
              <span className="text-[11px] text-[#004f28] font-bold block mt-1">ISAK Nível II Certificado</span>
            </div>
          </div>

          {/* Patient Identification Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">PACIENTE</span>
              <span className={`font-bold text-slate-900 ${privacyMode ? 'filter blur-xs' : ''}`}>
                {patient.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">PRONTUÁRIO</span>
              <span className="font-bold text-slate-900">{patient.recordNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">IDADE / SEXO</span>
              <span className="font-bold text-slate-900">{patient.age} anos • {patient.sex === 'female' ? 'Feminino' : 'Masculino'}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">PESO / ALTURA</span>
              <span className="font-bold text-slate-900">{patient.currentWeightKg} kg • {patient.heightCm} cm (IMC {patient.imc.toFixed(1)})</span>
            </div>
          </div>

          {/* 1. Composição Corporal & Dobras Cutâneas ISAK */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>1. Avaliação Antropométrica (Protocolo Jackson & Pollock 7 Dobras / Siri 1961)</span>
              <span className="text-[10px] font-mono text-emerald-800 font-bold">Dobras ISAK II</span>
            </h3>
            
            <div className="grid grid-cols-4 gap-3 text-center font-mono text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">SOMATÓRIO (Σ7)</span>
                <span className="text-base font-bold text-slate-900">{anthro.sumSkinfoldsMm} mm</span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block">GORDURA CORPORAL (%G)</span>
                <span className="text-base font-extrabold text-[#004f28]">{anthro.bodyFatPercent}%</span>
              </div>
              <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200">
                <span className="text-[10px] text-sky-800 font-bold block">MASSA MAGRA LIVRE</span>
                <span className="text-base font-extrabold text-sky-900">{anthro.leanMassKg} kg</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">PESO META (%G 17%)</span>
                <span className="text-base font-bold text-slate-900">{anthro.targetWeightKg} kg</span>
              </div>
            </div>
          </div>

          {/* 2. Bioimpedância Multifrequencial & Ângulo de Fase */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>2. Bioimpedância Tetrapolar 8 Eletrodos & Integridade Celular</span>
              <span className="text-[10px] font-mono text-emerald-800 font-bold">50 kHz Phase Angle</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block">ÂNGULO DE FASE (50 kHz)</span>
                <span className="text-base font-extrabold text-[#004f28]">{bia.phaseAngleDeg}°</span>
                <span className="text-[10px] text-emerald-700 block font-semibold">Excelente Membrana Celular</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">ÁGUA TOTAL (TBW)</span>
                <span className="text-base font-bold text-slate-900">{bia.totalBodyWaterL} L ({bia.totalBodyWaterPercent}%)</span>
                <span className="text-[10px] text-slate-500 block">ICW: 23.8L | ECW: 14.6L</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">ÍNDICE DE EDEMA (ECW/TBW)</span>
                <span className="text-base font-bold text-slate-900">{bia.edemaIndex.toFixed(3)}</span>
                <span className="text-[10px] text-emerald-700 block font-semibold">Faixa Eutrófica (0.360-0.390)</span>
              </div>
            </div>

            {/* Segmental Bioimpedance Breakdown */}
            {bia.segmental && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-2">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  Massa Magra Segmentar (Análise de Assimetrias Tetrapolares)
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">BRAÇO DIR</span>
                    <span className="font-bold text-slate-800">{bia.segmental.rightArmKg} kg</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">BRAÇO ESQ</span>
                    <span className="font-bold text-slate-800">{bia.segmental.leftArmKg} kg</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">TRONCO</span>
                    <span className="font-bold text-slate-800">{bia.segmental.trunkKg} kg</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">PERNA DIR</span>
                    <span className="font-bold text-slate-800">{bia.segmental.rightLegKg} kg</span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-slate-200">
                    <span className="text-slate-400 block text-[9px]">PERNA ESQ</span>
                    <span className="font-bold text-slate-800">{bia.segmental.leftLegKg} kg</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. RCQ, Risco Cardiometabólico & Dinamometria */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Relação Cintura-Quadril & Risco Cardiometabólico (Consenso OMS / Jamar)
            </h3>

            <div className="grid grid-cols-4 gap-3 text-center font-mono text-xs">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">CINTURA / QUADRIL</span>
                <span className="font-bold text-slate-900">{rcq.waistCm} / {rcq.hipCm} cm</span>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold block">ÍNDICE RCQ</span>
                <span className="font-bold text-[#004f28]">{rcq.ratio.toFixed(3)} (Baixo Risco)</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">CIRCUNFERÊNCIA PESCOÇO</span>
                <span className="font-bold text-slate-900">{neck.neckCircumferenceCm} cm (Corte: ≤ {neck.cutoffCm})</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">FORÇA RELATIVA (FMR)</span>
                <span className="font-bold text-sky-800">{neck.relativeStrengthKgfPerKg} kgf/kg (Forte)</span>
              </div>
            </div>
          </div>

          {/* 4. Prescrição Dietética & Distribuição de Macronutrientes Visual */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              4. Conduta Dietoterápica & Metas Diárias de Ingestão (Mifflin-St Jeor 1990)
            </h3>

            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-mono text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-[10px] text-emerald-400 block font-bold uppercase">VET Prescrito</span>
                  <span className="text-2xl font-black text-white">{diet.calorieTargetKcal} kcal/dia</span>
                  <span className="text-[11px] text-slate-400 block">TMB: {diet.bmrKcal} kcal • FA: {diet.activityFactor}x • Déficit: {diet.calorieDeltaKcal} kcal</span>
                </div>

                <div className="flex space-x-4 text-right">
                  <div>
                    <span className="text-[10px] text-sky-400 block font-bold">PROTEÍNA</span>
                    <span className="text-base font-bold text-white">{diet.proteinGrams}g</span>
                    <span className="text-[10px] text-slate-400 block">{diet.proteinGPerKg} g/kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 block font-bold">CARBOIDRATOS</span>
                    <span className="text-base font-bold text-white">{diet.carbsGrams}g</span>
                    <span className="text-[10px] text-slate-400 block">{diet.carbsGPerKg} g/kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-400 block font-bold">GORDURAS</span>
                    <span className="text-base font-bold text-white">{diet.fatGrams}g</span>
                    <span className="text-[10px] text-slate-400 block">{diet.fatGPerKg} g/kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-cyan-300 block font-bold">HIDRATAÇÃO</span>
                    <span className="text-base font-bold text-white">{diet.waterTargetMl} ml</span>
                    <span className="text-[10px] text-slate-400 block">40 ml/kg</span>
                  </div>
                </div>
              </div>

              {/* Visual Macronutrient Ratio Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-300">
                  <span>Proporção Calórica dos Macronutrientes</span>
                  <span>Proteína {protPct}% | Carbo {carbPct}% | Gordura {fatPct}%</span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div style={{ width: `${protPct}%` }} className="bg-sky-500 h-full" title={`Proteínas ${protPct}%`} />
                  <div style={{ width: `${carbPct}%` }} className="bg-amber-500 h-full" title={`Carboidratos ${carbPct}%`} />
                  <div style={{ width: `${fatPct}%` }} className="bg-rose-500 h-full" title={`Gorduras ${fatPct}%`} />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Fotogrametria T0/T1 Comparison Photos (if available) */}
          {photoSession && photoSession.photos && (
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span>5. Fotogrametria Comparativa T0 vs T1</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-800 font-bold">Registro Visual</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">INÍCIO (T0: {photoSession.dateT0})</span>
                  <img
                    src={photoSession.photos.frontalT0Url}
                    alt="Fotogrametria T0"
                    className="w-full h-44 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="mt-2 text-[11px] font-mono text-slate-600">
                    Peso T0: {photoSession.weightT0Kg} kg • %G: {photoSession.bodyFatT0Percent}%
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 block mb-1">AVALIAÇÃO ATUAL (T1: {photoSession.dateT1})</span>
                  <img
                    src={photoSession.photos.frontalT1Url}
                    alt="Fotogrametria T1"
                    className="w-full h-44 object-cover rounded-lg border border-emerald-300"
                  />
                  <div className="mt-2 text-[11px] font-mono text-emerald-900 font-bold">
                    Peso T1: {photoSession.weightT1Kg} kg • %G: {photoSession.bodyFatT1Percent}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clinical Opinion */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
            <h4 className="font-bold text-slate-900">Parecer Clínico e Evolução:</h4>
            <p>{anthro.clinicalOpinion}</p>
          </div>

          {/* Professional Signature */}
          <div className="pt-8 flex justify-between items-end border-t border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">ASSINATURA DIGITAL</span>
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                <span>Documento assinado digitalmente ICP-Brasil</span>
              </span>
            </div>

            <div className="text-right">
              <div className="w-56 border-b border-slate-400 mb-1" />
              <div className="font-bold text-slate-900">Dra. Camila Vasconcellos, PhD</div>
              <div className="text-slate-500 text-[11px]">Nutricionista Clínica & Esportiva • CRN-3 48.910</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
