import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useImmunotherapiesStore } from '@/store/immunotherapies-store'
import { usePatientStore } from '@/store/patient-store'
import {
  Search,
  Plus,
  FileText,
  Archive,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const INTERVAL_COLORS: Record<number, { bg: string; text: string; dot: string }> = {
  7: { bg: '#FFE7EA', text: '#DD2E71', dot: '#DD2E71' },
  14: { bg: '#D8EBFF', text: '#2286E9', dot: '#2286E9' },
  21: { bg: '#F2E7FF', text: '#7F20CD', dot: '#7F20CD' },
  28: { bg: '#FFEDD6', text: '#DD742E', dot: '#DD742E' },
}

const DEFAULT_COLOR = { bg: '#F3F4F6', text: '#374151', dot: '#6B7280' }

export function ImmunotherapiesPage() {
  const navigate = useNavigate()
  const { setSelectedPatient } = usePatientStore()
  const {
    immunotherapies,
    searchTerm,
    tipoFilter,
    cicloFilter,
    showInativas,
    currentPage,
    setSearchTerm,
    setTipoFilter,
    setCicloFilter,
    setShowInativas,
    setCurrentPage,
  } = useImmunotherapiesStore()

  const [itemsPerPage, setItemsPerPage] = useState(10)

  const tipos = useMemo(() => {
    return Array.from(new Set(immunotherapies.map((i) => i.tipo)))
  }, [immunotherapies])

  const ciclos = useMemo(() => {
    return Array.from(new Set(immunotherapies.map((i) => i.cicloIntervalo.dias.toString()))).sort(
      (a, b) => Number(a) - Number(b)
    )
  }, [immunotherapies])

  const filtered = useMemo(() => {
    return immunotherapies.filter((item) => {
      const matchSearch = !searchTerm || item.nome.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = tipoFilter === 'Todos os tipos' || item.tipo === tipoFilter
      const matchCiclo =
        cicloFilter === 'Todos os intervalos' || item.cicloIntervalo.dias.toString() === cicloFilter
      return matchSearch && matchTipo && matchCiclo
    })
  }, [immunotherapies, searchTerm, tipoFilter, cicloFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, tipoFilter, cicloFilter, itemsPerPage, setCurrentPage])

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="mx-4 my-4 flex flex-1 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4">
          <h1 className="mb-3.5 text-2xl font-bold text-(--text)">Imunoterapias</h1>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Search */}
            <div className="relative flex-1 min-w-45">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted)" />
              <input
                placeholder="Pesquisar paciente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-(--border-custom) bg-gray-50/60 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Tipo filter */}
            <div className="relative">
              <select
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
                className="h-8 pl-2.5 pr-7 rounded-lg border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              >
                <option>Todos os tipos</option>
                {tipos.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
            </div>

            {/* Ciclo filter */}
            <div className="relative">
              <select
                value={cicloFilter}
                onChange={(e) => setCicloFilter(e.target.value)}
                className="h-8 pl-2.5 pr-7 rounded-lg border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
              >
                <option>Todos os intervalos</option>
                {ciclos.map((c) => (
                  <option key={c}>{c} dias</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
            </div>

            {/* Inativas toggle */}
            <button
              onClick={() => setShowInativas(!showInativas)}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg border transition-all duration-200",
                showInativas
                  ? "bg-gray-200 border-gray-300 text-gray-600"
                  : "border-(--border-custom) text-(--text-muted) hover:border-teal-300 hover:text-teal-600"
              )}
              title="Imunoterapias inativas"
            >
              <Archive size={14} />
            </button>

            {/* Adicionar */}
            <button onClick={() => navigate({ to: '/add-immunotherapy' })} className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all">
              <Plus size={14} />
              Adicionar Imunoterapia
            </button>

            {/* Evoluir */}
            <button onClick={() => navigate({ to: '/patient-evolution' })} className="h-8 px-3 flex items-center gap-1.5 rounded-lg border-[1.5px] border-teal-400 text-teal-600 text-xs font-semibold hover:bg-teal-50 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.25)] transition-all">
              <FileText size={14} />
              Evoluir Paciente
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-(--border-custom) bg-gray-50/80">
                <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Nome</th>
                <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Tipo</th>
                <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Dose e Concentração Atuais</th>
                <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Intervalo Atual</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-(--text-muted) py-10 text-xs">
                    Nenhum resultado encontrado
                  </td>
                </tr>
              ) : (
                paginated.map((item) => {
                  const color = INTERVAL_COLORS[item.cicloIntervalo.dias] || DEFAULT_COLOR
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-(--border-custom) last:border-0 cursor-pointer hover:bg-teal-50/40 transition-colors duration-150"
                      onClick={() => {
                        setSelectedPatient({
                          id: item.id, nome: item.nome, dataNascimento: '02/07/2000', idade: 25,
                          telefone: '(62) 99557-1423', peso: '89.7 kg', cpf: '711.905.744-89',
                          medicoResponsavel: 'Dra. Karina Martins', status: 'ativo',
                          tipoImunoterapia: item.tipo, inicioInducao: '01/01/2020', inicioManutencao: null,
                          viaAdministracao: 'Subcutânea', extrato: 'Der p 60 + der f 10% + blt 30%',
                          concentracaoVolumeMeta: '1:10 - 0,5ml', metaAtingida: false,
                          intervaloAtual: item.cicloIntervalo.dias, dataProximaAplicacao: '21/05/2025',
                          concentracaoDoseAtuais: item.doseConcentracao,
                        })
                        navigate({ to: '/patient/$patientId', params: { patientId: item.id } })
                      }}
                    >
                      <td className="px-4 py-2 text-xs font-medium text-(--text)">{item.nome}</td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-[0.7rem] font-medium text-(--text-muted)">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-(--text-muted)">{item.doseConcentracao}</td>
                      <td className="px-4 py-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[0.7rem] font-semibold"
                          style={{ backgroundColor: color.bg, color: color.text }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: color.dot }}
                          />
                          {item.cicloIntervalo.dias} dias
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-(--border-custom) px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-(--text-muted)">Registros por página</span>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="h-7 pl-2 pr-6 rounded-md border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-(--text-muted) mr-1.5">
                Página {currentPage} de {totalPages}
              </span>
              {[
                { icon: ChevronsLeft, action: () => setCurrentPage(1), disabled: currentPage === 1 },
                { icon: ChevronLeft, action: () => setCurrentPage(currentPage - 1), disabled: currentPage === 1 },
                { icon: ChevronRight, action: () => setCurrentPage(currentPage + 1), disabled: currentPage === totalPages },
                { icon: ChevronsRight, action: () => setCurrentPage(totalPages), disabled: currentPage === totalPages },
              ].map((btn, i) => {
                const Icon = btn.icon
                return (
                  <button
                    key={i}
                    onClick={btn.action}
                    disabled={btn.disabled}
                    className="h-7 w-7 flex items-center justify-center rounded-md border border-(--border-custom) text-(--text-muted) disabled:opacity-40 disabled:cursor-not-allowed hover:border-teal-300 hover:text-teal-600 transition-all"
                  >
                    <Icon size={12} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
