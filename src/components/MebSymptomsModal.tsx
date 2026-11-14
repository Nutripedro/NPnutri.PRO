import React, { useEffect, useState } from 'react';
import { CheckSquare, Square, X, AlertCircle } from 'lucide-react';
import { MEB_CORRELATION_SYMPTOMS } from '../domain/hemoEngine';

interface MebSymptomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymptoms: string[];
  onSave: (symptoms: string[]) => void;
}

export const MebSymptomsModal: React.FC<MebSymptomsModalProps> = ({
  isOpen,
  onClose,
  selectedSymptoms,
  onSave
}) => {
  const [currentSelected, setCurrentSelected] = useState<string[]>(selectedSymptoms);

  useEffect(() => {
    if (isOpen) {
      setCurrentSelected(selectedSymptoms);
    }
  }, [isOpen, selectedSymptoms]);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    if (currentSelected.includes(sym)) {
      setCurrentSelected(currentSelected.filter((s) => s !== sym));
    } else {
      setCurrentSelected([...currentSelected, sym]);
    }
  };

  const handleSave = () => {
    onSave(currentSelected);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meb-symptoms-modal-title"
    >
      <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="meb-symptoms-modal-title" className="text-sm font-semibold text-slate-900">
                Checklist de Correlação Clínica (16 Sintomas — Teste MEB)
              </h3>
              <p className="text-xs text-slate-600">
                Assinale manifestações gastrointestinais, atópicas ou sistêmicas presentes no prontuário.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de sintomas"
            className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-[#4A6B5D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MEB_CORRELATION_SYMPTOMS.map((sym) => {
            const isChecked = currentSelected.includes(sym);
            return (
              <button
                key={sym}
                type="button"
                onClick={() => toggleSymptom(sym)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#4A6B5D] ${
                  isChecked
                    ? 'bg-amber-50 border-amber-400 text-slate-900 font-medium'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
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

        <div className="flex items-center justify-between gap-3 p-4 border-t border-slate-200 bg-slate-50">
          <span className="text-xs text-slate-600 tabular-nums">
            {currentSelected.length} de {MEB_CORRELATION_SYMPTOMS.length} selecionados
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#4A6B5D] hover:bg-[#3d594c] text-white transition-colors whitespace-nowrap shrink-0"
            >
              Aplicar ao Prontuário
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
