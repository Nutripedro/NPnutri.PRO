/**
 * Pediatric Growth Charts & Z-Score Engine (WHO / SISVAN)
 * Pure deterministic functions implementing WHO Child Growth Standards (2006)
 * and WHO Growth Reference (2007) for children and adolescents (0 to 19 years).
 */

import {
  PediatricBiologicalSex,
  GrowthIndexType,
  WHOLMSPoint,
  SISVANDiagnosis,
  ChartPlotDataPoint,
  PediatricMeasurement
} from '../types/growth';

/**
 * Normal Cumulative Distribution Function (Phi) approximation
 * High precision approximation (Abramowitz & Stegun 26.2.17)
 */
export function zScoreToPercentile(z: number): number {
  if (isNaN(z)) return 50;
  // Limit to avoid overflow
  if (z > 6) return 99.99;
  if (z < -6) return 0.01;

  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const poly = ((((b5 * t + b4) * t + b3) * t + b2) * t + b1) * t;
  const phi = 1.0 - c * Math.exp(-0.5 * absZ * absZ) * poly;

  const result = z >= 0 ? phi : 1.0 - phi;
  return Math.round(result * 1000) / 10; // e.g. 50.0%
}

/**
 * WHO Box-Cox LMS Transformation Formula
 * If L !== 0: Z = ((value / M)^L - 1) / (L * S)
 * If L === 0: Z = ln(value / M) / S
 */
export function calculateZScoreFromLMS(value: number, L: number, M: number, S: number): number {
  if (value <= 0 || M <= 0 || S <= 0) return 0;
  let z: number;
  if (Math.abs(L) > 0.00001) {
    z = (Math.pow(value / M, L) - 1) / (L * S);
  } else {
    z = Math.log(value / M) / S;
  }
  return Math.round(z * 100) / 100;
}

/**
 * Inverse LMS: Calculate value for a target Z-Score (e.g. Z = 0, +1, -2, etc.)
 * If L !== 0: Value = M * (1 + L * S * Z)^(1 / L)
 * If L === 0: Value = M * exp(S * Z)
 */
export function calculateValueFromZScore(z: number, L: number, M: number, S: number): number {
  if (M <= 0 || S <= 0) return 0;
  let val: number;
  if (Math.abs(L) > 0.00001) {
    const term = 1 + L * S * z;
    if (term <= 0) return 0;
    val = M * Math.pow(term, 1 / L);
  } else {
    val = M * Math.exp(S * z);
  }
  return Math.round(val * 100) / 100;
}

/**
 * Calculate exact age in months with fractional days
 */
export function calculateExactAge(birthDateStr: string, consultationDateStr: string): { months: number; display: string } {
  const birth = new Date(birthDateStr);
  const consult = new Date(consultationDateStr);
  
  if (isNaN(birth.getTime()) || isNaN(consult.getTime())) {
    return { months: 0, display: '0 meses' };
  }

  const diffTime = consult.getTime() - birth.getTime();
  const diffDays = Math.max(0, diffTime / (1000 * 60 * 60 * 24));
  
  // Average days per month (365.25 / 12 = 30.4375)
  const exactMonths = Math.round((diffDays / 30.4375) * 10) / 10;

  const years = Math.floor(exactMonths / 12);
  const remainingMonths = Math.floor(exactMonths % 12);
  const remainingDays = Math.round((exactMonths % 1) * 30.4375);

  let display = '';
  if (years > 0) {
    display = `${years} ano${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` e ${remainingMonths}m` : ''} (${exactMonths.toFixed(1)}m)`;
  } else {
    display = `${remainingMonths} m${remainingDays > 0 ? ` e ${remainingDays}d` : ''} (${exactMonths.toFixed(1)}m)`;
  }

  return { months: exactMonths, display };
}

// ============================================================================
// WHO LMS REFERENCE TABLES (WHO 2006: 0-60m & WHO 2007: 61-228m)
// Key milestone sampling with high-precision linear interpolation
// ============================================================================

export const WHO_HEIGHT_BOYS: WHOLMSPoint[] = [
  { ageMonths: 0, L: 1, M: 49.88, S: 0.03795 },
  { ageMonths: 1, L: 1, M: 54.72, S: 0.03558 },
  { ageMonths: 2, L: 1, M: 58.42, S: 0.03450 },
  { ageMonths: 3, L: 1, M: 61.43, S: 0.03387 },
  { ageMonths: 4, L: 1, M: 63.89, S: 0.03348 },
  { ageMonths: 5, L: 1, M: 65.90, S: 0.03322 },
  { ageMonths: 6, L: 1, M: 67.62, S: 0.03305 },
  { ageMonths: 8, L: 1, M: 70.58, S: 0.03290 },
  { ageMonths: 10, L: 1, M: 73.28, S: 0.03294 },
  { ageMonths: 12, L: 1, M: 75.75, S: 0.03310 },
  { ageMonths: 15, L: 1, M: 79.13, S: 0.03348 },
  { ageMonths: 18, L: 1, M: 82.31, S: 0.03398 },
  { ageMonths: 21, L: 1, M: 85.12, S: 0.03455 },
  { ageMonths: 24, L: 1, M: 87.80, S: 0.03518 },
  { ageMonths: 30, L: 1, M: 92.40, S: 0.03660 },
  { ageMonths: 36, L: 1, M: 96.10, S: 0.03810 },
  { ageMonths: 42, L: 1, M: 99.90, S: 0.03960 },
  { ageMonths: 48, L: 1, M: 103.3, S: 0.04110 },
  { ageMonths: 54, L: 1, M: 106.7, S: 0.04250 },
  { ageMonths: 60, L: 1, M: 110.0, S: 0.04390 },
  { ageMonths: 72, L: 1, M: 116.0, S: 0.04650 },
  { ageMonths: 84, L: 1, M: 121.7, S: 0.04900 },
  { ageMonths: 96, L: 1, M: 127.3, S: 0.05140 },
  { ageMonths: 108, L: 1, M: 132.6, S: 0.05360 },
  { ageMonths: 120, L: 1, M: 137.8, S: 0.05560 },
  { ageMonths: 144, L: 1, M: 149.1, S: 0.05850 },
  { ageMonths: 168, L: 1, M: 163.2, S: 0.05920 },
  { ageMonths: 192, L: 1, M: 172.9, S: 0.05710 },
  { ageMonths: 228, L: 1, M: 176.5, S: 0.05600 }
];

