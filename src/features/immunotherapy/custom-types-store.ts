import { create } from 'zustand'

export interface CustomType {
  id: string
  label: string
}

const DEFAULTS: CustomType[] = [
  { id: 'default-0', label: 'Ácaros' },
  { id: 'default-1', label: 'Gramíneas' },
  { id: 'default-2', label: 'Cão e Gato' },
  { id: 'default-3', label: 'Cândida' },
  { id: 'default-4', label: 'Herpes' },
  { id: 'default-5', label: 'Fungos' },
  { id: 'default-6', label: 'Insetos' },
]

interface CustomTypesState {
  types: CustomType[]
  add: (label: string) => void
  update: (id: string, label: string) => void
  remove: (id: string) => void
}

export const useCustomTypesStore = create<CustomTypesState>((set) => ({
  types: DEFAULTS,
  add: (label) => set((state) => {
    const trimmed = label.trim()
    if (!trimmed || state.types.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) return state
    return { types: [...state.types, { id: `custom-${Date.now()}`, label: trimmed }] }
  }),
  update: (id, label) => set((state) => ({
    types: state.types.map((t) => t.id === id ? { ...t, label: label.trim() || t.label } : t),
  })),
  remove: (id) => set((state) => ({ types: state.types.filter((t) => t.id !== id) })),
}))
