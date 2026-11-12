import { PediatricPatient } from '../types/growth';
import { evaluateFullMeasurement } from '../lib/zscore-calculator';

/**
 * Pre-configured Pediatric Patients with Longitudinal Anthropometric Records
 * (0 to 60 months and school-age)
 */
export const INITIAL_PEDIATRIC_PATIENTS: PediatricPatient[] = [
  {
    id: 'ped-theo',
    name: 'Theo Albuquerque Santos',
    birthDate: '2024-05-10', // ~18 months old
    sex: 'male',
    gestationalWeeksAtBirth: 39,
    birthWeightKg: 3.42,
    birthLengthCm: 50.2,
    birthHeadCircCm: 35.0,
    motherName: 'Juliana Albuquerque',
    pediatricianName: 'Dra. Camila Vasconcellos (CRN-3 48910)',
    recordNumber: '#PED-0192',
    measurements: [
      evaluateFullMeasurement({
        id: 'meas-00',
        consultationDate: '2024-05-10',
        ageMonths: 0.0,
        ageDisplay: 'Ao Nascer (0m)',
        weightKg: 3.42,
        heightCm: 50.2,
        headCircumferenceCm: 35.0,
        notes: 'Parto a termo saudável. Apgar 9/10. Aleitamento materno exclusivo iniciado na primeira hora.'
      }, 'male'),
      evaluateFullMeasurement({
        id: 'meas-01',
        consultationDate: '2024-06-12',
        ageMonths: 1.1,
        ageDisplay: '1 mês e 3d (1.1m)',
        weightKg: 4.60,
        heightCm: 55.1,
        headCircumferenceCm: 37.5,
        notes: 'Ganho ponderal de 39g/dia. Pega adequada da mama, sem fissuras maternas.'
      }, 'male'),
      evaluateFullMeasurement({
        id: 'meas-02',
        consultationDate: '2024-07-10',
        ageMonths: 2.0,
        ageDisplay: '2 meses (2.0m)',
        weightKg: 5.75,
        heightCm: 58.8,
        headCircumferenceCm: 39.3,
        notes: 'Sorrisos sociais, tônus cervical adequado. Vacinas do 2º mês realizadas.'
      }, 'male'),
      evaluateFullMeasurement({
        id: 'meas-03',
        consultationDate: '2024-09-15',
        ageMonths: 4.2,
        ageDisplay: '4 meses e 5d (4.2m)',
        weightKg: 7.20,
        heightCm: 64.5,
        headCircumferenceCm: 41.8,
        notes: 'Sustenta a cabeça com firmeza. Curva de estatura acompanhando percentil 50-85.'
      }, 'male'),
      evaluateFullMeasurement({
        id: 'meas-04',
        consultationDate: '2024-11-12',
        ageMonths: 6.1,
        ageDisplay: '6 meses (6.1m)',
        weightKg: 8.10,
        heightCm: 68.2,
        headCircumferenceCm: 43.6,
        notes: 'Início da introdução alimentar (IA) método BLW adaptado. Excelente aceitação de legumes e frutas.'
      }, 'male'),
      evaluateFullMeasurement({
        id: 'meas-05',
        consultationDate: '2025-02-10',
        ageMonths: 9.0,
        ageDisplay: '9 meses (9.0m)',
        weightKg: 9.20,
        heightCm: 72.4,
        headCircumferenceCm: 45.4,
        notes: 'Engatinhando com agilidade, senta sem apoio. Consumo de ferro profilático mantido.'
      }, 'male'),
      evaluateFullMeasurement({
        id: 'meas-06',
        consultationDate: '2025-05-15',
        ageMonths: 12.2,
        ageDisplay: '1 ano e 5d (12.2m)',
        weightKg: 10.15,
        heightCm: 76.5,
        headCircumferenceCm: 46.8,
        notes: 'Primeiros passos independentes. Transição para alimentação da família com baixo teor de sódio.'
      }, 'male'),
      evaluateFullMeasurement({
        id: 'meas-07',
        consultationDate: '2025-11-10',
        ageMonths: 18.0,
        ageDisplay: '1 ano e 6m (18.0m)',
        weightKg: 11.45,
        heightCm: 83.0,
        headCircumferenceCm: 48.5,
        notes: 'Consulta atual: Eutrófico. Crescimento linear harmonioso no canal Z = +0.25 SD.'
      }, 'male')
    ]
  },
  {
    id: 'ped-alice',
    name: 'Alice Guimarães Ferreira',
    birthDate: '2022-08-20', // ~3.5 years old
    sex: 'female',
    gestationalWeeksAtBirth: 40,
    birthWeightKg: 3.15,
    birthLengthCm: 49.0,
    birthHeadCircCm: 34.0,
    motherName: 'Mariana Guimarães',
    pediatricianName: 'Dra. Camila Vasconcellos (CRN-3 48910)',
    recordNumber: '#PED-0084',
    measurements: [
      evaluateFullMeasurement({
        id: 'meas-a0',
        consultationDate: '2022-08-20',
        ageMonths: 0.0,
        ageDisplay: 'Ao Nascer (0m)',
        weightKg: 3.15,
        heightCm: 49.0,
        headCircumferenceCm: 34.0,
        notes: 'Nascimento saudável.'
      }, 'female'),
      evaluateFullMeasurement({
        id: 'meas-a1',
        consultationDate: '2023-02-20',
        ageMonths: 6.0,
        ageDisplay: '6 meses (6.0m)',
        weightKg: 7.40,
        heightCm: 66.0,
        headCircumferenceCm: 42.5,
        notes: 'Aleitamento materno e introdução de papas principais.'
      }, 'female'),
      evaluateFullMeasurement({
        id: 'meas-a2',
        consultationDate: '2023-08-20',
        ageMonths: 12.0,
        ageDisplay: '1 ano (12.0m)',
        weightKg: 9.10,
        heightCm: 74.5,
        headCircumferenceCm: 45.7,
        notes: 'Eutrófica, boa aceitação de variedade de vegetais.'
      }, 'female'),
      evaluateFullMeasurement({
        id: 'meas-a3',
        consultationDate: '2024-08-20',
        ageMonths: 24.0,
        ageDisplay: '2 anos (24.0m)',
        weightKg: 11.60,
        heightCm: 86.8,
        headCircumferenceCm: 48.2,
        notes: 'Desenvolvimento motor e cognitivo plenos.'
      }, 'female'),
      evaluateFullMeasurement({
        id: 'meas-a4',
        consultationDate: '2025-08-20',
        ageMonths: 36.0,
        ageDisplay: '3 anos (36.0m)',
        weightKg: 14.20,
        heightCm: 95.5,
        headCircumferenceCm: 49.4,
        notes: 'Consulta dos 3 anos: Eutrófica, IMC p/ idade adequado.'
      }, 'female')
    ]
  }
];