export const WHO_HEIGHT_GIRLS: WHOLMSPoint[] = [
  { ageMonths: 0, L: 1, M: 49.15, S: 0.03790 },
  { ageMonths: 1, L: 1, M: 53.69, S: 0.03560 },
  { ageMonths: 2, L: 1, M: 57.07, S: 0.03450 },
  { ageMonths: 3, L: 1, M: 59.80, S: 0.03390 },
  { ageMonths: 4, L: 1, M: 62.09, S: 0.03350 },
  { ageMonths: 5, L: 1, M: 64.00, S: 0.03330 },
  { ageMonths: 6, L: 1, M: 65.73, S: 0.03310 },
  { ageMonths: 8, L: 1, M: 68.74, S: 0.03300 },
  { ageMonths: 10, L: 1, M: 71.50, S: 0.03310 },
  { ageMonths: 12, L: 1, M: 74.02, S: 0.03330 },
  { ageMonths: 15, L: 1, M: 77.48, S: 0.03380 },
  { ageMonths: 18, L: 1, M: 80.70, S: 0.03440 },
  { ageMonths: 21, L: 1, M: 83.70, S: 0.03510 },
  { ageMonths: 24, L: 1, M: 86.40, S: 0.03590 },
  { ageMonths: 30, L: 1, M: 91.20, S: 0.03750 },
  { ageMonths: 36, L: 1, M: 95.10, S: 0.03920 },
  { ageMonths: 42, L: 1, M: 99.00, S: 0.04090 },
  { ageMonths: 48, L: 1, M: 102.7, S: 0.04260 },
  { ageMonths: 54, L: 1, M: 106.2, S: 0.04420 },
  { ageMonths: 60, L: 1, M: 109.4, S: 0.04580 },
  { ageMonths: 72, L: 1, M: 115.1, S: 0.04870 },
  { ageMonths: 84, L: 1, M: 120.8, S: 0.05140 },
  { ageMonths: 96, L: 1, M: 126.6, S: 0.05380 },
  { ageMonths: 108, L: 1, M: 132.5, S: 0.05580 },
  { ageMonths: 120, L: 1, M: 138.6, S: 0.05730 },
  { ageMonths: 144, L: 1, M: 151.2, S: 0.05810 },
  { ageMonths: 168, L: 1, M: 160.4, S: 0.05660 },
  { ageMonths: 192, L: 1, M: 163.2, S: 0.05510 },
  { ageMonths: 228, L: 1, M: 163.7, S: 0.05450 }
];

export const WHO_WEIGHT_BOYS: WHOLMSPoint[] = [
  { ageMonths: 0, L: -0.1600, M: 3.346, S: 0.1460 },
  { ageMonths: 1, L: -0.1965, M: 4.471, S: 0.1340 },
  { ageMonths: 2, L: -0.2185, M: 5.568, S: 0.1260 },
  { ageMonths: 3, L: -0.2295, M: 6.388, S: 0.1210 },
  { ageMonths: 4, L: -0.2325, M: 7.021, S: 0.1170 },
  { ageMonths: 5, L: -0.2315, M: 7.530, S: 0.1150 },
  { ageMonths: 6, L: -0.2285, M: 7.940, S: 0.1130 },
  { ageMonths: 8, L: -0.2205, M: 8.618, S: 0.1120 },
  { ageMonths: 10, L: -0.2115, M: 9.176, S: 0.1110 },
  { ageMonths: 12, L: -0.2015, M: 9.646, S: 0.1120 },
  { ageMonths: 15, L: -0.1875, M: 10.27, S: 0.1130 },
  { ageMonths: 18, L: -0.1745, M: 10.87, S: 0.1150 },
  { ageMonths: 21, L: -0.1625, M: 11.45, S: 0.1170 },
  { ageMonths: 24, L: -0.1515, M: 12.15, S: 0.1190 },
  { ageMonths: 30, L: -0.1335, M: 13.30, S: 0.1220 },
  { ageMonths: 36, L: -0.1185, M: 14.30, S: 0.1260 },
  { ageMonths: 42, L: -0.1065, M: 15.30, S: 0.1300 },
  { ageMonths: 48, L: -0.0965, M: 16.30, S: 0.1340 },
  { ageMonths: 54, L: -0.0885, M: 17.30, S: 0.1380 },
  { ageMonths: 60, L: -0.0825, M: 18.30, S: 0.1420 },
  { ageMonths: 72, L: -0.0750, M: 20.50, S: 0.1510 },
  { ageMonths: 84, L: -0.0700, M: 22.90, S: 0.1610 },
  { ageMonths: 96, L: -0.0650, M: 25.60, S: 0.1720 },
  { ageMonths: 108, L: -0.0600, M: 28.60, S: 0.1830 },
  { ageMonths: 120, L: -0.0550, M: 32.00, S: 0.1940 }
];

