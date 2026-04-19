import { createFileRoute } from '@tanstack/react-router'
import { ExportReportPage } from '@/features/dashboard/export-report-page'

export const Route = createFileRoute('/export-report')({
  component: ExportReportPage,
})
