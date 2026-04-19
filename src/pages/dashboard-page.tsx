import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useImmunotherapiesStore } from '@/store/immunotherapies-store'
import { Users, Syringe, Activity, TrendingUp, TrendingDown, Download, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts'

// Concentrações: escala teal (claro → escuro)
const CONC_COLORS: Record<string, string> = {
  '1:10.000': '#B6F2EC',
  '1:1.000': '#2CD3C1',
  '1:100': '#18C1CB',
  '1:10': '#0E99A3',
}

// Fases: teal vs violeta
const PHASE_COLORS = { 'Indução': '#18C1CB', 'Manutenção': '#A78BFA' }

// Status: verde-água, salmão alaranjado, rosa
const STATUS_COLORS = { 'Ativas': '#2CD3C1', 'Interrompidas': '#F4845F', 'Concluídas': '#22DD44' }

// Tipos por imunoterapia: paleta fria
const TYPE_COLORS = ['#0E99A3', '#18C1CB', '#2CD3C1', '#B6F2EC', '#3F98AF']

export function DashboardPage() {
  const navigate = useNavigate()
  const { immunotherapies } = useImmunotherapiesStore()
  const [modality, setModality] = useState<'sub' | 'sbl'>('sub')
  const [tipoFilter, setTipoFilter] = useState('Todos')
  const [mesFilter, setMesFilter] = useState('Todos')
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear().toString())

  // Card-level filters
  const [concCardFilter, setConcCardFilter] = useState('Todos')
  const [phaseCardFilter, setPhaseCardFilter] = useState('Todos')
  const [statusCardFilter, setStatusCardFilter] = useState('Todos')
  const [typeCardFilter, setTypeCardFilter] = useState('Todos')
  const [volCardFilter, setVolCardFilter] = useState('Todos')

  // Tipos disponíveis
  const tipos = useMemo(() => Array.from(new Set(immunotherapies.map((i) => i.tipo))), [immunotherapies])

  // Filter by modality + tipo
  const filtered = useMemo(() => {
    const mod = modality === 'sub' ? 'subcutânea' : 'sublingual'
    return immunotherapies.filter((i) => {
      const matchMod = i.modalidade === mod
      const matchTipo = tipoFilter === 'Todos' || i.tipo === tipoFilter
      return matchMod && matchTipo
    })
  }, [immunotherapies, modality, tipoFilter])

  // Stats
  const totalPatients = filtered.length
  const induction = filtered.filter((i) => i.cicloIntervalo.dias === 7).length
  const maintenance = totalPatients - induction

  // Pie: concentrations
  const concData = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered.forEach((i) => {
      const conc = i.doseConcentracao.split(' - ')[0].trim()
      counts[conc] = (counts[conc] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [filtered])

  // Bar: phases by month
  const phaseData = [
    { month: 'Jan', Indução: 5, Manutenção: 2 },
    { month: 'Fev', Indução: 6, Manutenção: 2 },
    { month: 'Mar', Indução: 7, Manutenção: 3 },
    { month: 'Abr', Indução: induction, Manutenção: maintenance },
  ]

  // Line: status over time
  const statusData = [
    { month: 'Jan', Ativas: 6, Interrompidas: 1, Concluídas: 0 },
    { month: 'Fev', Ativas: 7, Interrompidas: 1, Concluídas: 1 },
    { month: 'Mar', Ativas: 8, Interrompidas: 0, Concluídas: 1 },
    { month: 'Abr', Ativas: totalPatients, Interrompidas: 0, Concluídas: 2 },
  ]

  // Top types
  const allTypes = ['Gramíneas', 'Ácaros', 'Cão e Gato', 'Cândida', 'Herpes']
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {}
    allTypes.forEach((t) => { counts[t] = 0 })
    filtered.forEach((i) => { counts[i.tipo] = (counts[i.tipo] || 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, pct: totalPatients > 0 ? Math.round((value / totalPatients) * 100) : 0 }))
  }, [filtered, totalPatients])

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-(--text)">Dashboard</h1>
          <div className="flex items-center gap-2">
            {/* Modality toggle */}
            <div className="flex h-8 rounded-lg border border-(--border-custom) overflow-hidden">
              {[{ key: 'sub', label: 'Subcutânea' }, { key: 'sbl', label: 'Sublingual' }].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setModality(m.key as 'sub' | 'sbl')}
                  className={cn("px-3 text-xs font-semibold transition-all", modality === m.key ? "bg-linear-to-br from-brand to-teal-400 text-white" : "text-(--text-muted) hover:bg-gray-50")}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {/* Tipo filter */}
            <div className="relative">
              <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)} className="h-8 pl-2.5 pr-7 rounded-lg border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none transition-all">
                <option value="Todos">Todos os tipos</option>
                {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
            </div>
            {/* Mês filter */}
            <div className="relative">
              <select value={mesFilter} onChange={(e) => setMesFilter(e.target.value)} className="h-8 pl-2.5 pr-7 rounded-lg border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none transition-all">
                <option value="Todos">Todos os meses</option>
                {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
            </div>
            {/* Ano filter */}
            <div className="relative">
              <select value={anoFilter} onChange={(e) => setAnoFilter(e.target.value)} className="h-8 pl-2.5 pr-7 rounded-lg border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none transition-all">
                {['2024','2025','2026'].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
            </div>
            <button
              onClick={() => navigate({ to: '/export-report' })}
              className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px transition-all"
            >
              <Download size={13} />
              Exportar Relatório
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: 'Pacientes Ativos', value: totalPatients, trend: '+3', up: true, color: 'text-[#E8768E]', iconBg: 'bg-[#FDECF0]/80', accentColor: '#E8768E' },
              { icon: Syringe, label: 'Em Indução', value: induction, trend: '+2', up: true, color: 'text-[#18C1CB]', iconBg: 'bg-[#B6F2EC]/70', accentColor: '#18C1CB' },
              { icon: Activity, label: 'Em Manutenção', value: maintenance, trend: '+1', up: true, color: 'text-[#A78BFA]', iconBg: 'bg-[#E8DFFE]/80', accentColor: '#A78BFA' },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="border border-(--border-custom) rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden bg-white"
                >
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${stat.accentColor}, ${stat.accentColor}40)` }} />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${stat.accentColor}18, transparent 50%)` }} />
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0 relative z-10", stat.iconBg)}>
                    <Icon size={18} className={stat.color} />
                  </div>
                  <div className="flex-1 relative z-10">
                    <div className="text-[0.65rem] text-(--text-muted) font-medium">{stat.label}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-extrabold text-(--text)">{stat.value}</span>
                      <span className={cn("flex items-center gap-0.5 text-[0.6rem] font-bold px-2 py-0.5 rounded-full", stat.up ? "text-green-700 bg-green-100" : "text-red-500 bg-red-50")}>
                        {stat.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pie: Concentrations */}
            <div className="border border-(--border-custom) rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-(--text)">Ciclos de Tratamento por Concentração</h3>
                <div className="relative">
                  <select value={concCardFilter} onChange={(e) => setConcCardFilter(e.target.value)} className="h-6 pl-2 pr-5 rounded-md border border-(--border-custom) bg-white text-[0.6rem] appearance-none cursor-pointer focus:outline-none">
                    <option value="Todos">Todos</option>
                    {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={concData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                      {concData.map((entry) => (
                        <Cell key={entry.name} fill={CONC_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2f0ef', background: 'rgba(255,255,255,0.95)' }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-3 mt-2">
                {concData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CONC_COLORS[d.name] || '#94a3b8' }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Bar: Phases */}
            <div className="border border-(--border-custom) rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-(--text)">Distribuição de Fases</h3>
                <div className="relative">
                  <select value={phaseCardFilter} onChange={(e) => setPhaseCardFilter(e.target.value)} className="h-6 pl-2 pr-5 rounded-md border border-(--border-custom) bg-white text-[0.6rem] appearance-none cursor-pointer focus:outline-none">
                    <option value="Todos">Todos os meses</option>
                    {['Jan','Fev','Mar','Abr'].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={phaseData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2f0ef', background: 'rgba(255,255,255,0.95)' }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="Indução" fill={PHASE_COLORS['Indução']} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Manutenção" fill={PHASE_COLORS['Manutenção']} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {Object.entries(PHASE_COLORS).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v }} />
                    {k}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-2 gap-4">
            {/* Line: Status */}
            <div className="border border-(--border-custom) rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-(--text)">Status de Imunoterapias</h3>
                <div className="relative">
                  <select value={statusCardFilter} onChange={(e) => setStatusCardFilter(e.target.value)} className="h-6 pl-2 pr-5 rounded-md border border-(--border-custom) bg-white text-[0.6rem] appearance-none cursor-pointer focus:outline-none">
                    <option value="Todos">Todos os meses</option>
                    {['Jan','Fev','Mar','Abr'].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                </div>
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2f0ef', background: 'rgba(255,255,255,0.95)' }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Line type="monotone" dataKey="Ativas" stroke={STATUS_COLORS['Ativas']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Interrompidas" stroke={STATUS_COLORS['Interrompidas']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Concluídas" stroke={STATUS_COLORS['Concluídas']} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {Object.entries(STATUS_COLORS).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v }} />
                    {k}
                  </div>
                ))}
              </div>
            </div>

            {/* Bar: Top types */}
            <div className="border border-(--border-custom) rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-(--text)">Imunoterapias Ativas por Tipo</h3>
                <div className="relative">
                  <select value={typeCardFilter} onChange={(e) => setTypeCardFilter(e.target.value)} className="h-6 pl-2 pr-5 rounded-md border border-(--border-custom) bg-white text-[0.6rem] appearance-none cursor-pointer focus:outline-none">
                    <option value="Todos">Todas as fases</option>
                    <option value="Indução">Indução</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
                  <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3 mt-4">
                {typeData.map((t, i) => (
                  <div key={t.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-(--text)">{t.name}</span>
                      <span className="text-xs font-bold" style={{ color: TYPE_COLORS[i % TYPE_COLORS.length] }}>{t.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${t.pct}%`, backgroundColor: TYPE_COLORS[i % TYPE_COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts row 3 */}
          <div className="border border-(--border-custom) rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-(--text)">Volume vs Concentração</h3>
              <div className="relative">
                <select value={volCardFilter} onChange={(e) => setVolCardFilter(e.target.value)} className="h-6 pl-2 pr-5 rounded-md border border-(--border-custom) bg-white text-[0.6rem] appearance-none cursor-pointer focus:outline-none">
                  <option value="Todos">Todos os tipos</option>
                  {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { conc: '1:10.000', '0,1ml': 2, '0,2ml': 1, '0,4ml': 1, '0,8ml': 0 },
                  { conc: '1:1.000', '0,1ml': 1, '0,2ml': 1, '0,4ml': 0, '0,8ml': 0 },
                  { conc: '1:100', '0,1ml': 0, '0,2ml': 1, '0,4ml': 1, '0,8ml': 0 },
                  { conc: '1:10', '0,1ml': 0, '0,2ml': 0, '0,4ml': 0, '0,8ml': 1, '0,5ml': 3 },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="conc" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2f0ef', background: 'rgba(255,255,255,0.95)' }} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="0,1ml" stackId="a" fill="#B6F2EC" radius={0} />
                  <Bar dataKey="0,2ml" stackId="a" fill="#2CD3C1" radius={0} />
                  <Bar dataKey="0,4ml" stackId="a" fill="#18C1CB" radius={0} />
                  <Bar dataKey="0,8ml" stackId="a" fill="#0E99A3" radius={0} />
                  <Bar dataKey="0,5ml" stackId="a" fill="#A78BFA" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              {[
                { label: '0,1ml', color: '#B6F2EC' },
                { label: '0,2ml', color: '#2CD3C1' },
                { label: '0,4ml', color: '#18C1CB' },
                { label: '0,8ml', color: '#0E99A3' },
                { label: '0,5ml', color: '#A78BFA' },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