export const WHO_WEIGHT_GIRLS: WHOLMSPoint[] = [
  { ageMonths: 0, L: -0.2220, M: 3.232, S: 0.1420 },
  { ageMonths: 1, L: -0.2520, M: 4.187, S: 0.1330 },
  { ageMonths: 2, L: -0.2680, M: 5.128, S: 0.1260 },
  { ageMonths: 3, L: -0.2740, M: 5.845, S: 0.1220 },
  { ageMonths: 4, L: -0.2720, M: 6.424, S: 0.1190 },
  { ageMonths: 5, L: -0.2670, M: 6.899, S: 0.1180 },
  { ageMonths: 6, L: -0.2590, M: 7.297, S: 0.1170 },
  { ageMonths: 8, L: -0.2430, M: 7.954, S: 0.1160 },
  { ageMonths: 10, L: -0.2270, M: 8.513, S: 0.1170 },
  { ageMonths: 12, L: -0.2120, M: 8.950, S: 0.1180 },
  { ageMonths: 15, L: -0.1920, M: 9.580, S: 0.1200 },
  { ageMonths: 18, L: -0.1750, M: 10.16, S: 0.1230 },
  { ageMonths: 21, L: -0.1600, M: 10.74, S: 0.1260 },
  { ageMonths: 24, L: -0.1470, M: 11.50, S: 0.1280 },
  { ageMonths: 30, L: -0.1260, M: 12.70, S: 0.1330 },
  { ageMonths: 36, L: -0.1100, M: 13.90, S: 0.1380 },
  { ageMonths: 42, L: -0.0980, M: 15.00, S: 0.1440 },
  { ageMonths: 48, L: -0.0880, M: 16.10, S: 0.1500 },
  { ageMonths: 54, L: -0.0810, M: 17.20, S: 0.1560 },
  { ageMonths: 60, L: -0.0760, M: 18.20, S: 0.1620 },
  { ageMonths: 72, L: -0.0710, M: 20.20, S: 0.1730 },
  { ageMonths: 84, L: -0.0660, M: 22.40, S: 0.1850 },
  { ageMonths: 96, L: -0.0610, M: 25.00, S: 0.1970 },
  { ageMonths: 108, L: -0.0570, M: 28.20, S: 0.2080 },
  { ageMonths: 120, L: -0.0530, M: 31.90, S: 0.2180 }
];

export const WHO_BMI_BOYS: WHOLMSPoint[] = [
  { ageMonths: 0, L: 0.2000, M: 13.41, S: 0.0890 },
  { ageMonths: 1, L: 0.0500, M: 14.88, S: 0.0870 },
  { ageMonths: 2, L: -0.0800, M: 16.27, S: 0.0860 },
  { ageMonths: 3, L: -0.1800, M: 16.89, S: 0.0850 },
  { ageMonths: 4, L: -0.2500, M: 17.15, S: 0.0840 },
  { ageMonths: 5, L: -0.3000, M: 17.25, S: 0.0830 },
  { ageMonths: 6, L: -0.3300, M: 17.26, S: 0.0830 },
  { ageMonths: 8, L: -0.3600, M: 17.17, S: 0.0820 },
  { ageMonths: 10, L: -0.3700, M: 16.99, S: 0.0820 },
  { ageMonths: 12, L: -0.3700, M: 16.78, S: 0.0820 },
  { ageMonths: 15, L: -0.3600, M: 16.48, S: 0.0820 },
  { ageMonths: 18, L: -0.3400, M: 16.24, S: 0.0830 },
  { ageMonths: 21, L: -0.3200, M: 16.05, S: 0.0830 },
  { ageMonths: 24, L: -0.3000, M: 15.98, S: 0.0840 },
  { ageMonths: 30, L: -0.2700, M: 15.70, S: 0.0850 },
  { ageMonths: 36, L: -0.2500, M: 15.48, S: 0.0860 },
  { ageMonths: 42, L: -0.2300, M: 15.34, S: 0.0870 },
  { ageMonths: 48, L: -0.2200, M: 15.26, S: 0.0880 },
  { ageMonths: 54, L: -0.2100, M: 15.22, S: 0.0890 },
  { ageMonths: 60, L: -0.2000, M: 15.21, S: 0.0900 },
  { ageMonths: 72, L: -0.1900, M: 15.30, S: 0.0930 },
  { ageMonths: 84, L: -0.1800, M: 15.50, S: 0.0970 },
  { ageMonths: 96, L: -0.1700, M: 15.80, S: 0.1020 },
  { ageMonths: 108, L: -0.1600, M: 16.20, S: 0.1080 },
  { ageMonths: 120, L: -0.1500, M: 16.60, S: 0.1140 },
  { ageMonths: 144, L: -0.1400, M: 17.80, S: 0.1260 },
  { ageMonths: 168, L: -0.1300, M: 19.20, S: 0.1350 },
  { ageMonths: 192, L: -0.1200, M: 20.60, S: 0.1390 },
  { ageMonths: 228, L: -0.1100, M: 21.90, S: 0.1410 }
];

