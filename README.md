# ImuneCare - Sistema de Gestão de Tratamentos Imunoterápicos Alérgicos

Plataforma de gestão clínica dedicada a consultórios de alergologia que conduzem protocolos de imunoterapia específica (**SCIT - Subcutaneous Immunotherapy**). Oferece prontuário eletrônico estruturado, agenda terapêutica, cálculo automático de progressão de doses, emissão de relatórios clínicos e trilha de auditoria em conformidade com a LGPD.

> **Origem e continuidade:** este repositório foi constituído a partir da versão privada anterior do ImuneCare (repositório interno predecessor), consolidando o estado maduro das funcionalidades estáveis em uma base unificada e arquiteturalmente coerente. A partir deste ponto, toda a evolução subsequente do sistema - novas funcionalidades, refatorações estruturais, correções, melhorias de produto e releases oficiais - passa a ocorrer exclusivamente neste repositório, que assume o papel de fonte única da verdade do projeto.

> **Evolução contínua:** as funcionalidades, regras de negócio, protocolos clínicos e políticas de acesso descritas neste documento encontram-se em processo permanente de revisão, refinamento e amadurecimento, acompanhando o avanço do futuro produto, o retorno de profissionais de saúde envolvidos na validação clínica e eventuais atualizações normativas. Portanto, comportamentos atualmente implementados serão ajustados, expandidos ou reescritos em ciclos futuros - esta documentação reflete o estado vigente do sistema, não um contrato estático.

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Começando](#começando)
- [Scripts](#scripts)
- [Features principais](#features-principais)
- [Controle de acesso](#controle-de-acesso-rbac)
- [Protocolo SCIT](#protocolo-scit)
- [Conformidade LGPD](#conformidade-lgpd)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Convenções](#convenções)

---

## Visão geral

O ImuneCare centraliza e digitaliza o fluxo assistencial de clínicas de alergologia, articulando em um mesmo ambiente as dimensões clínicas, operacionais e regulatórias do acompanhamento longitudinal de pacientes em imunoterapia:

- Prontuário eletrônico completo do paciente sob protocolo SCIT, com histórico integral de aplicações
- Progressão automatizada do tratamento, calculando dose e intervalo da próxima aplicação conforme a fase em curso
- Agenda terapêutica com visões semanal e mensal, incluindo integração com Google Agenda
- Evolução assistida em etapas (pré-aplicação, aplicação, pós-aplicação, revisão clínica)
- Dashboard analítico com indicadores de adesão, distribuição de concentrações e ciclos, filtrado por médico e modalidade
- Emissão de relatórios clínicos e pacotes de portabilidade de dados em conformidade com a LGPD
- Controle de acesso granular por perfil profissional, com trilha de auditoria de todos os acessos a dados sensíveis

---

## Stack

- **React 19** + **TypeScript** (strict)
- **Vite** — bundler e dev server
- **TanStack Router** — roteamento file-based
- **Zustand** — state management
- **Tailwind CSS 4** — estilização

---

## Arquitetura

O código é organizado em **feature modules** + camadas compartilhadas:

```
src/
├── features/          Domínios de negócio (autocontidos)
│   ├── appointment/   Agendamentos
│   ├── audit/         Trilha de acessos (LGPD Art. 19)
│   ├── auth/          Login / register / recuperação de senha
│   ├── dashboard/     Dashboard + export-report
│   ├── immunotherapy/ Lista, cadastro e tipos customizáveis
│   ├── marketing/     Landing page + seções
│   ├── notification/  Central de notificações
│   ├── patient/       Prontuário, evolução e relatório do paciente
│   ├── settings/      Configurações (avançadas, perfil, times, etc.)
│   └── user/          Perfis, roles e permissions (RBAC)
├── shared/
│   ├── hooks/         useForm + hooks genéricos
│   ├── lib/           utils + validators
│   └── ui/            Modal / Button / FormField / Toast
├── layout/            Header, Sidebar, sidebar-store
├── routes/            TanStack Router (file-based)
├── assets/            Imagens, logos, landing art
└── main.tsx
```

**Princípios:**

- Cada feature tem seu próprio store (Zustand), páginas e componentes
- `shared/ui` contém primitives sem contexto de domínio
- `shared/hooks/useForm` centraliza formulários controlados com validação
- Routes ficam em `src/routes/` (TanStack Router gera `routeTree.gen.ts`)
- Todos imports usam alias `@/*` → `./src/*`

---

## Começando

### Pré-requisitos

- Node.js 20+
- npm / pnpm / yarn

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

A aplicação sobe em `http://localhost:5173` (padrão Vite).

### Build de produção

```bash
npm run build
npm run preview
```

---

## Scripts

| Script            | Descrição                                 |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Dev server com HMR                        |
| `npm run build`   | Type-check (`tsc -b`) + build de produção |
| `npm run preview` | Servidor local da build de produção       |
| `npm run lint`    | ESLint em toda a base                     |

---

## Features principais

### Prontuário do paciente

- Histórico de aplicações (calendário mensal + lista)
- Progressão visual do protocolo (indução → manutenção)
- Ajustes de protocolo com histórico e justificativa clínica
- Inativação com categorias estruturadas (motivo + data de retorno prevista)
- Reativação com ponto de retomada configurável

### Evolução do paciente

- Fluxo em 4 steps (Paciente / Pré-aplicação / Pós-aplicação / Revisão)
- Avanço via tecla Enter entre steps
- Autocompletar de sugestões baseado no protocolo SCIT
- Validação de extrato, concentração e volume via validators compartilhados
- Registro simultâneo da aplicação realizada + agendamento da próxima

### Agendamentos

- Visão semanal e mensal
- Modal de detalhes com dados do paciente, WhatsApp direto e navegação para o prontuário
- Lembretes automáticos via WhatsApp (configurável)

### Dashboard

- Cards de KPI (pacientes ativos, aplicações do mês, taxa de adesão)
- 5 gráficos (concentrações, fases, status, tipos, volume × concentração)
- Arquivamento individual de gráficos com reflow automático do layout
- Filtros por médico (quando perfil = médico), modalidade, tipo, mês e ano

### Exportação de relatórios

- Relatório clínico em PDF (via jsPDF)
- Pacote LGPD de portabilidade em JSON ou CSV
- Trilha de acessos completa (Art. 19) incluída no pacote

### Configurações avançadas

- Gerenciamento dos tipos de imunoterapia (CRUD visível em toda a clínica)
- Integração com Google Agenda
- Notificações por e-mail / push
- Personalização de cores de eventos e agendamentos

---

## Controle de acesso (RBAC)

**Perfis disponíveis** (5 profiles seeded para testes):

| Perfil     | Nome seed             | Registro         |
| ---------- | --------------------- | ---------------- |
| admin      | Carla Souza           | Gestão clínica   |
| médico     | Dra. Karina Martins   | CRM/GO 24.815    |
| médico     | Dr. André Lima        | CRM/GO 28.104    |
| enfermeiro | Jaqueline Oliveira    | COREN/GO 318.942 |
| técnico    | Rafael Mendes         | COREN/GO 415.327 |

**Permissões** (`ROLE_PERMISSIONS`):

- `adjust_protocol`, `inactivate_immunotherapy`, `reactivate_patient`
- `edit_patient_data`, `evolve_patient`, `emit_report`, `lgpd_portability`
- `add_immunotherapy`, `new_appointment`
- `manage_team`, `advanced_settings`, `view_dashboard`

Médicos veem apenas seus próprios pacientes (`useDoctorFilter`). O profile switcher fica no menu do usuário na sidebar para testes rápidos.

---

## Protocolo SCIT

Implementação de referência em `src/features/immunotherapy/scit-protocol.ts`.

**Indução** — 16 passos semanais:

```
1:10.000 → 0,1ml → 0,2ml → 0,4ml → 0,8ml
1:1.000  → 0,1ml → 0,2ml → 0,4ml → 0,8ml
1:100    → 0,1ml → 0,2ml → 0,4ml → 0,8ml
1:10     → 0,1ml → 0,2ml → 0,4ml → 0,5ml   ← meta
```

**Manutenção** — mesma concentração meta (`1:10 - 0,5ml`) com progressão de intervalo: `14 → 21 → 28 dias`.

A função `calculateNextDose(dose, interval)` determina automaticamente a próxima aplicação respeitando a fase atual do paciente.

---

## Conformidade LGPD

O sistema foi desenhado para operar em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), com atenção especial aos direitos do titular previstos nos artigos 18 e 19:

- **Art. 18, V — Direito à portabilidade:** exportação integral do dossiê clínico do paciente nos formatos JSON ou CSV por meio da rota `/patient-report`, permitindo a transmissão dos dados a outro controlador quando solicitado pelo titular.
- **Art. 19 — Direito de acesso e transparência:** trilha de acessos persistida no `audit-store` e incorporada ao pacote de portabilidade. Cada visualização de prontuário, exportação ou alteração de dados gera um registro com identificação do profissional, perfil, número de registro profissional, ação executada e carimbo temporal.
- **Salvaguardas operacionais:** solicitação explícita de justificativa clínica e consentimento documentado em operações sensíveis, como inativação de tratamento, reativação de paciente e exportação de dados pessoais.

---

## Estrutura de pastas

```
src/
├── features/
│   ├── appointment/
│   │   └── appointments-page.tsx
│   ├── audit/
│   │   └── audit-store.ts
│   ├── auth/
│   │   ├── auth-card.tsx
│   │   ├── forgot-password-page.tsx
│   │   ├── login-page.tsx
│   │   ├── register-page.tsx
│   │   └── trial-page.tsx
│   ├── dashboard/
│   │   ├── dashboard-page.tsx
│   │   └── export-report-page.tsx
│   ├── immunotherapy/
│   │   ├── add-immunotherapy-page.tsx
│   │   ├── custom-types-store.ts
│   │   ├── immunotherapies-page.tsx
│   │   ├── immunotherapies-store.ts
│   │   └── scit-protocol.ts
│   ├── marketing/
│   │   ├── landing-page.tsx
│   │   └── sections/
│   ├── notification/
│   │   ├── notifications-page.tsx
│   │   └── notifications-store.ts
│   ├── patient/
│   │   ├── patient-chart-page.tsx
│   │   ├── patient-evolution-page.tsx
│   │   ├── patient-report-page.tsx
│   │   └── patient-store.ts
│   ├── settings/
│   │   ├── about-page.tsx
│   │   ├── accessibility-page.tsx
│   │   ├── advanced-settings-page.tsx
│   │   ├── help-page.tsx
│   │   ├── personalization-page.tsx
│   │   ├── plans-page.tsx
│   │   ├── profile-page.tsx
│   │   ├── security-page.tsx
│   │   ├── settings-page.tsx
│   │   └── teams-page.tsx
│   └── user/
│       └── user-store.ts
├── shared/
│   ├── hooks/
│   │   ├── use-counter.ts
│   │   ├── use-enter-reveal.ts
│   │   ├── use-scroll-reveal.ts
│   │   └── useForm.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── validators.ts
│   └── ui/
│       ├── Button.tsx
│       ├── FormField.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       └── index.ts
├── layout/
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── sidebar-store.ts
├── routes/            (TanStack Router file-based)
├── assets/
├── index.css
├── main.tsx
└── routeTree.gen.ts   (auto-gerado)
```

---

## Convenções

- **Imports:** sempre via alias `@/...` (nunca relativo profundo). Ex.: `import { cn } from '@/shared/lib/utils'`.
- **Formulários:** `useForm` para todo form com validação (`set`, `touch`, `validate`, `showError`, `errorOf`).
- **Modais:** `<Modal>` do `@/shared/ui` — variantes `sm | md | lg`, suporte a `footer` e `headerSlot`.
- **Comentários:** apenas quando explicarem **por quê** (decisões não-óbvias, RNE específico, workaround). Identificadores bem nomeados dispensam comentários sobre *o quê*.
- **Datas:** sempre `date-fns` com locale `ptBR`. Formatos ISO (`yyyy-MM-dd`) apenas em inputs `type="date"`; UI sempre pt-BR (`dd/MM/yyyy`).

---

## Licença

Software proprietário. Todos os direitos reservados.

O código-fonte, a documentação, a identidade visual e quaisquer artefatos correlatos contidos neste repositório são de titularidade exclusiva do projeto ImuneCare e destinam-se ao uso interno da organização responsável pelo produto. É vedada, sem autorização prévia e expressa por escrito dos titulares:

- a reprodução, distribuição, publicação ou disponibilização total ou parcial do código a terceiros;
- a modificação, engenharia reversa, descompilação ou criação de obras derivadas;
- a utilização comercial, acadêmica ou pessoal fora do escopo autorizado pela organização.

O acesso a este repositório é restrito a colaboradores devidamente autorizados e implica a aceitação integral das políticas internas de confidencialidade, segurança da informação e tratamento de dados pessoais aplicáveis ao projeto. 
