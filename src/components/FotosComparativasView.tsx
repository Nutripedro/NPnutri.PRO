import React, { useState, useEffect } from 'react';
import { Patient, PhotogrammetrySession } from '../types';
import { 
  Camera, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Play, 
  Pause, 
  Download, 
  CheckCircle2, 
  Grid, 
  Sliders,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Loader2,
  BrainCircuit
} from 'lucide-react';

interface FotosComparativasViewProps {
  patient: Patient;
  session: PhotogrammetrySession;
  onSaveToLaudo: () => void;
}

interface AIAnalysisResult {
  resumo: string;
  analise_detalhada: string[];
  conclusao_clinica: string;
}

export const FotosComparativasView: React.FC<FotosComparativasViewProps> = ({
  patient,
  session,
  onSaveToLaudo
}) => {
  const [mode, setMode] = useState<'ghosting' | 'split' | 'angles'>('ghosting');
  const [opacity, setOpacity] = useState<number>(50); // 0 to 100%
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [splitPosition, setSplitPosition] = useState<number>(50);
  const [activeAngle, setActiveAngle] = useState<'frontal' | 'perfil_d' | 'perfil_e' | 'posterior'>('frontal');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const response = await fetch('/api/gemini/analyze-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoT0: session.photos.frontalT0Url,
          photoT1: session.photos.frontalT1Url,
          patientData: {
            name: patient.name,
            weightT0: session.weightT0Kg,
            weightT1: session.weightT1Kg,
            bfT0: session.bodyFatT0Percent,
            bfT1: session.bodyFatT1Percent
          }
        })
      });

      if (!response.ok) throw new Error('Falha na resposta do servidor');
      const data = await response.json();
      setAiResult(data);
    } catch (err) {
      console.error('Erro na análise AI:', err);
      alert('Não foi possível completar a análise automática no momento.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Animated Loop Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLooping) {
      let direction = 1;
      interval = setInterval(() => {
        setOpacity(prev => {
          if (prev >= 95) direction = -1;
          if (prev <= 5) direction = 1;
          return prev + direction * 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isLooping]);

  const p = session.perimetry;
  const deltaWaist = Math.round((p.waistNarrowT1 - p.waistNarrowT0) * 10) / 10;
  const deltaAbdomen = Math.round((p.abdomenUmbilicalT1 - p.abdomenUmbilicalT0) * 10) / 10;
  const deltaHip = Math.round((p.hipMaxT1 - p.hipMaxT0) * 10) / 10;
  const deltaWeight = Math.round((session.weightT1Kg - session.weightT0Kg) * 10) / 10;
  const deltaBf = Math.round((session.bodyFatT1Percent - session.bodyFatT0Percent) * 10) / 10;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Dark Clinical Header matching Image 5 */}
      <div className="bg-[#0b1320] text-slate-100 rounded-2xl border border-slate-800 p-6 shadow-xl">
        
        {/* Header Title & Tags */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight text-white">{patient.name}</h2>
              <span className="text-xs font-mono text-slate-400">{patient.recordNumber}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>ISAK II Compliant • Recomposição Corporal T0 / T1</span>
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMode('split')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'split' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Split Arraste
            </button>
            <button
              onClick={() => setMode('ghosting')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'ghosting' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              • Ghosting
            </button>
            <button
              onClick={() => setMode('angles')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'angles' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              4 Ângulos
            </button>
          </div>
        </div>

        {/* Viewport Tools Bar */}
        <div className="flex items-center justify-between py-3 text-xs border-b border-slate-800/60">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-slate-900 border border-slate-700/60 rounded text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
              <span>Zoom & Lupa (Pinça)</span>
              <span className="text-slate-500">•</span>
              <span className="text-sky-400">ISAK ±0.5mm</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2.5 py-1 rounded border text-xs flex items-center space-x-1 font-mono transition-all ${
                showGrid
                  ? 'bg-sky-950 border-sky-700 text-sky-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grade Postural</span>
            </button>
          </div>
        </div>

        {/* Photogrammetry Viewport Canvas */}
        <div className="relative my-4 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 aspect-3/4 sm:aspect-4/5 max-h-[580px] flex items-center justify-center">
          
          {/* Top Dates Comparison Badge */}
          <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-center text-xs font-mono pointer-events-none">
            <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-300 border border-slate-700/70 backdrop-blur-xs">
              • T0 • {session.dateT0} ({session.weightT0Kg} kg)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 backdrop-blur-xs flex items-center space-x-1">
              <span>• T1 • {session.dateT1} ({session.weightT1Kg} kg)</span>
              <span className="font-bold text-emerald-400">Δ {deltaWeight}kg</span>
            </span>
          </div>

          {/* Floating Zoom & Tool HUD */}
          <div className="absolute top-12 left-3 z-20 flex flex-col space-y-1.5 pointer-events-auto">
            <span className="px-2 py-0.5 rounded bg-slate-900/90 text-sky-400 text-[10px] font-mono border border-slate-700/70">
              • {zoomLevel.toFixed(1)}x | Pinça / Pan Ativo
            </span>
          </div>

          <div className="absolute top-12 right-3 z-20 flex flex-col space-y-1.5 bg-slate-900/80 p-1 rounded-lg border border-slate-800 backdrop-blur-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.min(3.0, prev + 0.25))}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(1.0, prev - 0.25))}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1.0)}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
              title="Resetar Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Reference Image Container with dynamic zoom and opacity */}
          <div
            className="w-full h-full relative flex items-center justify-center transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Base Image T0 */}
            <img
              src={session.photos.frontalT0Url}
              alt="Fotogrametria T0 Base"
              className="max-h-full max-w-full object-contain select-none"
            />

            {/* Overlay Ghost / Split Image T1 */}
            <img
              src={session.photos.frontalT1Url}
              alt="Fotogrametria T1 Atual"
              className="absolute max-h-full max-w-full object-contain select-none"
              style={{
                opacity: mode === 'split' ? 1 : opacity / 100,
                clipPath: mode === 'split' ? `inset(0 0 0 ${splitPosition}%)` : undefined
              }}
            />

            {/* Split Arraste Divider Line */}
            {mode === 'split' && (
              <div 
                className="absolute top-0 bottom-0 w-1 bg-emerald-400 z-30 pointer-events-none shadow-[0_0_12px_rgba(52,211,153,1)]"
                style={{ left: `${splitPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-xs text-white shadow-xl font-bold">
                  ↔
                </div>
              </div>
            )}

            {/* Postural Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-8 pointer-events-none opacity-20">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-sky-400" />
                ))}
              </div>
            )}

            {/* Perimetry Vector Overlays */}
            {/* Waist Delta Tag */}
            <div className="absolute top-[42%] left-[22%] z-20 pointer-events-none">
              <div className="px-2 py-0.5 rounded bg-sky-950/90 text-sky-300 border border-sky-500 text-[10px] font-mono shadow-md flex items-center space-x-1">
                <span>Cintura: Δ {deltaWaist} cm</span>
              </div>
              <div className="w-12 h-px bg-sky-400/80 mt-1" />
            </div>

            {/* Umbilical Delta Tag */}
            <div className="absolute top-[48%] left-[45%] z-20 pointer-events-none flex flex-col items-center">
              <span className="text-[10px] text-amber-300 font-mono bg-slate-900/80 px-1.5 py-0.5 rounded border border-amber-500/60">
                Ponto Umbilical
              </span>
              <div className="w-3 h-3 rounded-full border-2 border-amber-400 mt-0.5" />
            </div>

            {/* Hip Delta Tag */}
            <div className="absolute top-[56%] right-[18%] z-20 pointer-events-none">
              <div className="px-2 py-0.5 rounded bg-sky-950/90 text-sky-300 border border-sky-500 text-[10px] font-mono shadow-md flex items-center space-x-1">
                <span>Quadril: Δ {deltaHip} cm</span>
              </div>
              <div className="w-12 h-px bg-sky-400/80 mt-1 ml-auto" />
            </div>
          </div>

          {/* Bottom Overlay Hint */}
          <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-between items-center text-[10px] font-mono text-slate-400 pointer-events-none">
            <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              SOBREPOSIÇÃO FOTOGRAMÉTRICA
            </span>
            <span className="bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
              Pinça com 2 dedos ou duplo toque
            </span>
          </div>
        </div>

        {/* 4 Angles Navigation Pills */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { id: 'frontal', label: '1. Frontal' },
            { id: 'perfil_d', label: '2. Perfil D' },
            { id: 'perfil_e', label: '3. Perfil E' },
            { id: 'posterior', label: '4. Posterior' }
          ].map(ang => (
            <button
              key={ang.id}
              onClick={() => setActiveAngle(ang.id as any)}
              className={`py-2 text-xs font-mono rounded-lg border transition-all ${
                activeAngle === ang.id
                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {ang.label}
            </button>
          ))}
        </div>

        {/* Controls: Opacity or Split Arraste Slider */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">
                {mode === 'split' ? 'Divisor do Split Arraste (T0 ↔ T1)' : 'Opacidade da Sobreposição'}
              </h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
              {mode === 'split' ? `${splitPosition}% Divisão` : `${opacity}% Fusão Ghost`}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (mode === 'split') setSplitPosition(Math.max(0, splitPosition - 10));
                else setOpacity(Math.max(0, opacity - 10));
              }}
              className="w-7 h-7 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold"
            >
              -
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={mode === 'split' ? splitPosition : opacity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (mode === 'split') setSplitPosition(val);
                else setOpacity(val);
              }}
              className="flex-1 accent-emerald-500"
            />
            <button
              onClick={() => {
                if (mode === 'split') setSplitPosition(Math.min(100, splitPosition + 10));
                else setOpacity(Math.min(100, opacity + 10));
              }}
              className="w-7 h-7 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px] font-mono">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <span>• T0: 100% Base (10/Dez)</span>
              <span>—</span>
              <span className="text-emerald-400">T1: 100% Atual (12/Fev) •</span>
            </div>

            <div className="flex items-center space-x-1.5">
              {[0, 25, 50, 75, 100].map(val => (
                <button
                  key={val}
                  onClick={() => setOpacity(val)}
                  className={`px-2 py-0.5 rounded border text-[10px] ${
                    opacity === val ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {val}%
                </button>
              ))}

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`ml-2 px-3 py-0.5 rounded text-[11px] font-bold flex items-center space-x-1 transition-all ${
                  isLooping ? 'bg-amber-600 text-white' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {isLooping ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isLooping ? 'Pausar' : 'Loop Animado'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Grid (64 Dias Entre Ensaios) */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Telemetria de Recomposição
            </h4>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
              64 Dias Entre Ensaios
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            {/* Peso */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">PESO CORPORAL</span>
              <span className="text-xl font-black text-white tabular-nums">{session.weightT1Kg} kg</span>
              <span className="text-xs text-emerald-400 block mt-0.5 flex items-center space-x-1">
                <TrendingDown className="w-3 h-3 inline" />
                <span>{deltaWeight} kg (-5,3%)</span>
              </span>
            </div>

            {/* Gordura */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">GORDURA CORPORAL</span>
              <span className="text-xl font-black text-white tabular-nums">{session.bodyFatT1Percent}%</span>
              <span className="text-xs text-emerald-400 block mt-0.5">
                {deltaBf} p.p. (Jackson 7)
              </span>
            </div>

            {/* Massa Magra */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">MASSA MAGRA LIVRE</span>
              <span className="text-xl font-black text-white tabular-nums">{session.leanMassT1Kg} kg</span>
              <span className="text-xs text-sky-400 block mt-0.5">
                100% Preservada
              </span>
            </div>

            {/* Perímetros */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">PERÍMETROS CHAVE</span>
              <span className="text-xs text-slate-300 block">
                Cintura: {p.waistNarrowT1} cm (Δ {deltaWaist})
              </span>
              <span className="text-xs text-slate-300 block">
                Abdômen: {p.abdomenUmbilicalT1} cm (Δ {deltaAbdomen})
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Note Card */}
        <div className="mt-4 p-4 bg-emerald-950/40 rounded-xl border border-emerald-800/80 text-xs text-emerald-200">
          <div className="flex items-center space-x-2 font-bold mb-1 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Recomposição Notável • Massa Muscular Íntegra</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans text-xs">
            {session.clinicalOpinion}
          </p>
        </div>

        {/* AI Analysis Section */}
        {(aiResult || isAnalyzing) && (
          <div className="mt-6 p-5 bg-slate-900/60 rounded-2xl border border-emerald-900/30 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/50 flex items-center justify-center">
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                ) : (
                  <BrainCircuit className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Análise Clínica Inteligente via Gemini</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Processamento Multi-modal Vision</p>
              </div>
            </div>

            {isAnalyzing ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-400 animate-pulse">Sincronizando modelos de visão e comparando quadros T0/T1...</p>
                <div className="flex justify-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                </div>
              </div>
            ) : aiResult && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-800/40">
                  <p className="text-sm font-bold text-emerald-300">"{aiResult.resumo}"</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Evidências Visuais</h5>
                    <ul className="space-y-1.5">
                      {aiResult.analise_detalhada.map((item, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parecer Clínico Gemini</h5>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      {aiResult.conclusao_clinica}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-3 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 text-xs font-bold rounded-xl flex items-center space-x-2 transition-all border border-emerald-800 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analisando...' : 'Análise Inteligente (Gemini)'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => alert('Frame comparativo exportado em alta definição!')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Frame</span>
            </button>

            <button
              onClick={onSaveToLaudo}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-2 transition-colors shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar no Laudo Clínico</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