export const WHO_BMI_GIRLS: WHOLMSPoint[] = [
  { ageMonths: 0, L: 0.1500, M: 13.30, S: 0.0880 },
  { ageMonths: 1, L: 0.0200, M: 14.52, S: 0.0860 },
  { ageMonths: 2, L: -0.1000, M: 15.72, S: 0.0850 },
  { ageMonths: 3, L: -0.1900, M: 16.28, S: 0.0840 },
  { ageMonths: 4, L: -0.2500, M: 16.51, S: 0.0840 },
  { ageMonths: 5, L: -0.2900, M: 16.60, S: 0.0830 },
  { ageMonths: 6, L: -0.3200, M: 16.60, S: 0.0830 },
  { ageMonths: 8, L: -0.3500, M: 16.50, S: 0.0830 },
  { ageMonths: 10, L: -0.3600, M: 16.33, S: 0.0830 },
  { ageMonths: 12, L: -0.3600, M: 16.14, S: 0.0840 },
  { ageMonths: 15, L: -0.3500, M: 15.86, S: 0.0840 },
  { ageMonths: 18, L: -0.3300, M: 15.63, S: 0.0850 },
  { ageMonths: 21, L: -0.3100, M: 15.46, S: 0.0860 },
  { ageMonths: 24, L: -0.2900, M: 15.33, S: 0.0870 },
  { ageMonths: 30, L: -0.2600, M: 15.11, S: 0.0890 },
  { ageMonths: 36, L: -0.2400, M: 14.96, S: 0.0900 },
  { ageMonths: 42, L: -0.2200, M: 14.87, S: 0.0920 },
  { ageMonths: 48, L: -0.2100, M: 14.83, S: 0.0940 },
  { ageMonths: 54, L: -0.2000, M: 14.83, S: 0.0950 },
  { ageMonths: 60, L: -0.1900, M: 14.86, S: 0.0970 },
  { ageMonths: 72, L: -0.1800, M: 15.00, S: 0.1010 },
  { ageMonths: 84, L: -0.1700, M: 15.20, S: 0.1060 },
  { ageMonths: 96, L: -0.1600, M: 15.60, S: 0.1120 },
  { ageMonths: 108, L: -0.1500, M: 16.10, S: 0.1190 },
  { ageMonths: 120, L: -0.1400, M: 16.70, S: 0.1260 },
  { ageMonths: 144, L: -0.1300, M: 18.10, S: 0.1380 },
  { ageMonths: 168, L: -0.1200, M: 19.50, S: 0.1440 },
  { ageMonths: 192, L: -0.1100, M: 20.70, S: 0.1450 },
  { ageMonths: 228, L: -0.1000, M: 21.60, S: 0.1440 }
];

export const WHO_HEAD_CIRC_BOYS: WHOLMSPoint[] = [
  { ageMonths: 0, L: 1, M: 34.46, S: 0.0360 },
  { ageMonths: 1, L: 1, M: 37.26, S: 0.0335 },
  { ageMonths: 2, L: 1, M: 39.11, S: 0.0322 },
  { ageMonths: 3, L: 1, M: 40.54, S: 0.0315 },
  { ageMonths: 4, L: 1, M: 41.69, S: 0.0310 },
  { ageMonths: 5, L: 1, M: 42.65, S: 0.0306 },
  { ageMonths: 6, L: 1, M: 43.47, S: 0.0303 },
  { ageMonths: 8, L: 1, M: 44.82, S: 0.0299 },
  { ageMonths: 10, L: 1, M: 45.87, S: 0.0298 },
  { ageMonths: 12, L: 1, M: 46.72, S: 0.0298 },
  { ageMonths: 15, L: 1, M: 47.67, S: 0.0299 },
  { ageMonths: 18, L: 1, M: 48.37, S: 0.0301 },
  { ageMonths: 21, L: 1, M: 48.91, S: 0.0304 },
  { ageMonths: 24, L: 1, M: 49.33, S: 0.0307 },
  { ageMonths: 30, L: 1, M: 49.97, S: 0.0314 },
  { ageMonths: 36, L: 1, M: 50.45, S: 0.0321 },
  { ageMonths: 42, L: 1, M: 50.84, S: 0.0328 },
  { ageMonths: 48, L: 1, M: 51.17, S: 0.0335 },
  { ageMonths: 54, L: 1, M: 51.46, S: 0.0341 },
  { ageMonths: 60, L: 1, M: 51.72, S: 0.0347 }
];

export const WHO_HEAD_CIRC_GIRLS: WHOLMSPoint[] = [
  { ageMonths: 0, L: 1, M: 33.88, S: 0.0350 },
  { ageMonths: 1, L: 1, M: 36.49, S: 0.0330 },
  { ageMonths: 2, L: 1, M: 38.25, S: 0.0318 },
  { ageMonths: 3, L: 1, M: 39.63, S: 0.0311 },
  { ageMonths: 4, L: 1, M: 40.75, S: 0.0307 },
  { ageMonths: 5, L: 1, M: 41.69, S: 0.0304 },
  { ageMonths: 6, L: 1, M: 42.49, S: 0.0302 },
  { ageMonths: 8, L: 1, M: 43.80, S: 0.0300 },
  { ageMonths: 10, L: 1, M: 44.82, S: 0.0300 },
  { ageMonths: 12, L: 1, M: 45.64, S: 0.0302 },
  { ageMonths: 15, L: 1, M: 46.56, S: 0.0305 },
  { ageMonths: 18, L: 1, M: 47.24, S: 0.0308 },
  { ageMonths: 21, L: 1, M: 47.77, S: 0.0312 },
  { ageMonths: 24, L: 1, M: 48.18, S: 0.0316 },
  { ageMonths: 30, L: 1, M: 48.81, S: 0.0323 },
  { ageMonths: 36, L: 1, M: 49.30, S: 0.0330 },
  { ageMonths: 42, L: 1, M: 49.69, S: 0.0337 },
  { ageMonths: 48, L: 1, M: 50.02, S: 0.0343 },
  { ageMonths: 54, L: 1, M: 50.31, S: 0.0349 },
  { ageMonths: 60, L: 1, M: 50.56, S: 0.0354 }
];

