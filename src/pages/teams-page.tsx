import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Plus, X, Mail, Shield, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Clock, Trash2, Pencil, UserX, UserCheck, Send, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCan } from '@/store/user-store'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'medico' | 'enfermeiro' | 'tecnico'
  status: 'ativo' | 'inativo'
  avatar: string
  since: string
}

interface Invite {
  id: string
  email: string
  role: 'admin' | 'medico' | 'enfermeiro' | 'tecnico'
  sentAt: string
  status: 'pendente' | 'expirado'
}

const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Administrador', color: 'text-[#A78BFA]', bg: 'bg-[#F0ECFE]' },
  medico: { label: 'Médico', color: 'text-[#18C1CB]', bg: 'bg-[#E0F9F7]' },
  enfermeiro: { label: 'Enfermeiro', color: 'text-[#F4845F]', bg: 'bg-[#FEF0EB]' },
  tecnico: { label: 'Técnico', color: 'text-[#3F98AF]', bg: 'bg-[#E8F4F8]' },
}

const mockMembers: TeamMember[] = [
  { id: '1', name: 'Dra. Karina Martins', email: 'karina@clinica.com', role: 'medico', status: 'ativo', avatar: 'KM', since: 'Jan 2024' },
  { id: '2', name: 'Jaqueline Rodrigues', email: 'jaque@clinica.com', role: 'admin', status: 'ativo', avatar: 'JR', since: 'Mar 2023' },
  { id: '3', name: 'Carlos Eduardo Silva', email: 'carlos@clinica.com', role: 'enfermeiro', status: 'ativo', avatar: 'CS', since: 'Jun 2024' },
  { id: '4', name: 'Mariana Costa', email: 'mariana@clinica.com', role: 'tecnico', status: 'ativo', avatar: 'MC', since: 'Set 2024' },
  { id: '5', name: 'Dr. André Lima', email: 'andre@clinica.com', role: 'medico', status: 'ativo', avatar: 'AL', since: 'Fev 2024' },
  { id: '6', name: 'Fernanda Oliveira', email: 'fernanda@clinica.com', role: 'enfermeiro', status: 'inativo', avatar: 'FO', since: 'Abr 2024' },
]

const mockInvites: Invite[] = [
  { id: 'i1', email: 'novo.medico@clinica.com', role: 'medico', sentAt: '08/04/2026', status: 'pendente' },
  { id: 'i2', email: 'estagiario@clinica.com', role: 'tecnico', sentAt: '05/04/2026', status: 'pendente' },
  { id: 'i3', email: 'antigo@email.com', role: 'enfermeiro', sentAt: '15/03/2026', status: 'expirado' },
]

