'use client'

import { Navbar } from '@/components/layout/navbar'
import { UrlScanner } from '@/components/admin/UrlScanner'

export default function UrlScanPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="ADMIN" />
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <header>
          <h1 className="text-3xl font-semibold text-foreground">Link scanner</h1>
          <p className="mt-2 text-muted">
            Validate any URL with the VirusTotal integration and share the findings instantly with your response team.
          </p>
        </header>
        <UrlScanner />
      </main>
    </div>
  )
}