/**
 * Linear interpolation of LMS parameters for any fractional age in months
 */
export function interpolateLMS(table: WHOLMSPoint[], ageMonths: number): { L: number; M: number; S: number } {
  if (ageMonths <= table[0].ageMonths) {
    return { L: table[0].L, M: table[0].M, S: table[0].S };
  }
  const lastIndex = table.length - 1;
  if (ageMonths >= table[lastIndex].ageMonths) {
    return { L: table[lastIndex].L, M: table[lastIndex].M, S: table[lastIndex].S };
  }

  // Find surrounding interval [low, high]
  for (let i = 0; i < lastIndex; i++) {
    const p1 = table[i];
    const p2 = table[i + 1];
    if (ageMonths >= p1.ageMonths && ageMonths <= p2.ageMonths) {
      const fraction = (ageMonths - p1.ageMonths) / (p2.ageMonths - p1.ageMonths);
      const L = p1.L + fraction * (p2.L - p1.L);
      const M = p1.M + fraction * (p2.M - p1.M);
      const S = p1.S + fraction * (p2.S - p1.S);
      return { L, M, S };
    }
  }

  return { L: table[0].L, M: table[0].M, S: table[0].S };
}

/**
 * Dispatcher to select LMS table for a given index and sex
 */
export function getLMSTable(index: GrowthIndexType, sex: PediatricBiologicalSex): WHOLMSPoint[] {
  switch (index) {
    case 'height_for_age':
      return sex === 'male' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS;
    case 'weight_for_age':
      return sex === 'male' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
    case 'bmi_for_age':
      return sex === 'male' ? WHO_BMI_BOYS : WHO_BMI_GIRLS;
    case 'head_circ_for_age':
      return sex === 'male' ? WHO_HEAD_CIRC_BOYS : WHO_HEAD_CIRC_GIRLS;
    default:
      return WHO_HEIGHT_BOYS;
  }
}

/**
 * Universal Calculation of Z-Score and Percentile for a patient measurement
 */
export function evaluatePediatricIndex(
  value: number,
  ageMonths: number,
  index: GrowthIndexType,
  sex: PediatricBiologicalSex
): { zScore: number; percentile: number; L: number; M: number; S: number } {
  const table = getLMSTable(index, sex);
  const lms = interpolateLMS(table, ageMonths);
  const zScore = calculateZScoreFromLMS(value, lms.L, lms.M, lms.S);
  const percentile = zScoreToPercentile(zScore);

  return { zScore, percentile, ...lms };
}

// ============================================================================
// AUTOMATIC SISVAN / WHO NUTRITIONAL DIAGNOSTIC CLASSIFICATION
// Deterministic rules as required by the medical/nutritional specification
// ============================================================================

/**
 * 1. Estatura / Comprimento para Idade (E/I) - Todas as idades
 */
export function classifyHeightForAge(zScore: number, percentile: number): SISVANDiagnosis {
  if (zScore < -3) {
    return {
      index: 'height_for_age',
      indexLabel: 'Estatura para Idade (E/I)',
      zScore,
      percentile,
      classification: 'Muito Baixa Estatura para a Idade',
      severity: 'grave',
      clinicalGuidance: 'Investigação urgente de desnutrição crônica, déficit de GH ou doenças osteometabólicas.',
      badgeBgColor: 'bg-rose-100',
      badgeTextColor: 'text-rose-800',
      borderColor: 'border-rose-400'
    };
  }
  if (zScore < -2) {
    return {
      index: 'height_for_age',
      indexLabel: 'Estatura para Idade (E/I)',
      zScore,
      percentile,
      classification: 'Baixa Estatura para a Idade',
      severity: 'alerta',
      clinicalGuidance: 'Avaliar velocidade de crescimento e aporte proteico-calórico crônico.',
      badgeBgColor: 'bg-amber-100',
      badgeTextColor: 'text-amber-800',
      borderColor: 'border-amber-400'
    };
  }
  return {
    index: 'height_for_age',
    indexLabel: 'Estatura para Idade (E/I)',
    zScore,
    percentile,
    classification: 'Estatura Adequada para a Idade',
    severity: 'eutrofico',
    clinicalGuidance: 'Crescimento estatural linear adequado segundo os referenciais da OMS.',
    badgeBgColor: 'bg-emerald-100',
    badgeTextColor: 'text-emerald-800',
    borderColor: 'border-emerald-400'
  };
}

/**
 * 2. Peso para Idade (P/I) - Indicado principalmente até 10 anos
 */
