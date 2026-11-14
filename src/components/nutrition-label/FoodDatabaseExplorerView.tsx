import React, { useMemo, useState } from 'react';
import {
  AnvisaFoodEntry,
  FoodSource,
  PhysicalState
} from '../../types/nutritionLabel';
import { apiClient } from '../../lib/api';
import { Database, Plus, Search, X } from 'lucide-react';

interface FoodDatabaseExplorerViewProps {
  foodDatabase: AnvisaFoodEntry[];
  onFoodCreated: (food: AnvisaFoodEntry) => void;
}

export const FoodDatabaseExplorerView: React.FC<FoodDatabaseExplorerViewProps> = ({
  foodDatabase,
  onFoodCreated
}) => {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('Todas');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [showNewModal, setShowNewModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AnvisaFoodEntry['category']>('Cereais e Farinhas');
  const [newState, setNewState] = useState<PhysicalState>('solido');
  const [newSource, setNewSource] = useState<FoodSource>('FABRICANTE');
  const [kcal, setKcal] = useState<string>('350');
  const [carbs, setCarbs] = useState<string>('60');
  const [totalSugars, setTotalSugars] = useState<string>('');
  const [addedSugars, setAddedSugars] = useState<string>('');
  const [protein, setProtein] = useState<string>('10');
  const [fat, setFat] = useState<string>('5');
  const [satFat, setSatFat] = useState<string>('1.2');
  const [transFat, setTransFat] = useState<string>('');
  const [fiber, setFiber] = useState<string>('4');
  const [sodium, setSodium] = useState<string>('120');

  const categories = useMemo(
    () => ['Todas', ...Array.from(new Set(foodDatabase.map((f) => f.category)))],
    [foodDatabase]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return foodDatabase.filter((f) => {
      const sOk = sourceFilter === 'Todas' || f.source === sourceFilter;
      const cOk = categoryFilter === 'Todas' || f.category === categoryFilter;
      const qOk =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.code.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return sOk && cOk && qOk;
    });
  }, [foodDatabase, query, sourceFilter, categoryFilter]);

  const parseNullable = (val: string): number | null => {
    if (val.trim() === '') return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const kcalNum = parseNullable(kcal);
      const entry: Partial<AnvisaFoodEntry> = {
        name: newName.trim(),
        category: newCategory,
        source: newSource,
        sourceVersion: newSource === 'FABRICANTE' ? 'Ficha Técnica Fornecedor' : 'Cadastro Próprio',
        physicalState: newState,
        processingState: 'processado',
        edibleFraction: 1,
        densityGPerMl: 1,
        moistureG: null,
        addedSugarClassification: parseNullable(addedSugars) ? 'added' : 'none',
        nutrientConfidence: 'measured',
        allergenTags: [],
        nutrientsPer100g: {
          energyKcal: kcalNum,
          energyKj: kcalNum !== null ? Math.round(kcalNum * 4.184) : null,
          carbsG: parseNullable(carbs),
          totalSugarsG: parseNullable(totalSugars),
          addedSugarsG: parseNullable(addedSugars),
          proteinG: parseNullable(protein),
          totalFatG: parseNullable(fat),
          saturatedFatG: parseNullable(satFat),
          transFatG: parseNullable(transFat),
          fiberG: parseNullable(fiber),
          sodiumMg: parseNullable(sodium)
        }
      };
      const saved = await apiClient.createCustomFood(entry);
      onFoodCreated(saved);
      setShowNewModal(false);
      setNewName('');
    } finally {
      setSaving(false);
    }
  };

  const fmtCell = (val: number | null | undefined) => {
    if (val === null || val === undefined) {
      return <span className="text-amber-600 dark:text-amber-400">N/I</span>;
    }
    return val;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-600" />
              <span>Banco de Composição Nutricional (TACO · TBCA · Custom)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Valores por 100 g/ml da parte comestível. Campos marcados como <strong className="text-amber-600">N/I</strong> indicam ausência de dado analítico (nunca substituídos por zero automaticamente).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Ingrediente / Fornecedor</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou código (ex.: TACO-039, açúcar, ovo)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Categoria: {c}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <option value="Todas">Fonte: Todas</option>
            <option value="TACO">TACO (UNICAMP)</option>
            <option value="TBCA">TBCA (USP)</option>
            <option value="FABRICANTE">Fabricante</option>
            <option value="CUSTOM">Customizado</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
              <th className="py-2.5 px-3 font-semibold">Código</th>
              <th className="py-2.5 px-3 font-semibold">Alimento</th>
              <th className="py-2.5 px-2 font-semibold">Fonte</th>
              <th className="py-2.5 px-2 font-semibold text-right">Kcal</th>
              <th className="py-2.5 px-2 font-semibold text-right">Carb (g)</th>
              <th className="py-2.5 px-2 font-semibold text-right">Aç. Adic.</th>
              <th className="py-2.5 px-2 font-semibold text-right">Prot (g)</th>
              <th className="py-2.5 px-2 font-semibold text-right">Gord (g)</th>
              <th className="py-2.5 px-2 font-semibold text-right">Sat (g)</th>
              <th className="py-2.5 px-2 font-semibold text-right">Trans</th>
              <th className="py-2.5 px-2 font-semibold text-right">Fibra</th>
              <th className="py-2.5 px-3 font-semibold text-right">Sódio (mg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                <td className="py-2 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  {f.code}
                </td>
                <td className="py-2 px-3">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{f.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {f.category} · {f.unitLabel || (f.physicalState === 'liquido' ? 'Base 100 ml' : 'Base 100 g')}
                  </div>
                </td>
                <td className="py-2 px-2 text-[11px] text-slate-600 dark:text-slate-300">
                  {f.source}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  {fmtCell(f.nutrientsPer100g.energyKcal)}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  {fmtCell(f.nutrientsPer100g.carbsG)}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  {fmtCell(f.nutrientsPer100g.addedSugarsG)}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  {fmtCell(f.nutrientsPer100g.proteinG)}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  {fmtCell(f.nutrientsPer100g.totalFatG)}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  {fmtCell(f.nutrientsPer100g.saturatedFatG)}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  {fmtCell(f.nutrientsPer100g.transFatG)}
                </td>
                <td className="py-2 px-2 text-right font-mono tabular-nums">
                  {fmtCell(f.nutrientsPer100g.fiberG)}
                </td>
                <td className="py-2 px-3 text-right font-mono tabular-nums">
                  {fmtCell(f.nutrientsPer100g.sodiumMg)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro de Ingrediente Customizado */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Cadastrar Alimento / Ficha de Fornecedor (por 100g)
              </h4>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Nome do Alimento / Insumo</label>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex.: Farinha de Amêndoas (Laudo Fornecedor X)"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Fonte</label>
                <select
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value as FoodSource)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="FABRICANTE">Ficha do Fabricante</option>
                  <option value="CUSTOM">Cadastro da Clínica</option>
                  <option value="TBCA">TBCA Complementar</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Estado Físico</label>
                <select
                  value={newState}
                  onChange={(e) => setNewState(e.target.value as PhysicalState)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="solido">Sólido (100 g)</option>
                  <option value="liquido">Líquido (100 ml)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold block mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as AnvisaFoodEntry['category'])
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Cereais e Farinhas">Cereais e Farinhas</option>
                  <option value="Açúcares e Doces">Açúcares e Doces</option>
                  <option value="Óleos e Gorduras">Óleos e Gorduras</option>
                  <option value="Ovos e Laticínios">Ovos e Laticínios</option>
                  <option value="Carnes e Pescados">Carnes e Pescados</option>
                  <option value="Hortaliças e Vegetais">Hortaliças e Vegetais</option>
                  <option value="Frutas">Frutas</option>
                  <option value="Oleaginosas e Sementes">Oleaginosas e Sementes</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Condimentos e Aditivos">Condimentos e Aditivos</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { label: 'Kcal', val: kcal, set: setKcal },
                { label: 'Carb (g)', val: carbs, set: setCarbs },
                { label: 'Aç. Totais', val: totalSugars, set: setTotalSugars, ph: 'vazio = N/I' },
                { label: 'Aç. Adic.', val: addedSugars, set: setAddedSugars, ph: 'vazio = N/I' },
                { label: 'Prot (g)', val: protein, set: setProtein },
                { label: 'Gord Tot.', val: fat, set: setFat },
                { label: 'Sat (g)', val: satFat, set: setSatFat },
                { label: 'Trans (g)', val: transFat, set: setTransFat, ph: 'vazio = N/I' },
                { label: 'Fibra (g)', val: fiber, set: setFiber },
                { label: 'Sódio (mg)', val: sodium, set: setSodium }
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-[11px] text-slate-500 block mb-0.5">{field.label}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={field.val}
                    placeholder={field.ph}
                    onChange={(e) => field.set(e.target.value)}
                    className="w-full px-2 py-1 font-mono tabular-nums rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar no Banco'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
