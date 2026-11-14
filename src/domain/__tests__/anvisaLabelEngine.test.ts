import assert from 'node:assert/strict';
import {
  calculateAtwaterEnergy,
  calculateRecipeNutrition,
  computeIngredientWeights,
  evaluateAnvisaFrontalLupa,
  evaluateCalculatedTableRegulatoryLimits,
  formatAnvisaNumber,
  INITIAL_NUTRITION_RECIPES,
  sanitizeLabelText
} from '../anvisaLabelEngine';
import { ANVISA_FOOD_DATABASE } from '../../data/anvisaFoodDatabase';
import { TechnicalSheetRecipe } from '../../types/nutritionLabel';

console.log('Running NUTRITION LABEL AI deterministic & regulatory tests...');

// 1. Teste de Fator de Correção e Cocção
{
  const w = computeIngredientWeights(200, 'g', 1.25, 0.9);
  assert.equal(w.grossWeightG, 200);
  assert.equal(w.netWeightG, 160); // 200 / 1.25
  assert.equal(w.finalWeightG, 144); // 160 * 0.9
}

// 2. Teste de Fatores Energéticos Específicos Atwater
{
  const e = calculateAtwaterEnergy({ carbsG: 10, proteinG: 5, totalFatG: 2 });
  // 10*4 + 5*4 + 2*9 = 40 + 20 + 18 = 78 kcal
  assert.equal(e.kcal, 78);
  assert.equal(e.kj, Math.round(78 * 4.184));

  const eAlcohol = calculateAtwaterEnergy({
    carbsG: 0,
    proteinG: 0,
    totalFatG: 0,
    alcoholG: 10,
    polyolsG: 5
  });
  // 10*7 + 5*2.4 = 70 + 12 = 82 kcal
  assert.equal(eAlcohol.kcal, 82);
}

// 3. Teste de Arredondamento & Valores Não Significativos (IN 75/2020 Anexo IV)
{
  // Energia ≤ 4 kcal -> '0'
  assert.equal(formatAnvisaNumber('energy', 3.9).formatted, '0');
  assert.equal(formatAnvisaNumber('energy', 253.7).formatted, '254');

  // Saturada ≤ 0.2 g -> '0'
  assert.equal(formatAnvisaNumber('saturatedFat', 0.19).formatted, '0');
  assert.equal(formatAnvisaNumber('saturatedFat', 3.46).formatted, '3,5');

  // Trans ≤ 0.2 g -> '0'
  assert.equal(formatAnvisaNumber('transFat', 0.1).formatted, '0');

  // Sódio ≤ 5 mg -> '0'
  assert.equal(formatAnvisaNumber('sodium', 4.8).formatted, '0');
  assert.equal(formatAnvisaNumber('sodium', 124.6).formatted, '125');

  // Carboidratos ≤ 0.5 g -> '0'; < 10 -> 1 decimal; ≥ 10 -> inteiro
  assert.equal(formatAnvisaNumber('carbs', 0.4).formatted, '0');
  assert.equal(formatAnvisaNumber('carbs', 7.34).formatted, '7,3');
  assert.equal(formatAnvisaNumber('carbs', 45.6).formatted, '46');

  // Null nunca vira '0' silenciosamente
  assert.equal(formatAnvisaNumber('transFat', null).formatted, 'N/I');
}

// 4. Teste da Lupa Frontal (Sólidos vs Líquidos - IN 75/2020 Anexo XV)
{
  const solidHighSugar = evaluateAnvisaFrontalLupa(
    { addedSugarsG: 15.0, saturatedFatG: 5.9, sodiumMg: 599 },
    'solido'
  );
  assert.equal(solidHighSugar.required, true);
  assert.equal(solidHighSugar.highAddedSugar, true);
  assert.equal(solidHighSugar.highSaturatedFat, false);
  assert.equal(solidHighSugar.highSodium, false);

  const liquidAllClear = evaluateAnvisaFrontalLupa(
    { addedSugarsG: 7.4, saturatedFatG: 2.9, sodiumMg: 299 },
    'liquido'
  );
  assert.equal(liquidAllClear.required, false);

  const liquidHighAll = evaluateAnvisaFrontalLupa(
    { addedSugarsG: 7.5, saturatedFatG: 3.0, sodiumMg: 300 },
    'liquido'
  );
  assert.equal(liquidHighAll.required, true);
  assert.equal(liquidHighAll.highAddedSugar, true);
  assert.equal(liquidHighAll.highSaturatedFat, true);
  assert.equal(liquidHighAll.highSodium, true);
}