export function classifyWeightForAge(zScore: number, percentile: number): SISVANDiagnosis {
  if (zScore < -3) {
    return {
      index: 'weight_for_age',
      indexLabel: 'Peso para Idade (P/I)',
      zScore,
      percentile,
      classification: 'Muito Baixo Peso para a Idade',
      severity: 'grave',
      clinicalGuidance: 'Déficit ponderal acentuado. Risco nutricional elevado; intervenção terapêutica imediata.',
      badgeBgColor: 'bg-rose-100',
      badgeTextColor: 'text-rose-800',
      borderColor: 'border-rose-400'
    };
  }
  if (zScore < -2) {
    return {
      index: 'weight_for_age',
      indexLabel: 'Peso para Idade (P/I)',
      zScore,
      percentile,
      classification: 'Baixo Peso para a Idade',
      severity: 'alerta',
      clinicalGuidance: 'Aporte calórico insuficiente. Monitorar ganho ponderal semanal.',
      badgeBgColor: 'bg-amber-100',
      badgeTextColor: 'text-amber-800',
      borderColor: 'border-amber-400'
    };
  }
  if (zScore <= 2) {
    return {
      index: 'weight_for_age',
      indexLabel: 'Peso para Idade (P/I)',
      zScore,
      percentile,
      classification: 'Peso Adequado para a Idade',
      severity: 'eutrofico',
      clinicalGuidance: 'Evolução ponderal em faixa normal de normalidade e saúde metabólica.',
      badgeBgColor: 'bg-emerald-100',
      badgeTextColor: 'text-emerald-800',
      borderColor: 'border-emerald-400'
    };
  }
  return {
    index: 'weight_for_age',
    indexLabel: 'Peso para Idade (P/I)',
    zScore,
    percentile,
    classification: 'Peso Elevado para a Idade',
    severity: 'sobrepeso',
    clinicalGuidance: 'Avaliar composição corporal e cruzar com o índice de IMC para Idade.',
    badgeBgColor: 'bg-amber-100',
    badgeTextColor: 'text-amber-900',
    borderColor: 'border-amber-400'
  };
}

/**
 * 3. IMC para Idade (IMC/I) - Critérios Oficiais SISVAN / OMS
 * Diferenciação estrita entre < 5 anos e 5 a 19 anos
 */
export function classifyBMIForAge(zScore: number, percentile: number, ageMonths: number): SISVANDiagnosis {
  const isUnder5Years = ageMonths < 60;

  if (isUnder5Years) {
    // Menores de 5 anos (0 a 60 meses)
    if (zScore < -3) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (0 a 5 anos)',
        zScore,
        percentile,
        classification: 'Magreza Acentuada',
        severity: 'grave',
        clinicalGuidance: 'Desnutrição aguda grave. Conduta intensiva para reabilitação nutricional.',
        badgeBgColor: 'bg-rose-100',
        badgeTextColor: 'text-rose-900',
        borderColor: 'border-rose-400'
      };
    }
    if (zScore < -2) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (0 a 5 anos)',
        zScore,
        percentile,
        classification: 'Magreza',
        severity: 'alerta',
        clinicalGuidance: 'Déficit ponderal em relação à estatura. Adequar densidade energética das refeições.',
        badgeBgColor: 'bg-amber-100',
        badgeTextColor: 'text-amber-800',
        borderColor: 'border-amber-400'
      };
    }
    if (zScore <= 1) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (0 a 5 anos)',
        zScore,
        percentile,
        classification: 'Eutrofia',
        severity: 'eutrofico',
        clinicalGuidance: 'Equilíbrio pondero-estatural excelente segundo o padrão de ouro da OMS.',
        badgeBgColor: 'bg-emerald-100',
        badgeTextColor: 'text-emerald-800',
        borderColor: 'border-emerald-400'
      };
    }
    if (zScore <= 2) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (0 a 5 anos)',
        zScore,
        percentile,
        classification: 'Risco de Sobrepeso',
        severity: 'alerta',
        clinicalGuidance: 'Atenção preventiva: orientar introdução alimentar equilibrada e limitar ultraprocessados.',
        badgeBgColor: 'bg-amber-100',
        badgeTextColor: 'text-amber-900',
        borderColor: 'border-amber-400'
      };
    }
    if (zScore <= 3) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (0 a 5 anos)',
        zScore,
        percentile,
        classification: 'Sobrepeso',
        severity: 'sobrepeso',
        clinicalGuidance: 'Vigilância dietética ativa. Estimular brincadeiras ativas e regular horário de sono.',
        badgeBgColor: 'bg-orange-100',
        badgeTextColor: 'text-orange-900',
        borderColor: 'border-orange-400'
      };
    }
    return {
      index: 'bmi_for_age',
      indexLabel: 'IMC para Idade (0 a 5 anos)',
      zScore,
      percentile,
      classification: 'Obesidade',
      severity: 'obesidade',
      clinicalGuidance: 'Risco metabólico infantil. Reestruturação alimentar da rotina familiar.',
      badgeBgColor: 'bg-rose-100',
      badgeTextColor: 'text-rose-950',
      borderColor: 'border-rose-500'
    };
  } else {
    // 5 a 19 anos (Crianças e Adolescentes)
    if (zScore < -3) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (5 a 19 anos)',
        zScore,
        percentile,
        classification: 'Magreza Acentuada',
        severity: 'grave',
        clinicalGuidance: 'Investigar transtornos alimentares, doenças disabsortivas ou desnutrição.',
        badgeBgColor: 'bg-rose-100',
        badgeTextColor: 'text-rose-900',
        borderColor: 'border-rose-400'
      };
    }
    if (zScore < -2) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (5 a 19 anos)',
        zScore,
        percentile,
        classification: 'Magreza',
        severity: 'alerta',
        clinicalGuidance: 'Baixo peso relativo à estatura. Estimular consumo hipercalórico funcional.',
        badgeBgColor: 'bg-amber-100',
        badgeTextColor: 'text-amber-800',
        borderColor: 'border-amber-400'
      };
    }
    if (zScore <= 1) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (5 a 19 anos)',
        zScore,
        percentile,
        classification: 'Eutrofia',
        severity: 'eutrofico',
        clinicalGuidance: 'IMC adequado para a faixa etária e sexo segundo a referência OMS 2007.',
        badgeBgColor: 'bg-emerald-100',
        badgeTextColor: 'text-emerald-800',
        borderColor: 'border-emerald-400'
      };
    }
    if (zScore <= 2) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (5 a 19 anos)',
        zScore,
        percentile,
        classification: 'Sobrepeso',
        severity: 'sobrepeso',
        clinicalGuidance: 'Intervenção no estilo de vida, atividade física e redução de bebidas açucaradas.',
        badgeBgColor: 'bg-amber-100',
        badgeTextColor: 'text-amber-900',
        borderColor: 'border-amber-400'
      };
    }
    if (zScore <= 3) {
      return {
        index: 'bmi_for_age',
        indexLabel: 'IMC para Idade (5 a 19 anos)',
        zScore,
        percentile,
        classification: 'Obesidade',
        severity: 'obesidade',
        clinicalGuidance: 'Rastrear perfil lipídico, glicemia de jejum e pressão arterial.',
        badgeBgColor: 'bg-orange-100',
        badgeTextColor: 'text-orange-950',
        borderColor: 'border-orange-500'
      };
    }
    return {
      index: 'bmi_for_age',
      indexLabel: 'IMC para Idade (5 a 19 anos)',
      zScore,
      percentile,
      classification: 'Obesidade Grave',
      severity: 'grave',
      clinicalGuidance: 'Acompanhamento multiprofissional urgente (pediatra + nutricionista).',
      badgeBgColor: 'bg-rose-200',
      badgeTextColor: 'text-rose-950',
      borderColor: 'border-rose-600'
    };
  }
}

