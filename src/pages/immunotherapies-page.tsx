import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearch, Link } from '@tanstack/react-router'
import { useImmunotherapiesStore } from '@/store/immunotherapies-store'
import { usePatientStore, seedInactivationsFor } from '@/store/patient-store'
import { useCan, useDoctorFilter } from '@/store/user-store'
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
  CheckCircle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const INTERVAL_COLORS: Record<number, { bg: string; text: string; dot: string }> = {
  7: { bg: '#FDECF0', text: '#E8768E', dot: '#E8768E' },
  14: { bg: '#FDEEE8', text: '#E8766A', dot: '#E8766A' },
  21: { bg: '#DBEAFE', text: '#2563EB', dot: '#2563EB' },
  28: { bg: '#EDE9FE', text: '#7C3AED', dot: '#7C3AED' },
}

const DEFAULT_COLOR = { bg: '#F3F4F6', text: '#374151', dot: '#6B7280' }

export function ImmunotherapiesPage() {
  const navigate = useNavigate()
  const { success, patientName } = useSearch({ from: '/immunotherapies' })
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (success) {
      setShowToast(true)
      navigate({ to: '/immunotherapies', search: {}, replace: true })
      const timer = setTimeout(() => setShowToast(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const { setSelectedPatient } = usePatientStore()
  const canAddImmunotherapy = useCan('add_immunotherapy')
  const canEvolve = useCan('evolve_patient')
  const doctorFilter = useDoctorFilter()
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
      const matchDoctor = !doctorFilter || item.medicoResponsavel === doctorFilter
      const matchSearch = !searchTerm || item.nome.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = tipoFilter === 'Todos os tipos' || item.tipo === tipoFilter
      const matchCiclo =
        cicloFilter === 'Todos os intervalos' || item.cicloIntervalo.dias.toString() === cicloFilter
      const matchStatus = showInativas ? item.status === 'inativo' : item.status === 'ativo'
      return matchDoctor && matchSearch && matchTipo && matchCiclo && matchStatus
    })
  }, [immunotherapies, searchTerm, tipoFilter, cicloFilter, showInativas, doctorFilter])

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
                "h-8 w-8 flex items-center justify-center rounded-lg border-[1.5px] transition-all",
                showInativas
                  ? "border-brand bg-teal-50 text-brand"
                  : "border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand hover:bg-teal-50"
              )}
              title="Imunoterapias inativas"
            >
              <Archive size={14} />
            </button>

            {/* Adicionar */}
            {canAddImmunotherapy && (
              <button onClick={() => navigate({ to: '/add-immunotherapy' })} className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all">
                <Plus size={14} />
                Adicionar Imunoterapia
              </button>
            )}

            {/* Evoluir */}
            {canEvolve && (
              <button onClick={() => navigate({ to: '/patient-evolution' })} className="h-8 px-3 flex items-center gap-1.5 rounded-lg border-[1.5px] border-teal-400 text-teal-600 text-xs font-semibold hover:bg-teal-50 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.25)] transition-all">
                <FileText size={14} />
                Evoluir Paciente
              </button>
            )}
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
                          medicoResponsavel: item.medicoResponsavel, status: item.status === 'ativo' ? 'ativo' as const : 'inativo' as const,
                          tipoImunoterapia: item.tipo, inicioInducao: '01/01/2020', inicioManutencao: null,
                          viaAdministracao: 'Subcutânea', extrato: 'Der p 60 + der f 10% + blt 30%',
                          concentracaoVolumeMeta: '1:10 - 0,5ml', metaAtingida: false,
                          intervaloAtual: item.cicloIntervalo.dias, dataProximaAplicacao: '21/05/2025',
                          concentracaoDoseAtuais: item.doseConcentracao,
                          inactivations: item.status === 'inativo' ? seedInactivationsFor(item.id, item.doseConcentracao, item.cicloIntervalo.dias) : undefined,
                        })
                        navigate({ to: '/patient/$patientId', params: { patientId: item.id } })
                      }}
                    >
                      <td className={cn("px-4 py-2 text-xs font-medium", item.status === 'inativo' ? "text-(--text-muted)" : "text-(--text)")}>
                        <div className="flex items-center gap-2">
                          {item.nome}
                          {item.status === 'inativo' && <span className="text-[0.55rem] font-semibold px-1.5 py-px rounded-full bg-gray-100 text-(--text-muted) border border-gray-200">Inativo</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-[0.7rem] font-medium text-(--text-muted)">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-(--text-muted)">{item.doseConcentracao}</td>
                      <td className="px-4 py-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-px rounded-full text-[0.65rem] font-semibold border"
                          style={{ backgroundColor: color.bg, color: color.text, borderColor: color.dot + '30' }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
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

      {/* Success toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50" style={{ animation: 'slide-up-fade 0.3s ease-out' }}>
          <div className="flex items-start gap-3 bg-white border border-emerald-200 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 w-95">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 shrink-0 mt-0.5">
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-(--text)">Registro salvo com sucesso!</p>
              <p className="text-xs text-(--text-muted) mt-1">Os dados de {patientName || 'paciente'} foram registrados e a próxima dose já está agendada.</p>
              <Link
                to="/patient/$patientId"
                params={{ patientId: '1' }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 mt-2 transition-colors"
              >
                Acessar prontuário do paciente &rarr;
              </Link>
            </div>
            <button onClick={() => setShowToast(false)} className="h-6 w-6 flex items-center justify-center rounded-md text-(--text-muted) hover:bg-gray-100 transition-all shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
