import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Lock, Smartphone, Eye, FileDown, UserX, Clock, LogOut, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const sessions = [
  { id: '1', device: 'Chrome · Windows 11', location: 'Anápolis, GO', time: 'Agora (sessão atual)', current: true },
  { id: '2', device: 'Safari · iPhone 15', location: 'Anápolis, GO', time: 'há 2 horas', current: false },
  { id: '3', device: 'Chrome · MacBook Pro', location: 'Goiânia, GO', time: 'há 3 dias', current: false },
]

const auditLog = [
  { id: 'a1', action: 'Login realizado', ip: '187.45.xx.xx', time: '10/04/2026 08:30', device: 'Chrome · Windows' },
  { id: 'a2', action: 'Prontuário acessado — Bárbara Sofia Diniz', ip: '187.45.xx.xx', time: '10/04/2026 08:35', device: 'Chrome · Windows' },
  { id: 'a3', action: 'Aplicação registrada — Camilla Martins', ip: '187.45.xx.xx', time: '09/04/2026 14:20', device: 'Chrome · Windows' },
  { id: 'a4', action: 'Relatório exportado (PDF)', ip: '187.45.xx.xx', time: '09/04/2026 16:00', device: 'Chrome · Windows' },
  { id: 'a5', action: 'Login realizado', ip: '201.12.xx.xx', time: '08/04/2026 09:00', device: 'Safari · iPhone' },
]

export function SecurityPage() {
  const navigate = useNavigate()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null)
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-[#18C1CB]/40 focus:border-transparent transition-all"

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: '/settings' })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Segurança e Privacidade</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Autenticação */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Autenticação</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                      <Lock size={14} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Alterar senha</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Última alteração há 30 dias</div>
                    </div>
                  </div>
                  <button onClick={() => setShowPasswordModal(true)} className="h-8 px-3 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer flex items-center gap-1.5">
                    Alterar
                    <ChevronRight size={12} />
                  </button>
                </div>
                <div className="border-t border-(--border-custom)" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                      <Smartphone size={14} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Autenticação em dois fatores (2FA)</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Proteja sua conta com verificação adicional</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setTwoFaEnabled(!twoFaEnabled)}
                    className={cn("h-6 w-11 rounded-full transition-all cursor-pointer relative", twoFaEnabled ? "bg-brand" : "bg-gray-300")}
                  >
                    <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", twoFaEnabled ? "left-5.5" : "left-0.5")} />
                  </button>
                </div>
              </div>
            </div>

            {/* Sessões ativas */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-xs font-bold text-(--text)">Sessões ativas</h2>
                <span className="text-[0.6rem] text-(--text-muted) bg-gray-100 px-2 py-0.5 rounded-full">{sessions.length} dispositivos</span>
              </div>
              <div className="divide-y divide-(--border-custom)">
                {sessions.map((s) => (
                  <div key={s.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", s.current ? "bg-brand-50" : "bg-gray-100")}>
                        <Smartphone size={14} className={s.current ? "text-brand" : "text-(--text-muted)"} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-(--text) flex items-center gap-1.5">
                          {s.device}
                          {s.current && <span className="text-[0.55rem] font-medium text-green-600 bg-green-50 px-1.5 py-px rounded-full">Atual</span>}
                        </div>
                        <div className="text-[0.65rem] text-(--text-muted)">{s.location} · {s.time}</div>
                      </div>
                    </div>
                    {!s.current && (
                      <button onClick={() => setShowRevokeModal(s.id)} className="h-7 px-2.5 rounded-md border border-(--border-custom) text-[0.6rem] font-medium text-red-500 hover:bg-red-50 transition-all cursor-pointer flex items-center gap-1">
                        <LogOut size={10} />
                        Encerrar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Auditoria */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50 flex items-center justify-between">
                <h2 className="text-xs font-bold text-(--text)">Log de atividades recentes</h2>
                <div className="flex items-center gap-1">
                  <Clock size={11} className="text-(--text-muted)" />
                  <span className="text-[0.6rem] text-(--text-muted)">Últimos 7 dias</span>
                </div>
              </div>
              <div className="divide-y divide-(--border-custom)">
                {auditLog.map((log) => (
                  <div key={log.id} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-(--text)">{log.action}</div>
                      <div className="text-[0.6rem] text-(--text-muted)">{log.device} · IP {log.ip}</div>
                    </div>
                    <span className="text-[0.6rem] text-(--text-muted) shrink-0">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacidade & LGPD */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Privacidade e LGPD</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                      <Eye size={14} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Visibilidade do perfil</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Controle quem pode ver seus dados na equipe</div>
                    </div>
                  </div>
                  <span className="text-[0.65rem] font-medium text-brand bg-brand-50 px-2 py-0.5 rounded-full">Equipe</span>
                </div>
                <div className="border-t border-(--border-custom)" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                      <FileDown size={14} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Exportar meus dados</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Solicite uma cópia de todos os seus dados pessoais</div>
                    </div>
                  </div>
                  <button onClick={() => setShowExportModal(true)} className="h-8 px-3 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer flex items-center gap-1.5">
                    Solicitar
                    <ChevronRight size={12} />
                  </button>
                </div>
                <div className="border-t border-(--border-custom)" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                      <UserX size={14} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Anonimização de pacientes</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Gerencie solicitações de anonimização de dados de pacientes (Art. 18 LGPD)</div>
                    </div>
                  </div>
                  <button className="h-8 px-3 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:border-brand hover:text-brand transition-all cursor-pointer flex items-center gap-1.5">
                    Gerenciar
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-(--border-custom)">
              <h3 className="text-sm font-bold text-(--text)">Alterar senha</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-(--text-muted) hover:text-(--text) transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Senha atual</label>
                <input type="password" placeholder="Insira aqui" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Nova senha</label>
                <input type="password" placeholder="Insira aqui" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Confirmar nova senha</label>
                <input type="password" placeholder="Insira aqui" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
              <button onClick={() => setShowPasswordModal(false)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
              <button onClick={() => setShowPasswordModal(false)} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px transition-all cursor-pointer">Alterar senha</button>
            </div>
          </div>
        </div>
      )}

      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowExportModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                <FileDown size={16} className="text-brand" />
              </div>
              <h3 className="text-sm font-bold text-(--text)">Exportar dados</h3>
            </div>
            <p className="text-xs text-(--text-muted) mb-5">Uma cópia dos seus dados pessoais será preparada e enviada para seu e-mail em até 48 horas, conforme previsto pela LGPD.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowExportModal(false)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
              <button onClick={() => setShowExportModal(false)} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px transition-all cursor-pointer">Solicitar exportação</button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke session modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowRevokeModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 shrink-0">
                <LogOut size={16} className="text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-(--text)">Encerrar sessão</h3>
            </div>
            <p className="text-xs text-(--text-muted) mb-5">Este dispositivo será desconectado imediatamente e precisará fazer login novamente para acessar o sistema.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRevokeModal(null)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
              <button onClick={() => setShowRevokeModal(null)} className="h-8 px-4 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-all cursor-pointer">Encerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
