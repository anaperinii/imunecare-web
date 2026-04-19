import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Database, Bell, Server, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdvancedSettingsPage() {
  const navigate = useNavigate()
  const [autoBackup, setAutoBackup] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [language, setLanguage] = useState('pt-BR')

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#18C1CB]/40 focus:border-transparent transition-all"

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
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F9FA] shrink-0">
                          <item.icon size={14} className="text-[#18C1CB]" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-(--text)">{item.label}</div>
                          <div className="text-[0.65rem] text-(--text-muted)">{item.desc}</div>
                        </div>
                      </div>
                      <button onClick={() => item.set(!item.value)} className={cn("h-6 w-11 rounded-full transition-all cursor-pointer relative", item.value ? "bg-[#18C1CB]" : "bg-gray-300")}>
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

            {/* Dados e Backup */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados e Backup</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F9FA] shrink-0">
                      <Database size={14} className="text-[#18C1CB]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-(--text)">Backup automático</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Backup diário dos dados clínicos às 03:00</div>
                    </div>
                  </div>
                  <button onClick={() => setAutoBackup(!autoBackup)} className={cn("h-6 w-11 rounded-full transition-all cursor-pointer relative", autoBackup ? "bg-[#18C1CB]" : "bg-gray-300")}>
                    <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", autoBackup ? "left-5.5" : "left-0.5")} />
                  </button>
                </div>
                <div className="border-t border-(--border-custom)" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E6F9FA] shrink-0">
                      <Server size={14} className="text-[#18C1CB]" />
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
