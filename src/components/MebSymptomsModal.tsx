import React, { useState } from 'react';
import { CheckSquare, Square, X, AlertCircle, ShieldAlert } from 'lucide-react';

interface MebSymptomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymptoms: string[];
  onSave: (symptoms: string[]) => void;
}

const SYMPTOM_OPTIONS = [
  'Constipação',
  'Diarreia',
  'Distensão abdominal / Estufamento',
  'Gases excessivos / Flatulência',
  'Refluxo gastroesofágico',
  'Dor ou desconforto abdominal',
  'Dermatite, eczema ou psoríase',
  'Rinite alérgica ou sinusite de repetição',
  'Fadiga crônica matinal',
  'Cefaleia pós-prandial',
  'Coceira ou prurido anal',
  'Bruxismo noturno',
  'Intolerâncias alimentares relatadas'
];

export const MebSymptomsModal: React.FC<MebSymptomsModalProps> = ({
  isOpen,
  onClose,
  selectedSymptoms,
  onSave
}) => {
  const [currentSelected, setCurrentSelected] = useState<string[]>(selectedSymptoms);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    if (currentSelected.includes(sym)) {
      setCurrentSelected(currentSelected.filter(s => s !== sym));
    } else {
      setCurrentSelected([...currentSelected, sym]);
    }
  };

  const handleSave = () => {
    onSave(currentSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rastreamento de Sintomas Clínicos (Índice MEB)</h3>
              <p className="text-xs text-slate-500">Assinale os sintomas gastrointestinais e sistêmicos relatados pelo paciente.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2.5">
          {SYMPTOM_OPTIONS.map((sym) => {
            const isChecked = currentSelected.includes(sym);
            return (
              <button
                key={sym}
                type="button"
                onClick={() => toggleSymptom(sym)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                  isChecked ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-semibold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-amber-700 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="text-xs">{sym}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-[#4A6B5D] hover:bg-[#3d594c] text-white shadow-xs transition-colors"
          >
            Salvar no Prontuário
          </button>
        </div>
      </div>
    </div>
  );
};
