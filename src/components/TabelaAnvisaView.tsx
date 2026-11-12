import React, { useState } from 'react';
import { AnvisaProductLabel } from '../types';
import { ANVISA_VDR_IN75, checkAnvisaFrontalWarnings, roundAnvisa } from '../domain/calculations';
import { 
  FileSpreadsheet, 
  AlertCircle, 
  Printer, 
  Save, 
  HelpCircle, 
  CheckCircle2, 
  Sliders,
  Sparkles
} from 'lucide-react';

interface TabelaAnvisaViewProps {
  labelData: AnvisaProductLabel;
  onUpdateLabel: (label: AnvisaProductLabel) => void;
}

export const TabelaAnvisaView: React.FC<TabelaAnvisaViewProps> = ({
  labelData,
  onUpdateLabel
}) => {
  const [product, setProduct] = useState<AnvisaProductLabel>(labelData);

  // Check front-of-package warnings dynamically
  const warnings = checkAnvisaFrontalWarnings(
    product.addedSugars100g,
    product.saturatedFat100g,
    product.sodium100gMg
  );

  // Helper for portion calculations
  const pFactor = product.portionGrams / 100;
  const portionEnergy = Math.round(product.energyKcal100g * pFactor);
  const portionCarbs = roundAnvisa(product.carbs100g * pFactor);
  const portionTotalSugars = roundAnvisa(product.totalSugars100g * pFactor);
  const portionAddedSugars = roundAnvisa(product.addedSugars100g * pFactor);
  const portionProtein = roundAnvisa(product.protein100g * pFactor);
  const portionTotalFat = roundAnvisa(product.totalFat100g * pFactor);
  const portionSatFat = roundAnvisa(product.saturatedFat100g * pFactor);
  const portionTransFat = roundAnvisa(product.transFat100g * pFactor);
  const portionFiber = roundAnvisa(product.fiber100g * pFactor);
  const portionSodium = Math.round(product.sodium100gMg * pFactor);

  // Daily values (%VD) based on 2,000 kcal reference (IN 75/2020)
  const vdEnergy = Math.round((portionEnergy / ANVISA_VDR_IN75.energyKcal) * 100);
  const vdCarbs = Math.round((portionCarbs / ANVISA_VDR_IN75.carbohydratesG) * 100);
  const vdAddedSugars = Math.round((portionAddedSugars / ANVISA_VDR_IN75.addedSugarsG) * 100);
  const vdProtein = Math.round((portionProtein / ANVISA_VDR_IN75.proteinG) * 100);
  const vdTotalFat = Math.round((portionTotalFat / ANVISA_VDR_IN75.totalFatG) * 100);
  const vdSatFat = Math.round((portionSatFat / ANVISA_VDR_IN75.saturatedFatG) * 100);
  const vdFiber = Math.round((portionFiber / ANVISA_VDR_IN75.dietaryFiberG) * 100);
  const vdSodium = Math.round((portionSodium / ANVISA_VDR_IN75.sodiumMg) * 100);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-[#004f28]">
                Legislação Sanitária Brasileira
              </span>
              <span className="text-xs text-slate-400 font-mono">RDC 429/2020 & IN 75/2020</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Gerador de Tabela Nutricional & Lupa Frontal ANVISA
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Cálculo automatizado de 100g, porção comercial e regras oficiais de arredondamento.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-2 transition-colors self-start md:self-auto"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Imprimir Rótulo Oficial</span>
          </button>
        </div>
      </div>

      {/* Front of Package Alert Lupas (Rotulagem Nutricional Frontal) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <h3 className="text-sm font-bold text-slate-900">
              Rotulagem Nutricional Frontal (Lupa de Advertência Obrigatória)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Limiares por 100g (Sólidos): Açúcar ≥15g | Gordura Sat. ≥6g | Sódio ≥600mg
          </span>
        </div>

        {/* Lupa Visual Preview */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
          {warnings.highAddedSugar || warnings.highSaturatedFat || warnings.highSodium ? (
            <div className="p-3 bg-white border-2 border-black rounded-lg shadow-sm font-sans flex items-center space-x-3">
              <div className="w-10 h-10 border-2 border-black rounded-full flex items-center justify-center font-black text-xs">
                🔍
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider block border-b border-black pb-0.5">
                  ALTO EM
                </span>
                <div className="text-xs font-black uppercase space-y-0.5 mt-0.5">
                  {warnings.highAddedSugar && <div className="text-rose-700">• AÇÚCAR ADICIONADO</div>}
                  {warnings.highSaturatedFat && <div className="text-rose-700">• GORDURA SATURADA</div>}
                  {warnings.highSodium && <div className="text-rose-700">• SÓDIO</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Produto Dispensado da Lupa Frontal! Todos os nutrientes críticos estão dentro dos limites seguros da ANVISA.</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Data Editor on Left, Realistic Nutrition Facts Label on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Product & Nutrient Form Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Composição Nutricional por 100g de Produto
            </h3>

            {/* Product Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={product.productName}
                  onChange={(e) => setProduct({ ...product, productName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-[#004f28]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Medida Caseira da Porção</label>
                <input
                  type="text"
                  value={product.householdMeasure}
                  onChange={(e) => setProduct({ ...product, householdMeasure: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-[#004f28]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Porção em Gramas (g)</label>
                <input
                  type="number"
                  value={product.portionGrams}
                  onChange={(e) => setProduct({ ...product, portionGrams: Math.max(1, parseFloat(e.target.value) || 0) })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Porções por Embalagem</label>
                <input
                  type="number"
                  value={product.portionsPerPackage}
                  onChange={(e) => setProduct({ ...product, portionsPerPackage: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200"
                />
              </div>
            </div>

            {/* Nutrients per 100g Input Grid */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-mono block">Valor Energético (kcal)</label>
                  <input
                    type="number"
                    value={product.energyKcal100g}
                    onChange={(e) => setProduct({ ...product, energyKcal100g: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 font-mono rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono block">Carboidratos Totais (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={product.carbs100g}
                    onChange={(e) => setProduct({ ...product, carbs100g: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 font-mono rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-rose-700 font-mono font-bold block">Açúcares Adicionados (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={product.addedSugars100g}
                    onChange={(e) => setProduct({ ...product, addedSugars100g: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 font-mono rounded border border-rose-300 bg-rose-50/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-mono block">Proteínas (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={product.protein100g}
                    onChange={(e) => setProduct({ ...product, protein100g: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 font-mono rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono block">Gorduras Totais (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={product.totalFat100g}
                    onChange={(e) => setProduct({ ...product, totalFat100g: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 font-mono rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-rose-700 font-mono font-bold block">Gorduras Saturadas (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={product.saturatedFat100g}
                    onChange={(e) => setProduct({ ...product, saturatedFat100g: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 font-mono rounded border border-rose-300 bg-rose-50/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-mono block">Gorduras Trans (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={product.transFat100g}
                    onChange={(e) => setProduct({ ...product, transFat100g: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 font-mono rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-mono block">Fibras Alimentares (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={product.fiber100g}
                    onChange={(e) => setProduct({ ...product, fiber100g: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 font-mono rounded border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-rose-700 font-mono font-bold block">Sódio (mg)</label>
                  <input
                    type="number"
                    value={product.sodium100gMg}
                    onChange={(e) => setProduct({ ...product, sodium100gMg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 font-mono rounded border border-rose-300 bg-rose-50/40"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => {
                  onUpdateLabel(product);
                  alert('Tabela Nutricional atualizada com sucesso!');
                }}
                className="px-4 py-2 bg-[#004f28] hover:bg-[#003c1e] text-white text-xs font-semibold rounded-lg flex items-center space-x-2 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Tabela Nutricional</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Realistic ANVISA Official Table Preview (Black & White standard) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-white p-4 border-2 border-black text-black font-sans shadow-md">
            
            {/* Header */}
            <div className="border-b-2 border-black pb-1 mb-1">
              <h4 className="text-sm font-black uppercase tracking-tight text-center">
                INFORMAÇÃO NUTRICIONAL
              </h4>
              <div className="text-[11px] text-center">
                Porções por embalagem: cerca de {product.portionsPerPackage} porções
              </div>
              <div className="text-[11px] text-center font-bold">
                Porção: {product.portionGrams} g ({product.householdMeasure})
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 text-[10px] font-bold border-b-2 border-black py-1">
              <div className="col-span-6">Nutriente</div>
              <div className="col-span-2 text-right">100 g</div>
              <div className="col-span-2 text-right">{product.portionGrams} g</div>
              <div className="col-span-2 text-right">%VD*</div>
            </div>

            {/* Table Rows */}
            <div className="text-[11px] divide-y divide-black/30 font-mono">
              {/* Valor Energético */}
              <div className="grid grid-cols-12 py-1 font-bold">
                <div className="col-span-6 font-sans">Valor energético (kcal)</div>
                <div className="col-span-2 text-right">{product.energyKcal100g}</div>
                <div className="col-span-2 text-right">{portionEnergy}</div>
                <div className="col-span-2 text-right">{vdEnergy}</div>
              </div>

              {/* Carboidratos */}
              <div className="grid grid-cols-12 py-1 font-bold">
                <div className="col-span-6 font-sans">Carboidratos (g)</div>
                <div className="col-span-2 text-right">{product.carbs100g}</div>
                <div className="col-span-2 text-right">{portionCarbs}</div>
                <div className="col-span-2 text-right">{vdCarbs}</div>
              </div>

              {/* Açúcares Totais */}
              <div className="grid grid-cols-12 py-0.5 text-[10px] pl-3 text-slate-800">
                <div className="col-span-6 font-sans">Açúcares totais (g)</div>
                <div className="col-span-2 text-right">{product.totalSugars100g}</div>
                <div className="col-span-2 text-right">{portionTotalSugars}</div>
                <div className="col-span-2 text-right">-</div>
              </div>

              {/* Açúcares Adicionados */}
              <div className="grid grid-cols-12 py-0.5 text-[10px] pl-3 text-slate-800">
                <div className="col-span-6 font-sans">Açúcares adicionados (g)</div>
                <div className="col-span-2 text-right">{product.addedSugars100g}</div>
                <div className="col-span-2 text-right">{portionAddedSugars}</div>
                <div className="col-span-2 text-right">{vdAddedSugars}</div>
              </div>

              {/* Proteínas */}
              <div className="grid grid-cols-12 py-1 font-bold">
                <div className="col-span-6 font-sans">Proteínas (g)</div>
                <div className="col-span-2 text-right">{product.protein100g}</div>
                <div className="col-span-2 text-right">{portionProtein}</div>
                <div className="col-span-2 text-right">{vdProtein}</div>
              </div>

              {/* Gorduras Totais */}
              <div className="grid grid-cols-12 py-1 font-bold">
                <div className="col-span-6 font-sans">Gorduras totais (g)</div>
                <div className="col-span-2 text-right">{product.totalFat100g}</div>
                <div className="col-span-2 text-right">{portionTotalFat}</div>
                <div className="col-span-2 text-right">{vdTotalFat}</div>
              </div>

              {/* Gorduras Saturadas */}
              <div className="grid grid-cols-12 py-0.5 text-[10px] pl-3 text-slate-800">
                <div className="col-span-6 font-sans">Gorduras saturadas (g)</div>
                <div className="col-span-2 text-right">{product.saturatedFat100g}</div>
                <div className="col-span-2 text-right">{portionSatFat}</div>
                <div className="col-span-2 text-right">{vdSatFat}</div>
              </div>

              {/* Gorduras Trans */}
              <div className="grid grid-cols-12 py-0.5 text-[10px] pl-3 text-slate-800">
                <div className="col-span-6 font-sans">Gorduras trans (g)</div>
                <div className="col-span-2 text-right">{product.transFat100g}</div>
                <div className="col-span-2 text-right">{portionTransFat}</div>
                <div className="col-span-2 text-right">**</div>
              </div>

              {/* Fibras Alimentares */}
              <div className="grid grid-cols-12 py-1 font-bold">
                <div className="col-span-6 font-sans">Fibras alimentares (g)</div>
                <div className="col-span-2 text-right">{product.fiber100g}</div>
                <div className="col-span-2 text-right">{portionFiber}</div>
                <div className="col-span-2 text-right">{vdFiber}</div>
              </div>

              {/* Sódio */}
              <div className="grid grid-cols-12 py-1 font-bold">
                <div className="col-span-6 font-sans">Sódio (mg)</div>
                <div className="col-span-2 text-right">{product.sodium100gMg}</div>
                <div className="col-span-2 text-right">{portionSodium}</div>
                <div className="col-span-2 text-right">{vdSodium}</div>
              </div>
            </div>

            {/* Official Legal Footnote */}
            <div className="text-[9px] pt-1.5 mt-1 border-t-2 border-black text-slate-800 leading-tight">
              * Percentual de valores diários fornecidos pela porção. (Base 2.000 kcal / IN 75/2020).
              <br />
              ** Valor diário não estabelecido.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
