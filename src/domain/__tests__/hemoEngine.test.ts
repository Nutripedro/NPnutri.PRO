import assert from 'node:assert/strict';
import {
  DEFAULT_COMPLEMENTARY_LABS,
  DEFAULT_HEMOGRAM_PARAMETERS,
  buildEmrContextFromPatient,
  calculateHematologicalIndexes,
  evaluateCompleteHemogram,
  evaluateMebProtocol
} from '../hemoEngine';
import { HemoParameterEntry, SavedHemogramRecord } from '../../types/hemo';
import { Patient } from '../../types';

function setParam(
  list: HemoParameterEntry[],
  id: string,
  value: number | null,
  percentValue?: number | null
) {
  const idx = list.findIndex((p) => p.id === id);
  assert.ok(idx >= 0, `Parameter ${id} should exist`);
  list[idx] = {
    ...list[idx],
    value,
    ...(percentValue !== undefined ? { percentValue } : {})
  };
}

// 1. Teste MEB exato do protocolo (6.4% + 18.4% + 0.8% = 25.6 -> elevado, eosinofilos)
{
  const params = DEFAULT_HEMOGRAM_PARAMETERS('female');
  setParam(params, 'mono', 410, 6.4);
  setParam(params, 'eos', 1180, 18.4);
  setParam(params, 'baso', 51, 0.8);

  const meb = evaluateMebProtocol(params, ['Diarreia persistente']);
  assert.equal(meb.calculable, true);
  assert.equal(meb.score, 25.6);
  assert.equal(meb.classificationKey, 'elevado');
  assert.equal(meb.predominantComponent, 'eosinofilos');
  assert.equal(meb.scientificLimitations.length, 5);
  assert.ok(meb.investigationSuggestions.length >= 2);
}

// 2. Teste fronteiras operacionais MEB (<9, 9-9.9, 10-15, >15)
{
  const testBand = (m: number, e: number, b: number, expectedKey: string) => {
    const params = DEFAULT_HEMOGRAM_PARAMETERS('male');
    setParam(params, 'mono', 400, m);
    setParam(params, 'eos', 100, e);
    setParam(params, 'baso', 20, b);
    const res = evaluateMebProtocol(params);
    assert.equal(res.classificationKey, expectedKey, `Expected ${expectedKey} for sum ${m + e + b}`);
  };

  testBand(6.0, 2.4, 0.5, 'equilibrio_provavel'); // 8.9
  testBand(6.0, 2.5, 0.5, 'limitrofe'); // 9.0
  testBand(6.4, 3.0, 0.5, 'limitrofe'); // 9.9
  testBand(6.5, 3.0, 0.5, 'alerta_investigacao'); // 10.0
  testBand(9.0, 5.0, 1.0, 'alerta_investigacao'); // 15.0
  testBand(9.1, 5.0, 1.0, 'elevado'); // 15.1
}

// 3. Teste recusa quando só há contagem absoluta (percentual ausente / null)
{
  const params = DEFAULT_HEMOGRAM_PARAMETERS('female');
  setParam(params, 'mono', 420, null);
  setParam(params, 'eos', 180, 2.5);
  setParam(params, 'baso', 30, 0.5);

  const meb = evaluateMebProtocol(params);
  assert.equal(meb.calculable, false);
  assert.equal(meb.score, null);
  assert.equal(meb.classificationKey, 'indisponivel');
  assert.ok(meb.reasonIfNotCalculable?.includes('Monócitos (%)'));
}

// 4. Teste Índices Hematológicos (NLR, PLR, MLR, SII, SIRI, AISI) + proteção denominador 0
{
  const params = DEFAULT_HEMOGRAM_PARAMETERS('male');
  setParam(params, 'neut', 4000, 60);
  setParam(params, 'linf', 2000, 30);
  setParam(params, 'mono', 500, 7.5);
  setParam(params, 'plt', 250000);

  const indexes = calculateHematologicalIndexes(params);
  const byId = new Map(indexes.map((i) => [i.id, i]));
  assert.equal(byId.get('NLR')?.result, 2.0);
  assert.equal(byId.get('PLR')?.result, 125.0);
  assert.equal(byId.get('MLR')?.result, 0.25);
  assert.equal(byId.get('SII')?.result, 500000);
  assert.equal(byId.get('SIRI')?.result, 1000);
  assert.equal(byId.get('AISI')?.result, 250000000);

  // Denominador 0 não deve quebrar nem gerar Infinity/NaN
  setParam(params, 'linf', 0, 0);
  const zeroDenom = calculateHematologicalIndexes(params);
  for (const idx of zeroDenom) {
    assert.equal(idx.calculable, false);
    assert.equal(idx.result, null);
    assert.ok(idx.unavailableReason?.includes('zero'));
  }
}

// 5. Teste Série Vermelha (anemia microcítica) + null preservation + deltas longitudinais
{
  const patient: Patient = {
    id: 'p1',
    name: 'Teste',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '1992-05-10',
    age: 34,
    sex: 'female',
    heightCm: 165,
    currentWeightKg: 62,
    initialWeightKg: 64,
    imc: 22.8,
    avatarInitials: 'TE',
    recordNumber: 'PR-101',
    goal: 'Saúde hematológica',
    lastAssessmentDate: '2026-10-01',
    unit: 'Matriz'
  };

  const prevParams = DEFAULT_HEMOGRAM_PARAMETERS('female');
  setParam(prevParams, 'hgb', 11.4);
  setParam(prevParams, 'vcm', 76.0);

  const prevRecord: SavedHemogramRecord = {
    id: 'rec-prev',
    patientId: 'p1',
    createdAt: '2026-08-01T10:00:00Z',
    metadata: {
      laboratoryName: 'Lab Anterior',
      collectionDate: '2026-08-01',
      examType: 'Hemograma Completo',
      extractedByOcr: false,
      ocrWarnings: []
    },
    parameters: prevParams,
    complementaryLabs: DEFAULT_COMPLEMENTARY_LABS(),
    clinicalContextSnapshot: buildEmrContextFromPatient(patient),
    mebScore: 9.2
  };

  const currParams = DEFAULT_HEMOGRAM_PARAMETERS('female');
  setParam(currParams, 'hgb', 10.6);
  setParam(currParams, 'vcm', 74.2);
  setParam(currParams, 'rdw', 16.4);
  setParam(currParams, 'retic', null); // ilegível/ausente não vira 0

  const comps = DEFAULT_COMPLEMENTARY_LABS();
  setParam(comps, 'ferritina', 11.2);

  const full = evaluateCompleteHemogram({
    parameters: currParams,
    complementaryLabs: comps,
    context: buildEmrContextFromPatient(patient),
    previousRecord: prevRecord,
    currentDate: '2026-10-01'
  });

  assert.ok(full.redSeries.compatiblePatterns.some((p) => p.includes('microcítica')));
  const reticOut = full.parameterOutputs.find((p) => p.id === 'retic');
  assert.equal(reticOut?.value, null);
  assert.equal(reticOut?.classification, 'nao_informado');

  const hgbDelta = full.longitudinalDeltas.find((d) => d.parameterId === 'hgb');
  assert.equal(hgbDelta?.deltaAbsolute, -0.8);
  assert.ok(full.complementaryCorrelations.some((c) => c.toLowerCase().includes('ferritina')));
}

console.log('✓ Todos os testes determinísticos do Hemo Intelligence Pro passaram!');
