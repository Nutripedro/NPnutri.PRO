import React from 'react';
import { AlertCircle, CheckSquare, ClipboardList, Square } from 'lucide-react';
import { HemoPatientClinicalContext } from '../../types/hemo';
import { MEB_CORRELATION_SYMPTOMS } from '../../domain/hemoEngine';

interface HemoEmrContextPanelProps {
  context: HemoPatientClinicalContext;
  missingEssentialContext: string[];
  onChangeContext: (next: HemoPatientClinicalContext) => void;
}

const COMMON_COMORBIDITIES = [
  'Diabetes Mellitus',
  'Hipertensão Arterial',
  'Obesidade',
  'Doença Renal Crônica',
  'Hepatopatia / Esteatose',
  'Doença Autoimune',
  'Hipotireoidismo',
  'Doença Inflamatória Intestinal',
  'Alergias / Atopia',
  'Oncológico / Pós-operatório'
];

export const HemoEmrContextPanel: React.FC<HemoEmrContextPanelProps> = ({
  context,
  missingEssentialContext,
  onChangeContext
}) => {
  const toggleItem = (
    field: 'comorbidities' | 'giAndAllergicSymptoms',
    label: string
  ) => {
    const list = context[field] || [];
    const next = list.includes(label)
      ? list.filter((i) => i !== label)
      : [...list, label];
    onChangeContext({ ...context, [field]: next });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#4A6B5D] shrink-0" />
            Integração Automática com o Prontuário
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Dados demográficos, antropometria e bioimpedância recuperados automaticamente sem repetição de perguntas.
          </p>
        </div>
        <span className="text-xs text-slate-600 tabular-nums shrink-0">
          Prontuário {context.recordNumber}
        </span>
      </div>

      {/* Dados recuperados automaticamente do prontuário */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs">
        <div>
          <span className="text-[11px] text-slate-500 block">Idade / Nasc.</span>
          <span className="font-semibold font-mono tabular-nums text-slate-900">
            {context.age ? `${context.age} anos` : 'Não informado'}
          </span>
          <span className="text-[11px] text-slate-500 block truncate">{context.birthDate}</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Sexo Biológico</span>
          <select
            value={context.biologicalSex}
            onChange={(e) =>
              onChangeContext({
                ...context,
                biologicalSex: e.target.value as 'male' | 'female',
                isPregnant: e.target.value === 'male' ? false : context.isPregnant
              })
            }
            className="mt-0.5 border border-slate-300 bg-white rounded px-2 py-1 text-xs font-medium text-slate-900"
          >
            <option value="female">Feminino</option>
            <option value="male">Masculino</option>
          </select>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Peso / Altura</span>
          <span className="font-semibold font-mono tabular-nums text-slate-900">
            {context.weightKg !== null ? `${context.weightKg} kg` : 'N/I'} ·{' '}
            {context.heightCm !== null ? `${context.heightCm} cm` : 'N/I'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">IMC</span>
          <span className="font-semibold font-mono tabular-nums text-slate-900">
            {context.imc !== null ? `${context.imc} kg/m²` : 'Não informado'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">C. Abdominal / % Gordura</span>
          <span className="font-semibold font-mono tabular-nums text-slate-900">
            {context.waistCm !== null ? `${context.waistCm} cm` : 'N/I'} ·{' '}
            {context.bodyFatPercent !== null ? `${context.bodyFatPercent}%` : 'N/I'}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Ângulo de Fase (BIA)</span>
          <span className="font-semibold font-mono tabular-nums text-slate-900">
            {context.phaseAngleDeg !== null ? `${context.phaseAngleDeg}°` : 'Não informado'}
          </span>
        </div>
      </div>

      {/* Gestação (quando sexo feminino) */}
      {context.biologicalSex === 'female' && (
        <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-50 border border-slate-200 rounded-lg p-3">
          <button
            type="button"
            onClick={() =>
              onChangeContext({
                ...context,
                isPregnant: !context.isPregnant,
                gestationalWeeks: !context.isPregnant ? context.gestationalWeeks ?? 12 : null
              })
            }
            className="flex items-center gap-2 font-medium text-slate-900"
          >
            {context.isPregnant ? (
              <CheckSquare className="w-4 h-4 text-[#4A6B5D]" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Gestação em curso (ajusta referência de Hemoglobina e Hematócrito)</span>
          </button>

          {context.isPregnant && (
            <div className="flex items-center gap-2">
              <label className="text-slate-600">Idade gestacional (sem.):</label>
              <input
                type="number"
                min={1}
                max={42}
                value={context.gestationalWeeks ?? ''}
                onChange={(e) =>
                  onChangeContext({
                    ...context,
                    gestationalWeeks: e.target.value ? Number(e.target.value) : null
                  })
                }
                className="w-20 border border-slate-300 bg-white rounded px-2 py-1 font-mono tabular-nums text-right"
              />
            </div>
          )}
        </div>
      )}

      {/* Campos essenciais faltantes sinalizados */}
      {missingEssentialContext.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-950 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Dados clínicos essenciais não informados no prontuário: </span>
            <span>{missingEssentialContext.join(' · ')}</span>
          </div>
        </div>
      )}

      {/* Complemento clínico que ainda não esteja estruturado no cadastro base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Medicamentos em Uso
          </label>
          <input
            type="text"
            value={context.medications}
            onChange={(e) => onChangeContext({ ...context, medications: e.target.value })}
            placeholder="Não informado (ex.: Metformina, Corticoide, IBP...)"
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Suplementos Atuais
          </label>
          <input
            type="text"
            value={context.supplements}
            onChange={(e) => onChangeContext({ ...context, supplements: e.target.value })}
            placeholder="Não informado (ex.: Ferro quelado, B12, Vitamina D...)"
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Hábitos Alimentares / Recordatório 24h
          </label>
          <input
            type="text"
            value={context.dietaryHabits}
            onChange={(e) => onChangeContext({ ...context, dietaryHabits: e.target.value })}
            placeholder="Resumo alimentar ou padrão (onívoro, vegetariano, restrições...)"
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Histórico Gastrointestinal & Infecções Recentes
          </label>
          <input
            type="text"
            value={context.gastrointestinalHistory}
            onChange={(e) =>
              onChangeContext({ ...context, gastrointestinalHistory: e.target.value })
            }
            placeholder="Não informado (ex.: gastrite, bariátrica, virose há 2 semanas...)"
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Cirurgias & Histórico Familiar Relevante
          </label>
          <input
            type="text"
            value={context.surgeriesHistory}
            onChange={(e) => onChangeContext({ ...context, surgeriesHistory: e.target.value })}
            placeholder="Não informado (ex.: colecistectomia, talassemia familiar...)"
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Álcool</label>
            <select
              value={context.alcoholUse}
              onChange={(e) =>
                onChangeContext({
                  ...context,
                  alcoholUse: e.target.value as HemoPatientClinicalContext['alcoholUse']
                })
              }
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 bg-white"
            >
              <option value="nao_informado">Não informado</option>
              <option value="nenhum">Não consome</option>
              <option value="ocasional">Ocasional</option>
              <option value="frequente">Frequente</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">Tabagismo</label>
            <select
              value={context.tobaccoUse}
              onChange={(e) =>
                onChangeContext({
                  ...context,
                  tobaccoUse: e.target.value as HemoPatientClinicalContext['tobaccoUse']
                })
              }
              className="w-full border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 bg-white"
            >
              <option value="nao_informado">Não informado</option>
              <option value="nao">Não fumante</option>
              <option value="ex_tabagista">Ex-tabagista</option>
              <option value="ativo">Tabagista ativo</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Atividade Física
          </label>
          <input
            type="text"
            value={context.physicalActivity}
            onChange={(e) => onChangeContext({ ...context, physicalActivity: e.target.value })}
            placeholder="Ex.: Corrida 4x/sem, sedentário..."
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 block mb-1">
            Qualidade do Sono
          </label>
          <input
            type="text"
            value={context.sleepQuality}
            onChange={(e) => onChangeContext({ ...context, sleepQuality: e.target.value })}
            placeholder="Ex.: 7h/noite reparador, insônia inicial..."
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:border-[#4A6B5D] focus:outline-none"
          />
        </div>
      </div>

      {/* Diagnósticos / Comorbidades */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-800">Diagnósticos / Comorbidades Registradas</div>
        <div className="flex flex-wrap gap-2">
          {COMMON_COMORBIDITIES.map((cond) => {
            const active = context.comorbidities.includes(cond);
            return (
              <button
                key={cond}
                type="button"
                onClick={() => toggleItem('comorbidities', cond)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#4A6B5D] text-white border-[#4A6B5D] font-medium'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cond}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sintomas Atuais */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-800">
          Sintomas Atuais & Rastreamento MEB ({context.giAndAllergicSymptoms.length})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MEB_CORRELATION_SYMPTOMS.map((sym) => {
            const active = context.giAndAllergicSymptoms.includes(sym);
            return (
              <button
                key={sym}
                type="button"
                onClick={() => toggleItem('giAndAllergicSymptoms', sym)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border text-left transition-colors ${
                  active
                    ? 'bg-amber-50 border-amber-400 text-slate-900 font-medium'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {active ? (
                  <CheckSquare className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                ) : (
                  <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className="truncate">{sym}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