export function TeamsPage() {
  const navigate = useNavigate()
  const canManageTeam = useCan('manage_team')
  const [tab, setTab] = useState<'members' | 'invites'>('members')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('medico')
  const [roleFilter, setRoleFilter] = useState('Todos')
  const [members, setMembers] = useState(mockMembers)
  const [invites, setInvites] = useState(mockInvites)
  const [statusFilter, setStatusFilter] = useState('ativo')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ type: 'remove-member' | 'delete-invite' | 'resend-invite' | 'deactivate' | 'activate'; id: string; name: string } | null>(null)

  const filteredMembers = useMemo(() => members
    .filter((m) => statusFilter === 'Todos' || m.status === statusFilter)
    .filter((m) => roleFilter === 'Todos' || m.role === roleFilter)
    .sort((a, b) => a.status === 'ativo' && b.status !== 'ativo' ? -1 : a.status !== 'ativo' && b.status === 'ativo' ? 1 : 0)
  , [members, statusFilter, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage))
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredMembers.slice(start, start + itemsPerPage)
  }, [filteredMembers, currentPage, itemsPerPage])

  useEffect(() => { setCurrentPage(1) }, [statusFilter, roleFilter, itemsPerPage])

  const pendingCount = invites.filter((i) => i.status === 'pendente').length

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-[#18C1CB]/40 focus:border-transparent transition-all"

  if (!canManageTeam) {
    return (
      <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
        <div className="flex flex-1 min-h-0 flex-col items-center justify-center rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] m-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Lock size={22} className="text-(--text-muted)" />
          </div>
          <h2 className="text-base font-bold text-(--text) mb-1.5">Acesso restrito</h2>
          <p className="text-xs text-(--text-muted) max-w-sm leading-relaxed mb-5">A gestão de equipe está disponível apenas para o perfil <span className="font-semibold text-(--text)">Administrador</span>. Troque de perfil pelo menu de usuário para acessar esta área.</p>
          <button onClick={() => navigate({ to: '/settings' })} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer">
            Voltar para configurações
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: '/settings' })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-2xl font-bold text-(--text)">Equipes e Convites</h1>
          </div>
          <button onClick={() => setShowInviteModal(true)} className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold shadow-[0_2px_12px_rgba(24,193,203,0.3)] hover:-translate-y-px transition-all cursor-pointer">
            <Plus size={14} />
            Convidar membro
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-(--border-custom) px-5 flex items-center gap-1">
          <button
            onClick={() => setTab('members')}
            className={cn("px-4 py-2.5 text-xs font-semibold border-b-2 transition-all", tab === 'members' ? "border-brand text-brand" : "border-transparent text-(--text-muted) hover:text-(--text)")}
          >
            Membros ({members.length})
          </button>
          <button
            onClick={() => setTab('invites')}
            className={cn("px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5", tab === 'invites' ? "border-brand text-brand" : "border-transparent text-(--text-muted) hover:text-(--text)")}
          >
            Convites
            {pendingCount > 0 && <span className="text-[0.55rem] font-bold text-white bg-brand rounded-full px-1.5 py-px">{pendingCount}</span>}
          </button>
        </div>

        {tab === 'members' ? (
          <>
            {/* Filters */}
            <div className="px-5 py-3 border-b border-(--border-custom) flex items-center gap-2">
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 pl-2.5 pr-7 rounded-lg border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none transition-all">
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                  <option value="Todos">Todos</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
              </div>
              <div className="relative">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-8 pl-2.5 pr-7 rounded-lg border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none transition-all">
                  <option value="Todos">Todos os perfis</option>
                  <option value="admin">Administrador</option>
                  <option value="medico">Médico</option>
                  <option value="enfermeiro">Enfermeiro</option>
                  <option value="tecnico">Técnico</option>
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
              </div>
              <span className="text-[0.65rem] text-(--text-muted)">{filteredMembers.length} membros</span>
            </div>

            {/* Members list */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-(--border-custom) bg-gray-50/80">
                    <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Membro</th>
                    <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Perfil</th>
                    <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Status</th>
                    <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Desde</th>
                    <th className="text-right text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((member) => {
                    const role = roleLabels[member.role]
                    return (
                      <tr key={member.id} className="border-b border-(--border-custom) last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-white text-[0.6rem] font-bold shrink-0">
                              {member.avatar}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-(--text)">{member.name}</div>
                              <div className="text-[0.65rem] text-(--text-muted)">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn("text-[0.65rem] font-semibold px-2 py-0.5 rounded-full", role.bg, role.color)}>
                            {role.label}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn("text-[0.65rem] font-medium flex items-center gap-1", member.status === 'ativo' ? "text-green-600" : "text-(--text-muted)")}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", member.status === 'ativo' ? "bg-green-500" : "bg-gray-300")} />
                            {member.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-(--text-muted)">{member.since}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="relative inline-block">
                            <button onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)} className="h-7 w-7 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-100 transition-all cursor-pointer">
                              <MoreHorizontal size={14} />
                            </button>
                            {openMenu === member.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-(--border-custom) rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                                <button onClick={() => { setOpenMenu(null) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-(--text) hover:bg-gray-50 transition-colors cursor-pointer">
                                  <Pencil size={12} className="text-(--text-muted)" />
                                  Editar perfil
                                </button>
                                <button onClick={() => { setOpenMenu(null) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-(--text) hover:bg-gray-50 transition-colors cursor-pointer">
                                  <Shield size={12} className="text-(--text-muted)" />
                                  Alterar permissões
                                </button>
                                {member.status === 'ativo' ? (
                                  <button onClick={() => { setOpenMenu(null); setConfirmModal({ type: 'deactivate', id: member.id, name: member.name }) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer">
                                    <UserX size={12} />
                                    Desativar membro
                                  </button>
                                ) : (
                                  <button onClick={() => { setOpenMenu(null); setConfirmModal({ type: 'activate', id: member.id, name: member.name }) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-green-600 hover:bg-green-50 transition-colors cursor-pointer">
                                    <UserCheck size={12} />
                                    Reativar membro
                                  </button>
                                )}
                                <div className="border-t border-(--border-custom)" />
                                <button onClick={() => { setOpenMenu(null); setConfirmModal({ type: 'remove-member', id: member.id, name: member.name }) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                                  <Trash2 size={12} />
                                  Remover da equipe
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-(--border-custom) px-4 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-(--text-muted)">Registros por página</span>
                  <div className="relative">
                    <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="h-7 pl-2 pr-6 rounded-md border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none transition-all">
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-(--text-muted) mr-1.5">Página {currentPage} de {totalPages}</span>
                  {[
                    { icon: ChevronsLeft, action: () => setCurrentPage(1), disabled: currentPage === 1 },
                    { icon: ChevronLeft, action: () => setCurrentPage(currentPage - 1), disabled: currentPage === 1 },
                    { icon: ChevronRight, action: () => setCurrentPage(currentPage + 1), disabled: currentPage === totalPages },
                    { icon: ChevronsRight, action: () => setCurrentPage(totalPages), disabled: currentPage === totalPages },
                  ].map((btn, i) => {
                    const Icon = btn.icon
                    return (
                      <button key={i} onClick={btn.action} disabled={btn.disabled} className="h-7 w-7 flex items-center justify-center rounded-md border border-(--border-custom) text-(--text-muted) disabled:opacity-40 disabled:cursor-not-allowed hover:border-teal-300 hover:text-teal-600 transition-all cursor-pointer">
                        <Icon size={12} />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Invites list */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-(--border-custom) bg-gray-50/80">
                    <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">E-mail</th>
                    <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Perfil</th>
                    <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Enviado em</th>
                    <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Status</th>
                    <th className="text-right text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5 w-24">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((invite) => {
                    const role = roleLabels[invite.role]
                    return (
                      <tr key={invite.id} className="border-b border-(--border-custom) last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-(--text-muted) shrink-0">
                              <Mail size={14} />
                            </div>
                            <span className="text-xs font-medium text-(--text)">{invite.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn("text-[0.65rem] font-semibold px-2 py-0.5 rounded-full", role.bg, role.color)}>
                            {role.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs text-(--text-muted)">{invite.sentAt}</td>
                        <td className="px-5 py-3">
                          {invite.status === 'pendente' ? (
                            <span className="text-[0.65rem] font-medium text-amber-600 flex items-center gap-1">
                              <Clock size={11} />
                              Pendente
                            </span>
                          ) : (
                            <span className="text-[0.65rem] font-medium text-(--text-muted) flex items-center gap-1">
                              <X size={11} />
                              Expirado
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {invite.status === 'pendente' && (
                              <button
                                onClick={() => setConfirmModal({ type: 'resend-invite', id: invite.id, name: invite.email })}
                                className="h-7 px-2.5 rounded-md border border-(--border-custom) text-[0.6rem] font-medium text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Send size={10} />
                                Reenviar
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmModal({ type: 'delete-invite', id: invite.id, name: invite.email })}
                              className="h-7 w-7 flex items-center justify-center rounded-md text-(--text-muted) hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {invites.length === 0 && (
                <div className="text-center py-12 text-xs text-(--text-muted)">Nenhum convite enviado.</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border-custom)">
              <h3 className="text-sm font-bold text-(--text)">Convidar novo membro</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-(--text-muted) hover:text-(--text) transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">E-mail do convidado</label>
                <input
                  type="email"
                  placeholder="nome@clinica.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Perfil de acesso</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(roleLabels).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setInviteRole(key)}
                      className={cn(
                        "h-9 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                        inviteRole === key
                          ? "border-brand bg-brand-50 text-brand-dark"
                          : "border-(--border-custom) text-(--text-muted) hover:border-brand/50"
                      )}
                    >
                      <Shield size={12} />
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-brand-50 border border-brand/20 rounded-lg p-3">
                <div className="text-[0.65rem] font-semibold text-brand-dark mb-1">Sobre este perfil</div>
                <div className="text-[0.6rem] text-brand-dark/80 leading-relaxed">
                  {inviteRole === 'admin' && 'Acesso total ao sistema: gerenciar equipes, configurações, relatórios e todos os dados clínicos.'}
                  {inviteRole === 'medico' && 'Prescrever imunoterapias, acompanhar pacientes, ajustar protocolos e gerar relatórios clínicos.'}
                  {inviteRole === 'enfermeiro' && 'Registrar aplicações, evoluir pacientes, monitorar reações adversas e gerenciar agendamentos.'}
                  {inviteRole === 'tecnico' && 'Registrar aplicações sob supervisão, consultar prontuários e auxiliar no controle de estoque.'}
                </div>
              </div>
            </div>
            <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
              <button onClick={() => setShowInviteModal(false)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                disabled={!inviteEmail}
                className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(24,193,203,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Enviar convite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setConfirmModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            {confirmModal.type === 'remove-member' && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 shrink-0">
                    <Trash2 size={16} className="text-red-500" />
                  </div>
                  <h3 className="text-sm font-bold text-(--text)">Remover membro</h3>
                </div>
                <p className="text-xs text-(--text-muted) mb-5">
                  Tem certeza que deseja remover <span className="font-semibold text-(--text)">{confirmModal.name}</span> da equipe? Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setConfirmModal(null)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
                  <button onClick={() => { setMembers((m) => m.filter((x) => x.id !== confirmModal.id)); setConfirmModal(null) }} className="h-8 px-4 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-all cursor-pointer">Remover</button>
                </div>
              </>
            )}

            {confirmModal.type === 'deactivate' && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 shrink-0">
                    <UserX size={16} className="text-amber-600" />
                  </div>
                  <h3 className="text-sm font-bold text-(--text)">Desativar membro</h3>
                </div>
                <p className="text-xs text-(--text-muted) mb-5">
                  <span className="font-semibold text-(--text)">{confirmModal.name}</span> perderá o acesso ao sistema até ser reativado. Os dados não serão removidos.
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setConfirmModal(null)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
                  <button onClick={() => { setMembers((m) => m.map((x) => x.id === confirmModal.id ? { ...x, status: 'inativo' as const } : x)); setConfirmModal(null) }} className="h-8 px-4 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-all cursor-pointer">Desativar</button>
                </div>
              </>
            )}

            {confirmModal.type === 'activate' && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 shrink-0">
                    <UserCheck size={16} className="text-green-600" />
                  </div>
                  <h3 className="text-sm font-bold text-(--text)">Reativar membro</h3>
                </div>
                <p className="text-xs text-(--text-muted) mb-5">
                  <span className="font-semibold text-(--text)">{confirmModal.name}</span> terá o acesso ao sistema restaurado com as mesmas permissões anteriores.
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setConfirmModal(null)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
                  <button onClick={() => { setMembers((m) => m.map((x) => x.id === confirmModal.id ? { ...x, status: 'ativo' as const } : x)); setConfirmModal(null) }} className="h-8 px-4 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-all cursor-pointer">Reativar</button>
                </div>
              </>
            )}

            {confirmModal.type === 'resend-invite' && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                    <Send size={16} className="text-brand" />
                  </div>
                  <h3 className="text-sm font-bold text-(--text)">Reenviar convite</h3>
                </div>
                <p className="text-xs text-(--text-muted) mb-5">
                  Um novo e-mail de convite será enviado para <span className="font-semibold text-(--text)">{confirmModal.name}</span>. O convite anterior será invalidado.
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setConfirmModal(null)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
                  <button onClick={() => setConfirmModal(null)} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px transition-all cursor-pointer">Reenviar</button>
                </div>
              </>
            )}

            {confirmModal.type === 'delete-invite' && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 shrink-0">
                    <Trash2 size={16} className="text-red-500" />
                  </div>
                  <h3 className="text-sm font-bold text-(--text)">Excluir convite</h3>
                </div>
                <p className="text-xs text-(--text-muted) mb-5">
                  O convite para <span className="font-semibold text-(--text)">{confirmModal.name}</span> será excluído permanentemente e não poderá mais ser utilizado.
                </p>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setConfirmModal(null)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
                  <button onClick={() => { setInvites((inv) => inv.filter((x) => x.id !== confirmModal.id)); setConfirmModal(null) }} className="h-8 px-4 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-all cursor-pointer">Excluir</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
