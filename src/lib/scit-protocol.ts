/**
 * Protocolo SCIT — Imunoterapia Específica Subcutânea
 *
 * Indução: 16 passos linearizados ao longo de 4 concentrações (1:10.000 → 1:1.000 → 1:100 → 1:10).
 * Cada concentração inicia em 0,1ml e dobra até 0,8ml (último passo de 1:10 é 0,5ml = meta).
 * Intervalo padrão na indução: 7 dias.
 *
 * Manutenção: mantém 1:10 — 0,5ml (meta). Intervalo progride 14 → 21 → 28 dias
 * conforme tolerância do paciente.
 */

export interface SCITStep {
  conc: string
  vol: string
}

export const INDUCTION_SEQUENCE: SCITStep[] = [
  { conc: '1:10.000', vol: '0,1ml' },
  { conc: '1:10.000', vol: '0,2ml' },
  { conc: '1:10.000', vol: '0,4ml' },
  { conc: '1:10.000', vol: '0,8ml' },
  { conc: '1:1.000', vol: '0,1ml' },
  { conc: '1:1.000', vol: '0,2ml' },
  { conc: '1:1.000', vol: '0,4ml' },
  { conc: '1:1.000', vol: '0,8ml' },
  { conc: '1:100', vol: '0,1ml' },
  { conc: '1:100', vol: '0,2ml' },
  { conc: '1:100', vol: '0,4ml' },
  { conc: '1:100', vol: '0,8ml' },
  { conc: '1:10', vol: '0,1ml' },
  { conc: '1:10', vol: '0,2ml' },
  { conc: '1:10', vol: '0,4ml' },
  { conc: '1:10', vol: '0,5ml' },
]

export const INDUCTION_INTERVAL = 7
export const MAINTENANCE_INTERVALS = [14, 21, 28] as const
export const META_STEP = INDUCTION_SEQUENCE[INDUCTION_SEQUENCE.length - 1]
export const META_DOSE = `${META_STEP.conc} - ${META_STEP.vol}`

export function doseString(step: SCITStep): string {
  return `${step.conc} - ${step.vol}`
}

export function parseDose(dose: string): SCITStep | null {
  const parts = dose.split(' - ').map((s) => s.trim())
  if (parts.length !== 2) return null
  return { conc: parts[0], vol: parts[1] }
}

export function findStepIndex(dose: string): number {
  return INDUCTION_SEQUENCE.findIndex((s) => doseString(s) === dose)
}

export type ProtocolPhase = 'inducao' | 'manutencao'

export interface NextDoseResult {
  dose: string
  interval: number
  phase: ProtocolPhase
  reachesMeta: boolean
  advancesMaintenanceInterval: boolean
}

export function calculateNextDose(currentDose: string, currentInterval: number): NextDoseResult {
  const idx = findStepIndex(currentDose)
  if (idx >= 0 && idx < INDUCTION_SEQUENCE.length - 1) {
    return {
      dose: doseString(INDUCTION_SEQUENCE[idx + 1]),
      interval: INDUCTION_INTERVAL,
      phase: 'inducao',
      reachesMeta: idx + 1 === INDUCTION_SEQUENCE.length - 1,
      advancesMaintenanceInterval: false,
    }
  }
  if (idx === INDUCTION_SEQUENCE.length - 1 && currentInterval < 14) {
    return { dose: META_DOSE, interval: MAINTENANCE_INTERVALS[0], phase: 'manutencao', reachesMeta: false, advancesMaintenanceInterval: true }
  }
  if (currentInterval < MAINTENANCE_INTERVALS[0]) {
    return { dose: META_DOSE, interval: MAINTENANCE_INTERVALS[0], phase: 'manutencao', reachesMeta: false, advancesMaintenanceInterval: true }
  }
  if (currentInterval < MAINTENANCE_INTERVALS[1]) {
    return { dose: META_DOSE, interval: MAINTENANCE_INTERVALS[1], phase: 'manutencao', reachesMeta: false, advancesMaintenanceInterval: true }
  }
  if (currentInterval < MAINTENANCE_INTERVALS[2]) {
    return { dose: META_DOSE, interval: MAINTENANCE_INTERVALS[2], phase: 'manutencao', reachesMeta: false, advancesMaintenanceInterval: true }
  }
  return { dose: META_DOSE, interval: MAINTENANCE_INTERVALS[2], phase: 'manutencao', reachesMeta: false, advancesMaintenanceInterval: false }
}

export function getPhase(dose: string, interval: number): ProtocolPhase {
  const idx = findStepIndex(dose)
  if (idx < 0) return 'manutencao'
  if (idx === INDUCTION_SEQUENCE.length - 1 && interval >= 14) return 'manutencao'
  return 'inducao'
}

export function getInductionProgress(dose: string, interval: number): number {
  if (getPhase(dose, interval) === 'manutencao') return 100
  const idx = findStepIndex(dose)
  if (idx < 0) return 0
  return Math.round(((idx + 1) / INDUCTION_SEQUENCE.length) * 100)
}