// 5. Teste Completo da Receita Real "Bolo de Cenoura" (300g farinha, 200g açúcar, 3 ovos 50g, 100ml óleo, 250g cenoura, rendimento 800g)
{
  const bolo = INITIAL_NUTRITION_RECIPES.find((r) => r.id === 'rec-bolo-cenoura')!;
  const result = calculateRecipeNutrition(bolo, ANVISA_FOOD_DATABASE);

  // Farinha 300g (300*360/100=1080) + Cenoura 250g (85) + Açúcar 200g (774) + Ovo 150g (214.5) + Óleo 92g (813.28) + Fermento 12g (6.36)
  // Total ~2973.14 kcal -> /800 * 100 = ~371.6 kcal/100g
  assert.ok(result.per100g.energyKcal !== null && result.per100g.energyKcal > 360 && result.per100g.energyKcal < 385);
  // Açúcar adicionado: 200g * 99.5% = 199g / 800g * 100 = 24.875 g/100g (>= 15g -> exige Lupa ALTO EM AÇÚCAR ADICIONADO)
  assert.equal(result.lupa.required, true);
  assert.equal(result.lupa.highAddedSugar, true);
  assert.equal(result.lupa.highSaturatedFat, false);
  assert.equal(result.lupa.highSodium, false);
  // Alergênicos detectados: Trigo + Ovo + Soja (óleo de soja) + Glúten
  assert.ok(result.suggestedAllergensList.includes('OVOS'));
  assert.ok(result.suggestedAllergensList.includes('TRIGO'));
  assert.equal(result.suggestedGlutenText, 'CONTÉM GLÚTEN.');
  // Auditoria verde aprovável
  assert.equal(result.canApproveOfficialLabel, true);
}

// 6. Teste de Nullability (não converter dado ausente em 0 silenciosamente)
{
  const wheyRecipe: TechnicalSheetRecipe = {
    ...INITIAL_NUTRITION_RECIPES[0],
    id: 'test-whey',
    ingredients: [
      {
        id: 'w1',
        foodId: 'taco-043', // Whey tem transFatG: null
        name: 'Whey Protein',
        quantity: 100,
        unit: 'g',
        grossWeightG: 100,
        correctionFactor: 1,
        netWeightG: 100,
        cookingFactor: 1,
        finalWeightG: 100,
        processingState: 'processado',
        resolutionStatus: 'confirmed'
      }
    ],
    finalYieldGrams: 100,
    useManualYield: true
  };
  const res = calculateRecipeNutrition(wheyRecipe, ANVISA_FOOD_DATABASE);
  assert.equal(res.per100g.transFatG, null);
  assert.ok(res.missingFields.includes('Gorduras trans'));
  assert.ok(res.auditIssues.some((i) => i.tier === 'yellow' && i.id === 'YELLOW-MISSING-DATA'));
}

// 7. Teste de Sanitização Anti-XSS para exportação
{
  const dirty = '<script>alert("xss")</script>Bolo & "Pão"';
  const clean = sanitizeLabelText(dirty);
  assert.ok(!clean.includes('<script>'));
  assert.ok(clean.includes('&lt;script&gt;'));
}

// 8. Teste do Motor Regulatório Detalhado RDC 429/2020 (checks, % limite, margem, conflito de dispensa, N/I)
{
  // Zona crítica (>= 85%) + Excedido + Arredondamento na fronteira
  const res = evaluateCalculatedTableRegulatoryLimits({
    addedSugarsPer100: 14.8, // < 15.0 bruto (98.7%), mas arredonda para 15 na tabela (roundingBoundaryAlert)
    saturatedFatPer100: 5.4, // 90% de 6.0 -> near_limit
    sodiumMgPer100: 750, // 125% de 600 -> exceeds (+150 mg)
    physicalState: 'solido'
  });
  assert.equal(res.required, true);
  assert.deepEqual(res.suggestedClaims, ['SÓDIO']);
  assert.equal(res.checks[0].status, 'near_limit');
  assert.equal(res.checks[0].roundingBoundaryAlert, true);
  assert.equal(res.checks[1].status, 'near_limit');
  assert.equal(res.checks[1].percentOfLimit, 90);
  assert.equal(res.checks[1].deltaToThreshold, -0.6);
  assert.equal(res.checks[2].status, 'exceeds');
  assert.equal(res.checks[2].percentOfLimit, 125);
  assert.equal(res.checks[2].deltaToThreshold, 150);

  // Conflito de dispensa (isExempt = true apesar de exceder limites)
  const conflict = evaluateCalculatedTableRegulatoryLimits({
    addedSugarsPer100: 10.0,
    saturatedFatPer100: 3.5,
    sodiumMgPer100: null,
    physicalState: 'liquido',
    isExempt: true
  });
  assert.equal(conflict.required, false);
  assert.equal(conflict.hasExemptionConflict, true);
  assert.equal(conflict.hasMissingCriticalData, true);
  assert.equal(conflict.checks[2].status, 'missing_data');
  assert.deepEqual(conflict.suggestedClaims, ['AÇÚCAR ADICIONADO', 'GORDURA SATURADA']);

  // Receita Brownie (deve disparar Açúcar Adicionado e Gordura Saturada na auditoria automática)
  const brownie = INITIAL_NUTRITION_RECIPES.find((r) => r.id === 'rec-brownie-cacau')!;
  const brownieRes = calculateRecipeNutrition(brownie, ANVISA_FOOD_DATABASE);
  assert.equal(brownieRes.lupa.required, true);
  assert.equal(brownieRes.lupa.highAddedSugar, true);
  assert.equal(brownieRes.lupa.highSaturatedFat, true);
}

console.log('All NUTRITION LABEL AI engine tests passed!');
