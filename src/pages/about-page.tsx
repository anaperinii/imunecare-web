import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Heart } from 'lucide-react'
import imunecareLogo from '@/assets/imunecare-logo.png'

export function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate({ to: '/settings' })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-2xl font-bold text-(--text)">Sobre o Sistema</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-lg mx-auto text-center space-y-6 py-8">
            <div className="flex justify-center">
              <img src={imunecareLogo} alt="ImuneCare" className="w-16 h-16 rounded-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold gradient-text mb-1">ImuneCare</h2>
              <p className="text-xs text-(--text-muted)">Gestão de Protocolos de Imunoterapia Alérgica</p>
            </div>

            <div className="border border-(--border-custom) rounded-xl p-4 text-left space-y-2.5">
              {[
                ['Versão', '2.0.0-beta'],
                ['Build', '2026.04.10'],
                ['Ambiente', 'Produção'],
                ['Frontend', 'React 19 + TypeScript + Vite 7'],
                ['Roteamento', 'TanStack Router'],
                ['Estado', 'Zustand'],
                ['UI', 'Tailwind CSS 4 + Lucide Icons'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-(--text-muted)">{label}</span>
                  <span className="font-medium text-(--text)">{value}</span>
                </div>
              ))}
            </div>

            <div className="border border-(--border-custom) rounded-xl p-4 text-left">
              <h3 className="text-xs font-bold text-(--text) mb-2">Licença</h3>
              <p className="text-[0.7rem] text-(--text-muted) leading-relaxed">
                Software proprietário desenvolvido como Projeto Integrador do curso de Bacharelado em Engenharia de Software da Universidade Evangélica de Goiás (UniEVANGÉLICA). Todos os direitos reservados.
              </p>
            </div>

            <div className="border border-(--border-custom) rounded-xl p-4 text-left">
              <h3 className="text-xs font-bold text-(--text) mb-2">Equipe de Desenvolvimento</h3>
              <div className="space-y-1.5">
                {['Ana Luisa Lima Perini', 'Daniella Nogueira e Silva', 'Esther Carolina Batista Lima', 'Victória Gomes Garcia'].map((name) => (
                  <div key={name} className="text-xs text-(--text-muted)">{name}</div>
                ))}
              </div>
              <div className="mt-3 text-[0.65rem] text-(--text-muted)">
                Orientador: Vinícius Sarmento Costa Siqueira<br />
                Coorientador: Jeferson Silva Araújo
              </div>
            </div>

            <p className="text-[0.7rem] text-(--text-muted) flex items-center justify-center gap-1">
              Feito com <Heart size={12} className="text-red-400" /> para a alergologia brasileira
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
