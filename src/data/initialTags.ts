import type { SmartTag, ThermalLog } from '../types/smartTag';
import { createThermalLog } from '../services/kineticModel';
import { LOCAL_BROMATOLOGICAL_DATABASE } from '../services/bromatologicalData';

export function getInitialSmartTags(): SmartTag[] {
  const arrozProfile = LOCAL_BROMATOLOGICAL_DATABASE[0]; // Arroz con pollo (t0: 72h, Q10: 2.3)
  const lasanaProfile = LOCAL_BROMATOLOGICAL_DATABASE[3]; // Lasaña boloñesa (t0: 72h, Q10: 2.4)
  const cevicheProfile = LOCAL_BROMATOLOGICAL_DATABASE[16]; // Ceviche (t0: 24h, Q10: 2.6)
  const cremaProfile = LOCAL_BROMATOLOGICAL_DATABASE[4]; // Crema de zapallo (t0: 96h, Q10: 2.1)

  // Tag 1: Arroz con pollo - Con estrés térmico moderado
  const tag1Logs: ThermalLog[] = [];
  const log1a = createThermalLog(24, 4.0, 'Refrigeración normal inicial', arrozProfile, tag1Logs);
  tag1Logs.push(log1a);
  const log1b = createThermalLog(2.5, 22.0, 'Olvido en el mesón de cocina (almuerzo)', arrozProfile, tag1Logs);
  tag1Logs.push(log1b);
  const log1c = createThermalLog(12, 4.0, 'Retorno al refrigerador', arrozProfile, tag1Logs);
  tag1Logs.push(log1c);

  // Tag 2: Lasaña boloñesa - Refrigeración casi perfecta
  const tag2Logs: ThermalLog[] = [];
  const log2a = createThermalLog(16, 3.5, 'Refrigeración óptima en bandeja central', lasanaProfile, tag2Logs);
  tag2Logs.push(log2a);

  // Tag 3: Ceviche fresco - Muy degradado por corte de luz
  const tag3Logs: ThermalLog[] = [];
  const log3a = createThermalLog(6, 4.0, 'Refrigeración inicial post-preparación', cevicheProfile, tag3Logs);
  tag3Logs.push(log3a);
  const log3b = createThermalLog(5.5, 12.0, 'Alza térmica prolongada (corte de energía)', cevicheProfile, tag3Logs);
  tag3Logs.push(log3b);

  // Tag 4: Crema de zapallo - Reciente y fresco
  const tag4Logs: ThermalLog[] = [];
  const log4a = createThermalLog(8, 3.8, 'Refrigerado fresco en táper hermético', cremaProfile, tag4Logs);
  tag4Logs.push(log4a);

  return [
    {
      id: 'Tag #01',
      nfcUid: '04:A2:8B:19:3C',
      profile: arrozProfile,
      createdAt: Date.now() - 38.5 * 3600 * 1000,
      logs: tag1Logs,
      source: 'offline_fallback',
    },
    {
      id: 'Tag #02',
      nfcUid: '04:7F:3C:99:A1',
      profile: lasanaProfile,
      createdAt: Date.now() - 16 * 3600 * 1000,
      logs: tag2Logs,
      source: 'offline_fallback',
    },
    {
      id: 'Tag #03',
      nfcUid: '04:55:E2:01:88',
      profile: cevicheProfile,
      createdAt: Date.now() - 11.5 * 3600 * 1000,
      logs: tag3Logs,
      source: 'offline_fallback',
    },
    {
      id: 'Tag #04',
      nfcUid: '04:B1:90:6D:44',
      profile: cremaProfile,
      createdAt: Date.now() - 8 * 3600 * 1000,
      logs: tag4Logs,
      source: 'offline_fallback',
    },
  ];
}
