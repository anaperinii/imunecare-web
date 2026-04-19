import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Camera, Save } from 'lucide-react'

export function ProfilePage() {
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const [form, setForm] = useState({
    nome: 'Dr. Usuário',
    email: 'usuario@clinica.com',
    telefone: '(62) 99557-1423',
    crm: 'CRM/GO 12345',
    especialidade: 'Alergologia e Imunologia',
    instituicao: 'Clínica Integrada Princípios',
    dataNascimento: '1985-03-15',
    cpf: '711.905.744-89',
  })

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const inputClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-[#18C1CB]/40 focus:border-transparent transition-all"
  const disabledClass = "w-full h-9 rounded-lg border border-(--border-custom) bg-gray-100/80 px-3 text-xs text-(--text-muted) cursor-not-allowed"

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: '/settings' })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-2xl font-bold text-(--text)">Meu Perfil</h1>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold shadow-[0_2px_12px_rgba(24,193,203,0.3)] hover:-translate-y-px transition-all cursor-pointer">
              Editar perfil
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(false)} className="h-8 px-3 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
                Cancelar
              </button>
              <button onClick={() => { setShowSaveModal(true) }} className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold shadow-[0_2px_12px_rgba(24,193,203,0.3)] hover:-translate-y-px transition-all cursor-pointer">
                <Save size={13} />
                Salvar alterações
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Avatar section */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-brand to-teal-400 text-2xl font-bold text-white">
                  DU
                </div>
                {editing && (
                  <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-(--border-custom) shadow-sm hover:bg-brand-50 transition-all cursor-pointer">
                    <Camera size={13} className="text-brand" />
                  </button>
                )}
              </div>
              <div>
                <div className="text-lg font-bold text-(--text)">{form.nome}</div>
                <div className="text-xs text-(--text-muted)">{form.especialidade}</div>
                <div className="text-xs text-(--text-muted) mt-0.5">{form.instituicao}</div>
              </div>
            </div>

            {/* Dados pessoais */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Pessoais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Nome completo</label>
                  {editing ? (
                    <input value={form.nome} onChange={(e) => set('nome', e.target.value)} className={inputClass} />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.nome}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">CPF</label>
                  <div className={disabledClass + " flex items-center"}>{form.cpf}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data de nascimento</label>
                  {editing ? (
                    <input type="date" value={form.dataNascimento} onChange={(e) => set('dataNascimento', e.target.value)} className={inputClass} />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>15/03/1985</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Telefone</label>
                  {editing ? (
                    <input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} className={inputClass} />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.telefone}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Dados profissionais */}
            <div className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Dados Profissionais</h2>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">E-mail</label>
                  {editing ? (
                    <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.email}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">CRM</label>
                  <div className={disabledClass + " flex items-center"}>{form.crm}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Especialidade</label>
                  {editing ? (
                    <input value={form.especialidade} onChange={(e) => set('especialidade', e.target.value)} className={inputClass} />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.especialidade}</div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Instituição</label>
                  {editing ? (
                    <input value={form.instituicao} onChange={(e) => set('instituicao', e.target.value)} className={inputClass} />
                  ) : (
                    <div className={disabledClass + " flex items-center"}>{form.instituicao}</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Save confirmation modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowSaveModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 shrink-0">
                <Save size={16} className="text-brand" />
              </div>
              <h3 className="text-sm font-bold text-(--text)">Salvar alterações</h3>
            </div>
            <p className="text-xs text-(--text-muted) mb-5">As alterações no seu perfil serão salvas e aplicadas imediatamente.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSaveModal(false)} className="h-8 px-4 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">Cancelar</button>
              <button onClick={() => { setShowSaveModal(false); setEditing(false) }} className="h-8 px-4 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px transition-all cursor-pointer">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
