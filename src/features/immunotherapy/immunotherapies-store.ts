import { create } from 'zustand'

export interface Immunotherapy {
  id: string
  nome: string
  tipo: string
  doseConcentracao: string
  cicloIntervalo: {
    numero: number
    dias: number
  }
  modalidade: 'subcutânea' | 'sublingual'
  status: 'ativo' | 'inativo'
  medicoResponsavel: string
}

interface ImmunotherapiesState {
  immunotherapies: Immunotherapy[]
  searchTerm: string
  tipoFilter: string
  cicloFilter: string
  showInativas: boolean
  currentPage: number
  setSearchTerm: (term: string) => void
  setTipoFilter: (tipo: string) => void
  setCicloFilter: (ciclo: string) => void
  setShowInativas: (show: boolean) => void
  setCurrentPage: (page: number) => void
  addImmunotherapy: (imm: Immunotherapy) => void
}

export const useImmunotherapiesStore = create<ImmunotherapiesState>((set) => ({
  immunotherapies: [
    { id: '1', nome: 'Bárbara Sofia Diniz', tipo: 'Gramíneas', doseConcentracao: '1:10.000 - 0,1ml', cicloIntervalo: { numero: 1, dias: 7 }, modalidade: 'subcutânea', status: 'ativo', medicoResponsavel: 'Dra. Karina Martins' },
    { id: '2', nome: 'Camilla Martins', tipo: 'Gramíneas', doseConcentracao: '1:1.000 - 0,2ml', cicloIntervalo: { numero: 1, dias: 7 }, modalidade: 'subcutânea', status: 'ativo', medicoResponsavel: 'Dra. Karina Martins' },
    { id: '3', nome: 'Ana Clara de Souza Martins', tipo: 'Cão e Gato', doseConcentracao: '1:100 - 0,4ml', cicloIntervalo: { numero: 1, dias: 7 }, modalidade: 'sublingual', status: 'ativo', medicoResponsavel: 'Dr. André Lima' },
    { id: '4', nome: 'Valentina Bittencourt Farias', tipo: 'Cândida', doseConcentracao: '1:10 - 0,8ml', cicloIntervalo: { numero: 1, dias: 7 }, modalidade: 'subcutânea', status: 'ativo', medicoResponsavel: 'Dr. André Lima' },
    { id: '5', nome: 'Heitor Guimarães de Assis', tipo: 'Ácaros', doseConcentracao: '1:10 - 0,5ml', cicloIntervalo: { numero: 1, dias: 14 }, modalidade: 'subcutânea', status: 'ativo', medicoResponsavel: 'Dra. Karina Martins' },
    { id: '6', nome: 'Caroline Ferreira de Abreu', tipo: 'Herpes', doseConcentracao: '1:10 - 0,5ml', cicloIntervalo: { numero: 2, dias: 21 }, modalidade: 'sublingual', status: 'ativo', medicoResponsavel: 'Dr. André Lima' },
    { id: '7', nome: 'Marta Gabriela de Sousa', tipo: 'Gramíneas', doseConcentracao: '1:10 - 0,5ml', cicloIntervalo: { numero: 3, dias: 28 }, modalidade: 'subcutânea', status: 'ativo', medicoResponsavel: 'Dr. André Lima' },
    { id: '8', nome: 'Patrício Gomes Cardoso', tipo: 'Cândida', doseConcentracao: '1:1.000 - 0,1ml', cicloIntervalo: { numero: 1, dias: 7 }, modalidade: 'sublingual', status: 'ativo', medicoResponsavel: 'Dr. André Lima' },
    { id: '9', nome: 'Pedro Luccas Pereira', tipo: 'Gramíneas', doseConcentracao: '1:100 - 0,2ml', cicloIntervalo: { numero: 1, dias: 7 }, modalidade: 'subcutânea', status: 'ativo', medicoResponsavel: 'Dra. Karina Martins' },
    // Inativos
    { id: '10', nome: 'Lucas Ferreira Lima', tipo: 'Ácaros', doseConcentracao: '1:100 - 0,4ml', cicloIntervalo: { numero: 1, dias: 7 }, modalidade: 'subcutânea', status: 'inativo', medicoResponsavel: 'Dra. Karina Martins' },
    { id: '11', nome: 'Juliana Mendes Costa', tipo: 'Gramíneas', doseConcentracao: '1:10 - 0,5ml', cicloIntervalo: { numero: 2, dias: 14 }, modalidade: 'subcutânea', status: 'inativo', medicoResponsavel: 'Dra. Karina Martins' },
    { id: '12', nome: 'Roberto Alves Neto', tipo: 'Cândida', doseConcentracao: '1:1.000 - 0,2ml', cicloIntervalo: { numero: 1, dias: 7 }, modalidade: 'sublingual', status: 'inativo', medicoResponsavel: 'Dr. André Lima' },
  ],
  searchTerm: '',
  tipoFilter: 'Todos os tipos',
  cicloFilter: 'Todos os intervalos',
  showInativas: false,
  currentPage: 1,
  setSearchTerm: (term) => set({ searchTerm: term }),
  setTipoFilter: (tipo) => set({ tipoFilter: tipo }),
  setCicloFilter: (ciclo) => set({ cicloFilter: ciclo }),
  setShowInativas: (show) => set({ showInativas: show }),
  setCurrentPage: (page) => set({ currentPage: page }),
  addImmunotherapy: (imm) => set((state) => ({ immunotherapies: [imm, ...state.immunotherapies] })),
}))
