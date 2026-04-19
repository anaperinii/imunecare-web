import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Database, Bell, Server, ChevronDown, Calendar, ExternalLink, CheckCircle, Palette, Plus, X, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCan } from '@/store/user-store'

const defaultEventColors = [
  { id: 'subcutanea', label: 'Subcutânea', color: '#14B8A6' },
  { id: 'sublingual', label: 'Sublingual', color: '#8B5CF6' },
  { id: 'ausente', label: 'Ausente', color: '#EF4444' },
]

export function AdvancedSettingsPage() {
  const navigate = useNavigate()
  const canAdvanced = useCan('advanced_settings')
  const [autoBackup, setAutoBackup] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [language, setLanguage] = useState('pt-BR')
  const [googleConnected, setGoogleConnected] = useState(false)
  const [autoSync, setAutoSync] = useState(true)
  const [reminderWhatsapp, setReminderWhatsapp] = useState(true)
  const [reminderHours, setReminderHours] = useState('24')
  const [eventColors, setEventColors] = useState(defaultEventColors)

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#18C1CB]/40 focus:border-transparent transition-all"

  if (!canAdvanced) {
    return (
      <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
        <div className="flex flex-1 min-h-0 flex-col items-center justify-center rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] m-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Lock size={22} className="text-(--text-muted)" />
          </div>
          <h2 className="text-base font-bold text-(--text) mb-1.5">Acesso restrito</h2>
          <p className="text-xs text-(--text-muted) max-w-sm leading-relaxed mb-5">As configurações avançadas são restritas a perfis <span className="font-semibold text-(--text)">Administrador</span> e <span className="font-semibold text-(--text)">Médico</span>.</p>
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
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: '/settings' })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Configurações Avançadas</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Notificações */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Notificações</h2>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'Notificações por e-mail', desc: 'Receba alertas de aplicações, reações e agendamentos por e-mail', icon: Bell, value: emailNotifications, set: setEmailNotifications },
                  { label: 'Notificações push', desc: 'Receba notificações em tempo real no navegador', icon: Bell, value: pushNotifications, set: setPushNotifications },
                ].map((item, i) => (
                  <div key={item.label}>
                    {i > 0 && <div className="border-t border-(--border-custom) mb-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                          <item.icon size={14} className="text-brand" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-(--text)">{item.label}</div>
                          <div className="text-[0.65rem] text-(--text-muted)">{item.desc}</div>
                        </div>
                      </div>
                      <button onClick={() => item.set(!item.value)} className={cn("h-6 w-11 rounded-full transition-all cursor-pointer relative", item.value ? "bg-brand" : "bg-gray-300")}>
                        <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", item.value ? "left-5.5" : "left-0.5")} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sistema */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Sistema</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Fuso horário</label>
                  <div className="relative">
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={cn(inputClass, "pr-8")}>
                      <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                      <option value="America/Manaus">Manaus (GMT-4)</option>
                      <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Tempo de sessão (minutos)</label>
                  <div className="relative">
                    <select value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className={cn(inputClass, "pr-8")}>
                      <option value="15">15 minutos</option>
                      <option value="30">30 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="120">2 horas</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Idioma</label>
                  <div className="relative">
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className={cn(inputClass, "pr-8")}>
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Agendamentos */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Agendamentos</h2>
              </div>
              <div className="p-4 space-y-4">
                {/* Google Agenda connection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                        <Calendar size={14} className="text-brand" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-(--text)">Google Agenda</div>
                        <div className="text-[0.65rem] text-(--text-muted)">Sincronize agendamentos automaticamente</div>
                      </div>
                    </div>
                    {googleConnected ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[0.6rem] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} />
                          Conectado
                        </span>
                        <button onClick={() => setGoogleConnected(false)} className="text-[0.6rem] font-medium text-red-500 hover:underline cursor-pointer bg-transparent border-none">
                          Desconectar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setGoogleConnected(true)} className="h-8 px-3 flex items-center gap-1.5 rounded-lg border-[1.5px] border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:border-brand hover:text-brand hover:bg-teal-50 transition-all cursor-pointer">
                        Conectar conta Google
                      </button>
                    )}
                  </div>

                  {googleConnected && (
                    <div className="bg-gray-50 rounded-lg p-3 space-y-3 ml-11">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[0.7rem] font-medium text-(--text)">Sincronização automática</div>
                          <div className="text-[0.55rem] text-(--text-muted)">Novos agendamentos são enviados ao Google Agenda</div>
                        </div>
                        <button onClick={() => setAutoSync(!autoSync)} className={cn("h-6 w-11 rounded-full transition-all cursor-pointer relative", autoSync ? "bg-brand" : "bg-gray-300")}>
                          <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", autoSync ? "left-5.5" : "left-0.5")} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-[0.6rem] text-(--text-muted)">
                        <ExternalLink size={10} />
                        <span>Conta vinculada: <span className="font-medium text-(--text)">clinica@imunecare.com.br</span></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-(--border-custom)" />

                {/* Lembretes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                      <Bell size={14} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Lembrete via WhatsApp</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Enviar lembrete automático ao paciente antes da consulta</div>
                    </div>
                  </div>
                  <button onClick={() => setReminderWhatsapp(!reminderWhatsapp)} className={cn("h-6 w-11 rounded-full transition-all cursor-pointer relative", reminderWhatsapp ? "bg-brand" : "bg-gray-300")}>
                    <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", reminderWhatsapp ? "left-5.5" : "left-0.5")} />
                  </button>
                </div>

                {reminderWhatsapp && (
                  <div className="ml-11">
                    <label className="text-[0.65rem] font-medium text-(--text-muted) mb-1 block">Antecedência do lembrete</label>
                    <div className="relative w-40">
                      <select value={reminderHours} onChange={(e) => setReminderHours(e.target.value)} className={cn(inputClass, "pr-8")}>
                        <option value="2">2 horas antes</option>
                        <option value="6">6 horas antes</option>
                        <option value="12">12 horas antes</option>
                        <option value="24">24 horas antes</option>
                        <option value="48">48 horas antes</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="border-t border-(--border-custom)" />

                {/* Cores por tipo de evento */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                      <Palette size={14} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Cores dos eventos</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Personalize as cores para cada tipo de agendamento</div>
                    </div>
                  </div>
                  <div className="space-y-2 ml-11">
                    {eventColors.map((ec) => (
                      <div key={ec.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={ec.color}
                            onChange={(e) => setEventColors((prev) => prev.map((c) => c.id === ec.id ? { ...c, color: e.target.value } : c))}
                            className="w-7 h-7 rounded-lg border border-(--border-custom) cursor-pointer p-0.5"
                          />
                          {['subcutanea', 'sublingual', 'ausente'].includes(ec.id) ? (
                            <span className="text-xs font-medium text-(--text)">{ec.label}</span>
                          ) : (
                            <input
                              value={ec.label}
                              onChange={(e) => setEventColors((prev) => prev.map((c) => c.id === ec.id ? { ...c, label: e.target.value } : c))}
                              className="text-xs font-medium text-(--text) bg-transparent border-none border-b border-(--border-custom) focus:outline-none focus:border-brand w-28 px-0"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.6rem] font-mono text-(--text-muted)">{ec.color}</span>
                          <div className="w-16 h-5 rounded" style={{ backgroundColor: ec.color + '20', border: `1.5px solid ${ec.color}` }}>
                            <div className="w-full h-full rounded flex items-center justify-center text-[0.45rem] font-bold" style={{ color: ec.color }}>
                              Prévia
                            </div>
                          </div>
                          {!['subcutanea', 'sublingual', 'ausente'].includes(ec.id) && (
                            <button onClick={() => setEventColors((prev) => prev.filter((c) => c.id !== ec.id))} className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded text-(--text-muted) hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer">
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const id = `custom-${Date.now()}`
                        setEventColors((prev) => [...prev, { id, label: 'Novo tipo', color: '#6B7280' }])
                      }}
                      className="flex items-center gap-1.5 text-[0.65rem] font-medium text-brand hover:underline cursor-pointer bg-transparent border-none mt-1"
                    >
                      <Plus size={12} />
                      Adicionar tipo de evento
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dados e Backup */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados e Backup</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                      <Database size={14} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Backup automático</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Backup diário dos dados clínicos às 03:00</div>
                    </div>
                  </div>
                  <button onClick={() => setAutoBackup(!autoBackup)} className={cn("h-6 w-11 rounded-full transition-all cursor-pointer relative", autoBackup ? "bg-brand" : "bg-gray-300")}>
                    <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", autoBackup ? "left-5.5" : "left-0.5")} />
                  </button>
                </div>
                <div className="border-t border-(--border-custom)" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                      <Server size={14} className="text-brand" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Último backup</div>
                      <div className="text-[0.65rem] text-(--text-muted)">10/04/2026 às 03:00 — 42.3 MB</div>
                    </div>
                  </div>
                  <span className="text-[0.65rem] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Sucesso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
