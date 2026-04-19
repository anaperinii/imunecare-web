import { create } from 'zustand'

export type UserRole = 'admin' | 'medico' | 'enfermeiro' | 'tecnico'

export interface UserProfile {
  id: string
  name: string
  role: UserRole
  title: string
  registration: string
}

export type Permission =
  | 'adjust_protocol'
  | 'inactivate_immunotherapy'
  | 'reactivate_patient'
  | 'edit_patient_data'
  | 'evolve_patient'
  | 'emit_report'
  | 'lgpd_portability'
  | 'add_immunotherapy'
  | 'new_appointment'
  | 'manage_team'
  | 'advanced_settings'
  | 'view_dashboard'

export const PROFILES: UserProfile[] = [
  { id: 'admin', name: 'Carla Souza', role: 'admin', title: 'Administradora', registration: 'Gestão clínica' },
  { id: 'medico_karina', name: 'Dra. Karina Martins', role: 'medico', title: 'Médica Alergista', registration: 'CRM/GO 24.815' },
  { id: 'medico_andre', name: 'Dr. André Lima', role: 'medico', title: 'Médico Alergista', registration: 'CRM/GO 28.104' },
  { id: 'enfermeiro', name: 'Jaqueline Oliveira', role: 'enfermeiro', title: 'Enfermeira', registration: 'COREN/GO 318.942' },
  { id: 'tecnico', name: 'Rafael Mendes', role: 'tecnico', title: 'Técnico em Enfermagem', registration: 'COREN/GO 415.327' },
]

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  medico: 'Médico',
  enfermeiro: 'Enfermeiro',
  tecnico: 'Técnico em Enfermagem',
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ['edit_patient_data', 'emit_report', 'lgpd_portability', 'new_appointment', 'manage_team', 'advanced_settings', 'view_dashboard'],
  medico: ['adjust_protocol', 'inactivate_immunotherapy', 'reactivate_patient', 'edit_patient_data', 'evolve_patient', 'emit_report', 'lgpd_portability', 'add_immunotherapy', 'new_appointment', 'advanced_settings', 'view_dashboard'],
  enfermeiro: ['evolve_patient', 'emit_report', 'new_appointment', 'view_dashboard'],
  tecnico: ['evolve_patient'],
}

interface UserState {
  current: UserProfile
  setProfile: (id: string) => void
}

export const useUserStore = create<UserState>((set) => ({
  current: PROFILES.find((p) => p.id === 'medico_karina')!,
  setProfile: (id) => {
    const p = PROFILES.find((x) => x.id === id)
    if (p) set({ current: p })
  },
}))

export function useCan(permission: Permission): boolean {
  const role = useUserStore((s) => s.current.role)
  return ROLE_PERMISSIONS[role].includes(permission)
}

/** When role is médico, returns the doctor's name to filter patients by. Otherwise null (no restriction). */
export function useDoctorFilter(): string | null {
  const current = useUserStore((s) => s.current)
  return current.role === 'medico' ? current.name : null
}
