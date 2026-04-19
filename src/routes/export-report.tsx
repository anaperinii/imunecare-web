import { createFileRoute } from '@tanstack/react-router'
import { ExportReportPage } from '@/pages/export-report-page'

export const Route = createFileRoute('/export-report')({
  component: ExportReportPage,
})
