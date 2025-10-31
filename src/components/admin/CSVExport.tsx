import { Download } from 'lucide-react'

interface CSVExportProps {
  href?: string
  label?: string
}

export function CSVExport({ href = '/api/reports/export?format=csv', label = 'Export CSV' }: CSVExportProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted"
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </a>
  )
}