/**
 * 4. Perímetro Cefálico para Idade (PC/I) - 0 a 60 meses
 */
export function classifyHeadCircForAge(zScore: number, percentile: number): SISVANDiagnosis {
  if (zScore < -2) {
    return {
      index: 'head_circ_for_age',
      indexLabel: 'Perímetro Cefálico para Idade (PC/I)',
      zScore,
      percentile,
      classification: 'Microcefalia / PC Abaixo do Esperado',
      severity: 'grave',
      clinicalGuidance: 'Investigação neuropediátrica e acompanhamento minucioso de fechamento de fontanelas.',
      badgeBgColor: 'bg-rose-100',
      badgeTextColor: 'text-rose-900',
      borderColor: 'border-rose-400'
    };
  }
  if (zScore <= 2) {
    return {
      index: 'head_circ_for_age',
      indexLabel: 'Perímetro Cefálico para Idade (PC/I)',
      zScore,
      percentile,
      classification: 'Normocefalia / Adequado',
      severity: 'eutrofico',
      clinicalGuidance: 'Desenvolvimento do perímetro cefálico harmonioso e dentro do padrão da OMS.',
      badgeBgColor: 'bg-emerald-100',
      badgeTextColor: 'text-emerald-800',
      borderColor: 'border-emerald-400'
    };
  }
  return {
    index: 'head_circ_for_age',
    indexLabel: 'Perímetro Cefálico para Idade (PC/I)',
    zScore,
    percentile,
    classification: 'Macrocefalia / PC Acima do Esperado',
    severity: 'alerta',
    clinicalGuidance: 'Avaliar histórico familiar (macrocefalia benigna) ou investigar hidrocefalia/hipertensão intracraniana.',
    badgeBgColor: 'bg-amber-100',
    badgeTextColor: 'text-amber-900',
    borderColor: 'border-amber-400'
  };
}

/**
 * Comprehensive Evaluation of a Single Pediatric Consultation Measurement
 */
export function evaluateFullMeasurement(
  measurement: PediatricMeasurement,
  sex: PediatricBiologicalSex
): PediatricMeasurement {
  const ageMonths = measurement.ageMonths;
  const height = measurement.heightCm;
  const weight = measurement.weightKg;
  const headCirc = measurement.headCircumferenceCm;
  
  // Calculate BMI if height and weight are provided
  let bmi = measurement.bmi;
  if (!bmi && height && weight && height > 0) {
    const heightM = height / 100;
    bmi = Math.round((weight / (heightM * heightM)) * 100) / 100;
  }

  const zScores: PediatricMeasurement['zScores'] = {};
  const percentiles: PediatricMeasurement['percentiles'] = {};
  const diagnostics: PediatricMeasurement['diagnostics'] = {};

  // 1. Estatura / Idade
  if (height && height > 0) {
    const res = evaluatePediatricIndex(height, ageMonths, 'height_for_age', sex);
    zScores.heightForAge = res.zScore;
    percentiles.heightForAge = res.percentile;
    diagnostics.heightForAge = classifyHeightForAge(res.zScore, res.percentile);
  }

  // 2. Peso / Idade
  if (weight && weight > 0) {
    const res = evaluatePediatricIndex(weight, ageMonths, 'weight_for_age', sex);
    zScores.weightForAge = res.zScore;
    percentiles.weightForAge = res.percentile;
    diagnostics.weightForAge = classifyWeightForAge(res.zScore, res.percentile);
  }

  // 3. IMC / Idade
  if (bmi && bmi > 0) {
    const res = evaluatePediatricIndex(bmi, ageMonths, 'bmi_for_age', sex);
    zScores.bmiForAge = res.zScore;
    percentiles.bmiForAge = res.percentile;
    diagnostics.bmiForAge = classifyBMIForAge(res.zScore, res.percentile, ageMonths);
  }

  // 4. Perímetro Cefálico / Idade (até 60 meses)
  if (headCirc && headCirc > 0 && ageMonths <= 60) {
    const res = evaluatePediatricIndex(headCirc, ageMonths, 'head_circ_for_age', sex);
    zScores.headCircForAge = res.zScore;
    percentiles.headCircForAge = res.percentile;
    diagnostics.headCircForAge = classifyHeadCircForAge(res.zScore, res.percentile);
  }

  return {
    ...measurement,
    bmi,
    zScores,
    percentiles,
    diagnostics
  };
}

