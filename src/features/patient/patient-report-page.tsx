import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { usePatientStore } from '@/features/patient/patient-store'
import { useImmunotherapiesStore } from '@/features/immunotherapy/immunotherapies-store'
import { useCan, useDoctorFilter } from '@/features/user/user-store'
import { useAuditStore, ACTION_LABELS } from '@/features/audit/audit-store'
import { ArrowLeft, FileText, FileSpreadsheet, FileDown, Check, Download, Printer, ShieldCheck, EyeOff, FileJson, Info, CheckSquare } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { cn } from '@/shared/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const formats = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { id: 'csv', label: 'CSV', icon: FileDown },
]

const sections = [
  { id: 'personal', label: 'Dados Pessoais' },
  { id: 'immunotherapy', label: 'Dados da Imunoterapia' },
  { id: 'applications', label: 'Histórico de Aplicações' },
  { id: 'reactions', label: 'Reações Adversas' },
  { id: 'progress', label: 'Progressão do Protocolo' },
]

export function PatientReportPage() {
  const navigate = useNavigate()
  const { patientId } = useSearch({ from: '/patient-report' })
  const { selectedPatient, applications } = usePatientStore()
  const { immunotherapies } = useImmunotherapiesStore()
  const [fileFormat, setFileFormat] = useState('pdf')
  const [selectedSections, setSelectedSections] = useState<string[]>(['personal', 'immunotherapy', 'applications', 'progress'])
  const [anonimizar, setAnonimizar] = useState(false)
  const [consentimento, setConsentimento] = useState(false)
  const [justificativa, setJustificativa] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [reportMode, setReportMode] = useState<'clinico' | 'lgpd'>('clinico')
  const [lgpdFormat, setLgpdFormat] = useState<'json' | 'csv'>('json')
  const canLgpdPortability = useCan('lgpd_portability')
  const canEmitReport = useCan('emit_report')
  const doctorFilter = useDoctorFilter()

  useEffect(() => {
    if (!canEmitReport) navigate({ to: '/immunotherapies' })
  }, [canEmitReport, navigate])

  useEffect(() => {
    if (!canLgpdPortability && reportMode === 'lgpd') setReportMode('clinico')
  }, [canLgpdPortability, reportMode])

  useEffect(() => {
    if (!doctorFilter) return
    const targetId = selectedPatient?.id ?? patientId
    if (!targetId) return
    const patientDoctor = selectedPatient?.medicoResponsavel
      ?? immunotherapies.find((i) => i.id === targetId)?.medicoResponsavel
    if (patientDoctor && patientDoctor !== doctorFilter) navigate({ to: '/immunotherapies' })
  }, [doctorFilter, selectedPatient, patientId, immunotherapies, navigate])

  const patient = selectedPatient || (() => {
    if (!patientId) return null
    const imm = immunotherapies.find((i) => i.id === patientId)
    if (!imm) return null
    return {
      id: imm.id, nome: imm.nome, dataNascimento: '02/07/2000', idade: 25,
      telefone: '(62) 99557-1423', peso: '89.7 kg', cpf: '711.905.744-89',
      medicoResponsavel: imm.medicoResponsavel, status: imm.status === 'ativo' ? 'ativo' as const : 'inativo' as const,
      tipoImunoterapia: imm.tipo, inicioInducao: '01/01/2020', inicioManutencao: null,
      viaAdministracao: 'Subcutânea', extrato: 'Der p 60 + der f 10% + blt 30%',
      concentracaoVolumeMeta: '1:10 - 0,5ml', metaAtingida: false,
      intervaloAtual: imm.cicloIntervalo.dias, dataProximaAplicacao: '21/05/2025',
      concentracaoDoseAtuais: imm.doseConcentracao,
    }
  })()

  const patientApps = useMemo(() => {
    if (!patient) return []
    return applications.filter((a) => a.patientId === patient.id).sort((a, b) => {
      const da = a.data.split('/'), db = b.data.split('/')
      return new Date(+db[2], +db[1] - 1, +db[0]).getTime() - new Date(+da[2], +da[1] - 1, +da[0]).getTime()
    })
  }, [patient, applications])

  // RNE-021 — Trilha de acessos ao prontuário (LGPD Art. 19)
  const auditLogs = useAuditStore((s) => s.logs)
  const patientAccessLog = useMemo(() => {
    if (!patient) return []
    return auditLogs.filter((l) => l.patientId === patient.id).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [auditLogs, patient])

  const realizedApps = patientApps.filter((a) => a.status === 'realizada')
  const reactionsCount = realizedApps.filter((a) => a.efeitoColateral === 'Sim').length

  const mask = (value: string) => {
    if (!anonimizar) return value
    if (value.length <= 3) return '***'
    return value.slice(0, 3) + '*'.repeat(Math.max(value.length - 3, 3))
  }
  const maskCpf = (cpf: string) => anonimizar ? '***.***.***-**' : cpf
  const maskPhone = (phone: string) => anonimizar ? '(**) *****-****' : phone

  const toggleSection = (id: string) => {
    setSelectedSections((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  const downloadFile = (content: string | Blob, filename: string, mime: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const buildReportData = () => {
    if (!patient) return null
    return {
      patient: anonimizar ? { ...patient, nome: mask(patient.nome), cpf: maskCpf(patient.cpf), telefone: maskPhone(patient.telefone) } : patient,
      sections: selectedSections,
      realizedApps,
      reactionsCount,
      generatedAt: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
    }
  }

  const exportCsv = () => {
    const d = buildReportData()
    if (!d) return
    const lines: string[] = []
    lines.push(`"Relatório Clínico — ${d.patient.nome}"`)
    lines.push(`"Gerado em: ${d.generatedAt}"`)
    lines.push('')
    if (selectedSections.includes('personal')) {
      lines.push('"=== DADOS PESSOAIS ==="')
      lines.push('Campo,Valor')
      ;[['Nome', d.patient.nome], ['CPF', d.patient.cpf], ['Data de Nascimento', d.patient.dataNascimento], ['Idade', `${d.patient.idade} anos`], ['Telefone', d.patient.telefone], ['Peso', d.patient.peso], ['Médico Responsável', d.patient.medicoResponsavel]]
        .forEach(([k, v]) => lines.push(`"${k}","${String(v).replace(/"/g, '""')}"`))
      lines.push('')
    }
    if (selectedSections.includes('immunotherapy')) {
      lines.push('"=== DADOS DA IMUNOTERAPIA ==="')
      lines.push('Campo,Valor')
      ;[['Tipo', d.patient.tipoImunoterapia], ['Via', d.patient.viaAdministracao], ['Extrato', d.patient.extrato], ['Início Indução', d.patient.inicioInducao], ['Meta', d.patient.concentracaoVolumeMeta], ['Dose Atual', d.patient.concentracaoDoseAtuais], ['Intervalo', `${d.patient.intervaloAtual} dias`]]
        .forEach(([k, v]) => lines.push(`"${k}","${String(v).replace(/"/g, '""')}"`))
      lines.push('')
    }
    if (selectedSections.includes('applications')) {
      lines.push('"=== HISTÓRICO DE APLICAÇÕES ==="')
      lines.push('Data,Dose,Intervalo,Reação,Responsável')
      d.realizedApps.forEach((a) => lines.push(`"${a.data}","${a.dose}","${a.ciclo.dias}d","${a.efeitoColateral || 'Não'}","${a.responsavel || '-'}"`))
      lines.push('')
    }
    if (selectedSections.includes('reactions')) {
      lines.push('"=== REAÇÕES ADVERSAS ==="')
      lines.push('Data,Dose,Medicação,Observação')
      d.realizedApps.filter((a) => a.efeitoColateral === 'Sim').forEach((a) => lines.push(`"${a.data}","${a.dose}","${a.necessidadeMedicacao || '-'}","${(a.notaResponsavel || '').replace(/"/g, '""')}"`))
      lines.push('')
    }
    if (selectedSections.includes('progress')) {
      lines.push('"=== PROGRESSÃO DO PROTOCOLO ==="')
      lines.push('Métrica,Valor')
      lines.push(`"Aplicações realizadas","${d.realizedApps.length}"`)
      lines.push(`"Concentração atual","${d.patient.concentracaoDoseAtuais.split(' - ')[0]}"`)
      lines.push(`"Intervalo","${d.patient.intervaloAtual} dias"`)
    }
    // Add BOM for Excel UTF-8 recognition
    downloadFile('\ufeff' + lines.join('\n'), `relatorio_${patient!.nome.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`, 'text/csv;charset=utf-8')
  }

  const exportExcel = () => {
    const d = buildReportData()
    if (!d) return
    const rows: string[] = []
    rows.push(`<tr><th colspan="2" style="background:#18C1CB;color:#fff;padding:8px;font-size:14px;">Relatório Clínico — ${d.patient.nome}</th></tr>`)
    rows.push(`<tr><td colspan="2" style="padding:6px;font-size:11px;color:#666;">Gerado em: ${d.generatedAt}${anonimizar ? ' · Dados anonimizados' : ''}</td></tr>`)
    rows.push(`<tr><td colspan="2" style="height:10px;"></td></tr>`)
    const addSection = (title: string, pairs: [string, string][]) => {
      rows.push(`<tr><th colspan="2" style="background:#B6F2EC;padding:6px;text-align:left;font-size:12px;">${title}</th></tr>`)
      pairs.forEach(([k, v]) => rows.push(`<tr><td style="padding:4px 8px;font-size:11px;color:#666;">${k}</td><td style="padding:4px 8px;font-size:11px;font-weight:bold;">${v}</td></tr>`))
      rows.push(`<tr><td colspan="2" style="height:8px;"></td></tr>`)
    }
    if (selectedSections.includes('personal')) {
      addSection('Dados Pessoais', [['Nome', d.patient.nome], ['CPF', d.patient.cpf], ['Data de Nascimento', d.patient.dataNascimento], ['Idade', `${d.patient.idade} anos`], ['Telefone', d.patient.telefone], ['Peso', d.patient.peso], ['Médico Responsável', d.patient.medicoResponsavel]])
    }
    if (selectedSections.includes('immunotherapy')) {
      addSection('Dados da Imunoterapia', [['Tipo', d.patient.tipoImunoterapia], ['Via', d.patient.viaAdministracao], ['Extrato', d.patient.extrato], ['Início Indução', d.patient.inicioInducao], ['Meta', d.patient.concentracaoVolumeMeta], ['Dose Atual', d.patient.concentracaoDoseAtuais], ['Intervalo', `${d.patient.intervaloAtual} dias`]])
    }
    if (selectedSections.includes('applications')) {
      rows.push(`<tr><th colspan="2" style="background:#B6F2EC;padding:6px;text-align:left;font-size:12px;">Histórico de Aplicações (${d.realizedApps.length})</th></tr>`)
      rows.push(`<tr><td colspan="2" style="padding:0;"><table style="width:100%;border-collapse:collapse;"><tr><th style="padding:4px 8px;font-size:10px;background:#eee;">Data</th><th style="padding:4px 8px;font-size:10px;background:#eee;">Dose</th><th style="padding:4px 8px;font-size:10px;background:#eee;">Intervalo</th><th style="padding:4px 8px;font-size:10px;background:#eee;">Reação</th></tr>${d.realizedApps.map((a) => `<tr><td style="padding:3px 8px;font-size:10px;">${a.data}</td><td style="padding:3px 8px;font-size:10px;">${a.dose}</td><td style="padding:3px 8px;font-size:10px;">${a.ciclo.dias}d</td><td style="padding:3px 8px;font-size:10px;">${a.efeitoColateral || 'Não'}</td></tr>`).join('')}</table></td></tr>`)
      rows.push(`<tr><td colspan="2" style="height:8px;"></td></tr>`)
    }
    if (selectedSections.includes('progress')) {
      addSection('Progressão do Protocolo', [['Aplicações realizadas', String(d.realizedApps.length)], ['Concentração atual', d.patient.concentracaoDoseAtuais.split(' - ')[0]], ['Intervalo', `${d.patient.intervaloAtual} dias`]])
    }
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"/></head><body><table>${rows.join('')}</table></body></html>`
    downloadFile(html, `relatorio_${patient!.nome.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.xls`, 'application/vnd.ms-excel')
  }

  const exportPdf = () => {
    const d = buildReportData()
    if (!d) return
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const pageH = doc.internal.pageSize.getHeight()
    const margin = 15
    let y = margin

    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - 20) {
        doc.addPage()
        y = margin
      }
    }

    // Header
    doc.setFillColor(24, 193, 203)
    doc.rect(0, 0, pageW, 2, 'F')
    doc.setFontSize(16)
    doc.setTextColor(14, 153, 163)
    doc.setFont('helvetica', 'bold')
    doc.text(`Relatório Clínico`, margin, (y += 6))
    doc.setFontSize(13)
    doc.setTextColor(15, 32, 39)
    doc.text(d.patient.nome, margin, (y += 7))
    if (anonimizar) {
      doc.setFillColor(182, 242, 236)
      doc.setTextColor(14, 153, 163)
      doc.setFontSize(8)
      doc.roundedRect(margin, y + 1, 28, 5, 1.5, 1.5, 'F')
      doc.text('ANONIMIZADO', margin + 2, y + 4.5)
    }
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'normal')
    doc.text(`Gerado em ${d.generatedAt} · ImuneCare`, margin, (y += 10))
    doc.setDrawColor(226, 240, 239)
    doc.line(margin, (y += 3), pageW - margin, y)
    y += 6

    const addSectionTitle = (title: string) => {
      ensureSpace(10)
      doc.setFontSize(12)
      doc.setTextColor(14, 153, 163)
      doc.setFont('helvetica', 'bold')
      doc.text(title, margin, y)
      y += 2
      doc.setDrawColor(226, 240, 239)
      doc.line(margin, y, pageW - margin, y)
      y += 5
    }

    const addKV = (key: string, value: string) => {
      ensureSpace(6)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text(`${key}:`, margin, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 32, 39)
      doc.text(String(value), margin + 45, y)
      y += 5
    }

    if (selectedSections.includes('personal')) {
      addSectionTitle('Dados Pessoais')
      addKV('Nome', d.patient.nome)
      addKV('CPF', d.patient.cpf)
      addKV('Data de Nascimento', d.patient.dataNascimento)
      addKV('Idade', `${d.patient.idade} anos`)
      addKV('Telefone', d.patient.telefone)
      addKV('Peso', d.patient.peso)
      addKV('Médico Responsável', d.patient.medicoResponsavel)
      y += 3
    }

    if (selectedSections.includes('immunotherapy')) {
      addSectionTitle('Dados da Imunoterapia')
      addKV('Tipo', d.patient.tipoImunoterapia)
      addKV('Via de Administração', d.patient.viaAdministracao)
      addKV('Extrato', d.patient.extrato)
      addKV('Início Indução', d.patient.inicioInducao)
      addKV('Meta', d.patient.concentracaoVolumeMeta)
      addKV('Dose Atual', d.patient.concentracaoDoseAtuais)
      addKV('Intervalo', `${d.patient.intervaloAtual} dias`)
      y += 3
    }

    if (selectedSections.includes('applications')) {
      addSectionTitle(`Histórico de Aplicações (${d.realizedApps.length})`)
      // Table header
      ensureSpace(8)
      doc.setFillColor(245, 250, 250)
      doc.rect(margin, y, pageW - margin * 2, 6, 'F')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.text('DATA', margin + 2, y + 4)
      doc.text('DOSE', margin + 35, y + 4)
      doc.text('INTERVALO', margin + 100, y + 4)
      doc.text('REAÇÃO', margin + 140, y + 4)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(15, 32, 39)
      doc.setFontSize(9)
      d.realizedApps.forEach((a) => {
        ensureSpace(6)
        doc.text(a.data, margin + 2, y + 4)
        doc.text(a.dose, margin + 35, y + 4)
        doc.text(`${a.ciclo.dias} dias`, margin + 100, y + 4)
        doc.text(a.efeitoColateral || 'Não', margin + 140, y + 4)
        doc.setDrawColor(240, 240, 240)
        doc.line(margin, y + 6, pageW - margin, y + 6)
        y += 6
      })
      y += 3
    }

    if (selectedSections.includes('reactions')) {
      addSectionTitle(`Reações Adversas (${d.reactionsCount})`)
      if (d.reactionsCount === 0) {
        ensureSpace(6)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(100, 116, 139)
        doc.text('Nenhuma reação adversa registrada.', margin, y)
        y += 6
      } else {
        d.realizedApps.filter((a) => a.efeitoColateral === 'Sim').forEach((a) => {
          ensureSpace(12)
          doc.setFillColor(255, 248, 235)
          doc.rect(margin, y, pageW - margin * 2, 10, 'F')
          doc.setDrawColor(245, 158, 11)
          doc.setLineWidth(0.8)
          doc.line(margin, y, margin, y + 10)
          doc.setLineWidth(0.2)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(180, 83, 9)
          doc.text(`${a.data} — ${a.dose}`, margin + 3, y + 4)
          doc.setFontSize(8)
          doc.setFont('helvetica', 'normal')
          doc.text(a.necessidadeMedicacao === 'Sim' ? 'Com medicação' : 'Sem medicação', margin + 3, y + 8)
          y += 12
        })
      }
      y += 3
    }

    if (selectedSections.includes('progress')) {
      addSectionTitle('Progressão do Protocolo')
      ensureSpace(22)
      const boxW = (pageW - margin * 2 - 8) / 3
      const boxes: [string, string][] = [[String(d.realizedApps.length), 'Aplicações'], [d.patient.concentracaoDoseAtuais.split(' - ')[0], 'Concentração atual'], [`${d.patient.intervaloAtual}d`, 'Intervalo']]
      boxes.forEach(([v, l], i) => {
        const x = margin + i * (boxW + 4)
        doc.setFillColor(245, 250, 250)
        doc.roundedRect(x, y, boxW, 18, 2, 2, 'F')
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(24, 193, 203)
        doc.text(v, x + boxW / 2, y + 9, { align: 'center' })
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 116, 139)
        doc.text(l, x + boxW / 2, y + 14, { align: 'center' })
      })
      y += 22
    }

    // Footer on all pages
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setDrawColor(226, 240, 239)
      doc.line(margin, pageH - 18, pageW - margin, pageH - 18)
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.setFont('helvetica', 'normal')
      const lgpdText = 'Documento protegido pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). A reprodução, compartilhamento ou armazenamento não autorizado é proibido.'
      const splitText = doc.splitTextToSize(lgpdText, pageW - margin * 2)
      doc.text(splitText, margin, pageH - 14)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(200, 200, 200)
      doc.text('CONFIDENCIAL', pageW / 2, pageH - 5, { align: 'center', charSpace: 2 })
      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(`Página ${i} de ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' })
    }

    doc.save(`relatorio_${patient!.nome.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
  }

  const handleExport = () => {
    if (fileFormat === 'csv') exportCsv()
    else if (fileFormat === 'excel') exportExcel()
    else exportPdf()
  }

  if (!patient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-(--text-muted)">Paciente não encontrado</span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate({ to: '/patient/$patientId', params: { patientId: patient.id } })} className="h-8 w-8 flex items-center justify-center rounded-lg text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-(--text)">Emitir Relatório</h1>
              <p className="text-[0.65rem] text-(--text-muted)">{patient.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={!consentimento || !justificativa.trim()}
              onClick={exportPdf}
              className={cn("h-8 px-3 flex items-center gap-1.5 rounded-lg border text-xs font-semibold transition-all", consentimento && justificativa.trim() ? "border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand cursor-pointer" : "border-gray-200 text-gray-300 cursor-not-allowed")}
            >
              <Printer size={13} />
              Imprimir
            </button>
            <button
              disabled={!consentimento || !justificativa.trim()}
              onClick={() => setShowExportModal(true)}
              className={cn("h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-semibold transition-all", consentimento && justificativa.trim() ? "bg-linear-to-br from-brand to-teal-400 text-white hover:-translate-y-px cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
            >
              <Download size={13} />
              Exportar {fileFormat.toUpperCase()}
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left — Config */}
          <div className="w-72 shrink-0 border-r border-(--border-custom) p-5 overflow-y-auto space-y-5">
            {/* Mode tabs */}
            {canLgpdPortability && (
              <div className="flex h-8 rounded-lg border border-(--border-custom) overflow-hidden">
                <button onClick={() => setReportMode('clinico')} className={cn("flex-1 px-3 text-xs font-semibold transition-all", reportMode === 'clinico' ? "bg-linear-to-br from-brand to-teal-400 text-white" : "text-(--text-muted) hover:bg-gray-50")}>
                  Clínico
                </button>
                <button onClick={() => setReportMode('lgpd')} className={cn("flex-1 px-3 text-xs font-semibold transition-all", reportMode === 'lgpd' ? "bg-linear-to-br from-brand to-teal-400 text-white" : "text-(--text-muted) hover:bg-gray-50")}>
                  Portabilidade
                </button>
              </div>
            )}

            {reportMode === 'lgpd' && (
              <>
                <div className="flex items-start gap-2 bg-brand/5 border border-brand/20 rounded-lg px-3 py-2.5">
                  <Info size={14} className="text-brand shrink-0 mt-0.5" />
                  <p className="text-[0.6rem] text-(--text) leading-relaxed">
                    Exportação estruturada de todos os dados em atendimento ao <span className="font-bold">Art. 18, V da LGPD</span> (Direito à portabilidade).
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Formato</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setLgpdFormat('json')} className={cn("h-9 rounded-lg border-[1.5px] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer", lgpdFormat === 'json' ? "border-brand bg-teal-50/60 text-brand" : "border-(--border-custom) text-(--text-muted) hover:border-brand/50")}>
                      <FileJson size={13} />
                      JSON
                    </button>
                    <button onClick={() => setLgpdFormat('csv')} className={cn("h-9 rounded-lg border-[1.5px] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer", lgpdFormat === 'csv' ? "border-brand bg-teal-50/60 text-brand" : "border-(--border-custom) text-(--text-muted) hover:border-brand/50")}>
                      <FileSpreadsheet size={13} />
                      CSV
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Dados incluídos</label>
                  <div className="space-y-1.5">
                    {['Dados cadastrais', 'Dados da imunoterapia', 'Histórico de aplicações', 'Reações adversas', 'Histórico de ajustes', `Histórico de acessos ao prontuário (${patientAccessLog.length})`].map((d) => (
                      <div key={d} className="flex items-center gap-1.5 text-[0.6rem] text-(--text) bg-teal-50/50 border border-teal-100 rounded px-2 py-1">
                        <CheckSquare size={10} className="text-brand shrink-0" />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Motivo da solicitação <span className="text-red-400">*</span></label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Solicitação formal do paciente"
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    className="w-full rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 py-2 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <button
                  onClick={() => setConsentimento(!consentimento)}
                  className={cn("flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer", consentimento ? "border-brand bg-brand/5" : "border-(--border-custom) hover:border-brand/40")}
                >
                  <div className={cn("flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0 mt-px", consentimento ? "bg-brand border-brand" : "border-gray-300")}>
                    {consentimento && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <div className="text-[0.65rem] font-semibold text-(--text)">Declaro ciência dos termos LGPD</div>
                    <div className="text-[0.55rem] text-(--text-muted) leading-relaxed mt-0.5">Confirmo que há solicitação formal do titular.</div>
                  </div>
                </button>
                <button
                  disabled={!consentimento || !justificativa.trim()}
                  onClick={() => {
                    const data = {
                      exportedAt: new Date().toISOString(),
                      exportedBy: 'Sistema ImuneCare',
                      justification: justificativa.trim(),
                      lgpdCompliance: { legalBasis: 'LGPD Art. 18, V — Direito à portabilidade / Art. 19 — Direito de acesso' },
                      patient: {
                        id: patient.id, nome: patient.nome, cpf: patient.cpf, dataNascimento: patient.dataNascimento,
                        idade: patient.idade, telefone: patient.telefone, peso: patient.peso,
                        medicoResponsavel: patient.medicoResponsavel, status: patient.status,
                      },
                      imunoterapia: {
                        tipo: patient.tipoImunoterapia, viaAdministracao: patient.viaAdministracao,
                        extrato: patient.extrato, inicioInducao: patient.inicioInducao,
                        inicioManutencao: patient.inicioManutencao, concentracaoVolumeMeta: patient.concentracaoVolumeMeta,
                        concentracaoDoseAtuais: patient.concentracaoDoseAtuais, intervaloAtual: patient.intervaloAtual,
                        metaAtingida: patient.metaAtingida, dataProximaAplicacao: patient.dataProximaAplicacao,
                      },
                      aplicacoes: patientApps,
                      // RNE-021 — Trilha de acessos e operações (LGPD Art. 19)
                      historicoDeAcessos: patientAccessLog.map((l) => ({
                        data: l.timestamp,
                        profissional: l.userName,
                        perfil: l.userRole,
                        registro: l.userRegistration,
                        acao: ACTION_LABELS[l.action],
                        descricao: l.description,
                      })),
                    }
                    const filename = `imunecare_lgpd_${patient.nome.replace(/\s+/g, '_').toLowerCase()}_${format(new Date(), 'yyyyMMdd_HHmm')}.${lgpdFormat}`
                    let content: string, mime: string
                    if (lgpdFormat === 'json') { content = JSON.stringify(data, null, 2); mime = 'application/json' }
                    else {
                      const lines = ['Categoria,Campo,Valor']
                      Object.entries(data.patient).forEach(([k, v]) => lines.push(`"Paciente","${k}","${String(v).replace(/"/g, '""')}"`))
                      Object.entries(data.imunoterapia).forEach(([k, v]) => lines.push(`"Imunoterapia","${k}","${String(v ?? '').replace(/"/g, '""')}"`))
                      data.aplicacoes.forEach((a, i) => Object.entries(a).forEach(([k, v]) => lines.push(`"Aplicacao ${i + 1}","${k}","${typeof v === 'object' ? JSON.stringify(v).replace(/"/g, '""') : String(v ?? '').replace(/"/g, '""')}"`)))
                      data.historicoDeAcessos.forEach((l, i) => Object.entries(l).forEach(([k, v]) => lines.push(`"Acesso ${i + 1}","${k}","${String(v ?? '').replace(/"/g, '""')}"`)))
                      content = lines.join('\n'); mime = 'text/csv;charset=utf-8'
                    }
                    const blob = new Blob([content], { type: mime })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = filename
                    document.body.appendChild(a); a.click(); document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  className={cn("w-full h-9 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5", consentimento && justificativa.trim() ? "bg-linear-to-br from-brand to-teal-400 text-white hover:-translate-y-px cursor-pointer" : "bg-gray-200 text-gray-400 cursor-not-allowed")}
                >
                  <Download size={13} />
                  Exportar {lgpdFormat.toUpperCase()}
                </button>
              </>
            )}

            {reportMode === 'clinico' && <>
            {/* Format */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Formato</label>
              <div className="flex gap-2">
                {formats.map((f) => {
                  const Icon = f.icon
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFileFormat(f.id)}
                      className={cn(
                        "flex-1 h-9 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        fileFormat === f.id
                          ? "border-brand bg-brand-50 text-brand-dark"
                          : "border-(--border-custom) text-(--text-muted) hover:border-brand/50"
                      )}
                    >
                      <Icon size={13} />
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sections */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-2 block">Seções incluídas</label>
              <div className="space-y-1.5">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSection(s.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                      selectedSections.includes(s.id)
                        ? "border-brand bg-brand-50/50"
                        : "border-(--border-custom) hover:border-brand/50"
                    )}
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0",
                      selectedSections.includes(s.id)
                        ? "bg-brand border-brand"
                        : "border-gray-300"
                    )}>
                      {selectedSections.includes(s.id) && <Check size={10} className="text-white" />}
                    </div>
                    <span className="text-[0.7rem] font-medium text-(--text)">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider">Resumo</div>
              <div className="text-[0.65rem] text-(--text-muted) space-y-1">
                <div className="flex justify-between"><span>Aplicações realizadas</span><span className="font-semibold text-(--text)">{realizedApps.length}</span></div>
                <div className="flex justify-between"><span>Reações adversas</span><span className="font-semibold text-(--text)">{reactionsCount}</span></div>
                <div className="flex justify-between"><span>Intervalo atual</span><span className="font-semibold text-(--text)">{patient.intervaloAtual} dias</span></div>
                <div className="flex justify-between"><span>Status</span><span className={cn("font-semibold", patient.status === 'ativo' ? "text-green-600" : "text-(--text-muted)")}>{patient.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></div>
              </div>
            </div>

            {/* LGPD & Privacy */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-2 block">
                Privacidade e LGPD
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setAnonimizar(!anonimizar)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                    anonimizar ? "border-brand bg-brand/5" : "border-(--border-custom) hover:border-brand/40"
                  )}
                >
                  <div className={cn("flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0", anonimizar ? "bg-brand border-brand" : "border-gray-300")}>
                    {anonimizar && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-medium text-(--text) block">Anonimizar dados pessoais</span>
                    <span className="text-[0.55rem] text-(--text-muted)">Nome, CPF e telefone serão mascarados</span>
                  </div>
                </button>
                <button
                  onClick={() => setConsentimento(!consentimento)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all cursor-pointer",
                    consentimento ? "border-brand bg-brand/5" : "border-(--border-custom) hover:border-brand/40"
                  )}
                >
                  <div className={cn("flex h-4 w-4 items-center justify-center rounded border transition-all shrink-0", consentimento ? "bg-brand border-brand" : "border-gray-300")}>
                    {consentimento && <Check size={10} className="text-white" />}
                  </div>
                  <div>
                    <span className="text-[0.7rem] font-medium text-(--text) block">Declaro ciência da LGPD</span>
                    <span className="text-[0.55rem] text-(--text-muted)">Responsabilizo-me pelo uso dos dados</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Justification */}
            <div>
              <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Justificativa <span className="text-red-400">*</span></label>
              <textarea
                rows={2}
                placeholder="Ex: Acompanhamento clínico do paciente"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                className="w-full rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 py-2 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none"
              />
            </div>

            {!consentimento && (
              <p className="text-[0.55rem] text-amber-600 text-center">Aceite a declaração LGPD para habilitar a exportação</p>
            )}
            </>}
          </div>

          {/* Right — Preview */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
            {reportMode === 'lgpd' ? (
              <div className="bg-white rounded-xl border border-(--border-custom) shadow-sm max-w-2xl mx-auto p-6 space-y-4">
                <div className="pb-3 border-b border-(--border-custom)">
                  <h2 className="text-sm font-bold text-(--text)">Pacote de Portabilidade LGPD</h2>
                  <p className="text-[0.65rem] text-(--text-muted) mt-0.5">{anonimizar ? mask(patient.nome) : patient.nome} · {lgpdFormat.toUpperCase()}</p>
                </div>
                <div className="flex items-start gap-2 bg-brand/5 border border-brand/20 rounded-lg px-3 py-2.5">
                  <Info size={13} className="text-brand shrink-0 mt-0.5" />
                  <p className="text-[0.65rem] text-(--text) leading-relaxed">
                    Pacote estruturado conforme <span className="font-bold">Art. 18, V</span> (portabilidade) e <span className="font-bold">Art. 19</span> (direito de acesso) da LGPD. Contém os dados do titular e o histórico de quem acessou o prontuário.
                  </p>
                </div>
                <div>
                  <div className="text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider mb-2">Conteúdo do pacote</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Dados cadastrais', value: '1 registro' },
                      { label: 'Dados da imunoterapia', value: '1 registro' },
                      { label: 'Histórico de aplicações', value: `${patientApps.length} ${patientApps.length === 1 ? 'registro' : 'registros'}` },
                      { label: 'Histórico de acessos', value: `${patientAccessLog.length} ${patientAccessLog.length === 1 ? 'registro' : 'registros'}` },
                    ].map((item) => (
                      <div key={item.label} className="border border-(--border-custom) rounded-lg px-3 py-2">
                        <div className="text-[0.55rem] text-(--text-muted) uppercase tracking-wider">{item.label}</div>
                        <div className="text-xs font-bold text-(--text) mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[0.55rem] text-(--text-muted) leading-relaxed pt-2 border-t border-(--border-custom)">
                  Ao confirmar a exportação, o pacote completo será gerado no formato selecionado. Assegure-se de que há justificativa formal do titular (Art. 18, § 3º da LGPD) antes de liberar o arquivo.
                </div>
              </div>
            ) : (
            <div className="bg-white rounded-xl border border-(--border-custom) shadow-sm max-w-2xl mx-auto">
              {/* Report header */}
              <div className="px-6 py-5 border-b border-(--border-custom)">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-(--text)">Relatório Clínico — {anonimizar ? mask(patient.nome) : patient.nome}</h2>
                    <p className="text-[0.65rem] text-(--text-muted) mt-0.5">Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                  </div>
                  <div className="text-[0.6rem] text-(--text-muted) text-right">
                    <div>ImuneCare</div>
                    <div>Formato: {fileFormat.toUpperCase()}</div>
                    {anonimizar && (
                      <div className="flex items-center gap-1 text-brand font-semibold mt-0.5 justify-end">
                        <EyeOff size={10} />
                        Dados anonimizados
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 space-y-5">
                {selectedSections.length === 0 ? (
                  <div className="text-center py-12 text-xs text-(--text-muted)">Selecione pelo menos uma seção.</div>
                ) : (
                  <>
                    {/* Dados Pessoais */}
                    {selectedSections.includes('personal') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Dados Pessoais</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {[
                            ['Nome', anonimizar ? mask(patient.nome) : patient.nome],
                            ['CPF', maskCpf(patient.cpf)],
                            ['Data de Nascimento', patient.dataNascimento],
                            ['Idade', `${patient.idade} anos`],
                            ['Telefone', maskPhone(patient.telefone)],
                            ['Peso', patient.peso],
                            ['Médico Responsável', patient.medicoResponsavel],
                          ].map(([l, v]) => (
                            <div key={l} className="flex items-center gap-2 text-[0.7rem]">
                              <span className="text-(--text-muted)">{l}:</span>
                              <span className="font-medium text-(--text)">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dados da Imunoterapia */}
                    {selectedSections.includes('immunotherapy') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Dados da Imunoterapia</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          {[
                            ['Tipo', patient.tipoImunoterapia], ['Via', patient.viaAdministracao],
                            ['Extrato', patient.extrato], ['Início Indução', patient.inicioInducao],
                            ['Meta', patient.concentracaoVolumeMeta], ['Dose Atual', patient.concentracaoDoseAtuais],
                            ['Intervalo Atual', `${patient.intervaloAtual} dias`],
                          ].map(([l, v]) => (
                            <div key={l} className="flex items-center gap-2 text-[0.7rem]">
                              <span className="text-(--text-muted)">{l}:</span>
                              <span className="font-medium text-(--text)">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Histórico de Aplicações */}
                    {selectedSections.includes('applications') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Histórico de Aplicações ({realizedApps.length})</h3>
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-(--border-custom)">
                              <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Data</th>
                              <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Dose</th>
                              <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Intervalo</th>
                              <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Reação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {realizedApps.slice(0, 15).map((app) => (
                              <tr key={app.id} className="border-b border-(--border-custom) last:border-0">
                                <td className="py-1.5 text-[0.65rem] text-(--text)">{app.data}</td>
                                <td className="py-1.5 text-[0.65rem] text-(--text)">{app.dose}</td>
                                <td className="py-1.5 text-[0.65rem] text-(--text)">{app.ciclo.dias}d</td>
                                <td className="py-1.5 text-[0.65rem]">
                                  <span className={cn("font-medium", app.efeitoColateral === 'Sim' ? "text-amber-600" : "text-green-600")}>
                                    {app.efeitoColateral || 'Não'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {realizedApps.length > 15 && (
                          <div className="text-center text-[0.6rem] text-(--text-muted) mt-2">... e mais {realizedApps.length - 15} aplicações</div>
                        )}
                      </div>
                    )}

                    {/* Reações Adversas */}
                    {selectedSections.includes('reactions') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Reações Adversas ({reactionsCount})</h3>
                        {reactionsCount === 0 ? (
                          <p className="text-[0.7rem] text-(--text-muted)">Nenhuma reação adversa registrada.</p>
                        ) : (
                          <div className="space-y-2">
                            {realizedApps.filter((a) => a.efeitoColateral === 'Sim').map((app) => (
                              <div key={app.id} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.65rem] font-semibold text-amber-700">{app.data} — {app.dose}</span>
                                  <span className="text-[0.55rem] text-amber-600">{app.necessidadeMedicacao === 'Sim' ? 'Com medicação' : 'Sem medicação'}</span>
                                </div>
                                {app.notaResponsavel && app.notaResponsavel !== '-' && (
                                  <div className="text-[0.6rem] text-amber-600 mt-1">{app.notaResponsavel}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Progressão */}
                    {selectedSections.includes('progress') && (
                      <div>
                        <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">Progressão do Protocolo</h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-extrabold text-brand">{realizedApps.length}</div>
                            <div className="text-[0.6rem] text-(--text-muted)">Aplicações</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-extrabold text-brand">{patient.concentracaoDoseAtuais.split(' - ')[0]}</div>
                            <div className="text-[0.6rem] text-(--text-muted)">Concentração atual</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-lg font-extrabold text-brand">{patient.intervaloAtual}d</div>
                            <div className="text-[0.6rem] text-(--text-muted)">Intervalo</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-(--border-custom)">
                <div className="flex justify-between mb-2">
                  <span className="text-[0.6rem] text-(--text-muted)">ImuneCare © 2026</span>
                  <span className="text-[0.6rem] text-(--text-muted)">Página 1 de 1</span>
                </div>
                <p className="text-[0.5rem] text-(--text-muted)/60 leading-relaxed mb-2">
                  Documento protegido pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). A reprodução, compartilhamento ou armazenamento não autorizado é proibido. O responsável pela exportação assume total responsabilidade pelo uso das informações.
                </p>
                <div className="text-center py-1.5 bg-gray-50 rounded-md border border-(--border-custom)">
                  <span className="text-[0.7rem] font-bold text-gray-300 uppercase tracking-[0.2em]">Confidencial</span>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Export confirmation modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowExportModal(false)}>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-3">
              <div className="h-11 w-11 rounded-full bg-brand/10 flex items-center justify-center">
                <ShieldCheck size={20} className="text-brand" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-(--text) mb-1.5 text-center">Confirmar exportação</h3>
            <p className="text-[0.7rem] text-(--text-muted) mb-4 text-center leading-relaxed">
              Esta ação será registrada no log de auditoria do sistema conforme exigências da LGPD.
            </p>

            <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 mb-4 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">Paciente</span>
                <span className="text-[0.6rem] font-semibold text-(--text)">{anonimizar ? mask(patient.nome) : patient.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">Formato</span>
                <span className="text-[0.6rem] font-semibold text-(--text)">{fileFormat.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">Dados anonimizados</span>
                <span className={cn("text-[0.6rem] font-semibold", anonimizar ? "text-brand" : "text-amber-600")}>{anonimizar ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[0.6rem] text-(--text-muted)">Justificativa</span>
                <span className="text-[0.6rem] font-semibold text-(--text) text-right max-w-[60%] truncate">{justificativa}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowExportModal(false)} className="flex-1 h-8 rounded-lg border border-(--border-custom) text-xs font-semibold text-(--text-muted) hover:bg-gray-50 transition-all cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={() => { setShowExportModal(false); handleExport() }}
                className="flex-1 h-8 rounded-lg bg-linear-to-br from-brand to-teal-400 text-white text-xs font-semibold hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(20,184,166,0.3)] transition-all cursor-pointer"
              >
                Confirmar e exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