/**
 * Generate Chart Data Points for Recharts:
 * Combines WHO SD lines (-3, -2, -1, 0, +1, +2, +3) and overlays patient measurement dots
 */
export function generateChartDataset(
  index: GrowthIndexType,
  sex: PediatricBiologicalSex,
  maxAgeMonths: number = 60,
  measurements: PediatricMeasurement[] = []
): ChartPlotDataPoint[] {
  const table = getLMSTable(index, sex);
  
  // Filter table by max age bracket
  const filteredTable = table.filter(p => p.ageMonths <= maxAgeMonths);

  // Map table points and compute 7 WHO Z-Score lines
  const dataPoints: ChartPlotDataPoint[] = filteredTable.map(point => {
    const { ageMonths, L, M, S } = point;
    const sd3neg = calculateValueFromZScore(-3, L, M, S);
    const sd2neg = calculateValueFromZScore(-2, L, M, S);
    const sd1neg = calculateValueFromZScore(-1, L, M, S);
    const sd0 = calculateValueFromZScore(0, L, M, S);
    const sd1pos = calculateValueFromZScore(1, L, M, S);
    const sd2pos = calculateValueFromZScore(2, L, M, S);
    const sd3pos = calculateValueFromZScore(3, L, M, S);

    let ageLabel = `${ageMonths}m`;
    if (ageMonths >= 12 && ageMonths % 12 === 0) {
      ageLabel = `${ageMonths / 12}a`;
    }

    // Check if patient has a measurement close to this age point
    const match = measurements.find(m => Math.abs(m.ageMonths - ageMonths) < 0.25);
    let patientValue: number | undefined;
    let patientZScore: number | undefined;
    let patientDate: string | undefined;

    if (match) {
      if (index === 'height_for_age') patientValue = match.heightCm;
      else if (index === 'weight_for_age') patientValue = match.weightKg;
      else if (index === 'bmi_for_age') patientValue = match.bmi;
      else if (index === 'head_circ_for_age') patientValue = match.headCircumferenceCm;

      if (patientValue) {
        patientZScore = calculateZScoreFromLMS(patientValue, L, M, S);
        patientDate = match.consultationDate;
      }
    }

    return {
      ageMonths,
      ageLabel,
      sd3neg,
      sd2neg,
      sd1neg,
      sd0,
      sd1pos,
      sd2pos,
      sd3pos,
      patientValue,
      patientZScore,
      patientDate
    };
  });

  // If patient has measurements that don't fall directly on sampled grid points, insert them smoothly
  measurements.forEach(m => {
    if (m.ageMonths > maxAgeMonths) return;
    
    let val: number | undefined;
    if (index === 'height_for_age') val = m.heightCm;
    else if (index === 'weight_for_age') val = m.weightKg;
    else if (index === 'bmi_for_age') val = m.bmi;
    else if (index === 'head_circ_for_age') val = m.headCircumferenceCm;

    if (!val) return;

    const alreadyExists = dataPoints.some(dp => Math.abs(dp.ageMonths - m.ageMonths) < 0.25);
    if (!alreadyExists) {
      const lms = interpolateLMS(table, m.ageMonths);
      const zScore = calculateZScoreFromLMS(val, lms.L, lms.M, lms.S);

      dataPoints.push({
        ageMonths: m.ageMonths,
        ageLabel: `${m.ageMonths.toFixed(1)}m`,
        sd3neg: calculateValueFromZScore(-3, lms.L, lms.M, lms.S),
        sd2neg: calculateValueFromZScore(-2, lms.L, lms.M, lms.S),
        sd1neg: calculateValueFromZScore(-1, lms.L, lms.M, lms.S),
        sd0: calculateValueFromZScore(0, lms.L, lms.M, lms.S),
        sd1pos: calculateValueFromZScore(1, lms.L, lms.M, lms.S),
        sd2pos: calculateValueFromZScore(2, lms.L, lms.M, lms.S),
        sd3pos: calculateValueFromZScore(3, lms.L, lms.M, lms.S),
        patientValue: val,
        patientZScore: zScore,
        patientDate: m.consultationDate
      });
    }
  });

  // Sort by age in months ascending
  return dataPoints.sort((a, b) => a.ageMonths - b.ageMonths);
}
