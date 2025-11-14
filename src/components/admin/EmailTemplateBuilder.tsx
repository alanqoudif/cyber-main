'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Eye, Code } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  created_at: string
}

interface EmailTemplateBuilderProps {
  template?: EmailTemplate | null
  onSave: () => void
  onCancel: () => void
}

export function EmailTemplateBuilder({ template, onSave, onCancel }: EmailTemplateBuilderProps) {
  const [name, setName] = useState(template?.name || '')
  const [subject, setSubject] = useState(template?.subject || '')
  const [html, setHtml] = useState(
    template?.html ||
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Action Required</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Dear {{.FirstName}},</p>
    
    <p>We have detected unusual activity on your account. For your security, please verify your account information immediately.</p>
    
    <p>Click the button below to verify your account:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{.URL}}" 
         style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
        Verify Account Now
      </a>
    </div>
    
    <p style="font-size: 12px; color: #666; margin-top: 30px;">
      If you did not request this verification, please ignore this email or contact our support team.
    </p>
  </div>
  
  <img src="{{.TrackingURL}}" width="1" height="1" style="display: none;" alt="" />
</body>
</html>`
  )
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !html.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const url = template ? `/api/templates/${template.id}` : '/api/templates'
      const method = template ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, html }),
      })

      if (res.ok) {
        onSave()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save template')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const previewHtml = html
    .replace(/\{\{\.FirstName\}\}/g, 'John')
    .replace(/\{\{\.URL\}\}/g, '#')
    .replace(/\{\{\.TrackingURL\}\}/g, '#')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {template ? 'Edit Email Template' : 'New Email Template'}
            </h2>
            <p className="text-sm text-muted mt-1">Create a phishing email template</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Code' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Template Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="e.g., Account Verification"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Subject Line *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="e.g., Action Required: Verify Your Account"
              />
            </div>
            <div className="p-3 rounded-lg bg-surface-muted">
              <p className="text-xs font-semibold text-foreground mb-2">Available Variables:</p>
              <ul className="text-xs text-muted space-y-1">
                <li><code className="px-1 py-0.5 bg-background rounded">&#123;&#123;.FirstName&#125;&#125;</code> - Recipient first name</li>
                <li><code className="px-1 py-0.5 bg-background rounded">&#123;&#123;.URL&#125;&#125;</code> - Landing page URL</li>
                <li><code className="px-1 py-0.5 bg-background rounded">&#123;&#123;.TrackingURL&#125;&#125;</code> - Tracking pixel URL</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{previewMode ? 'Preview' : 'HTML Editor'}</CardTitle>
          </CardHeader>
          <CardContent>
            {previewMode ? (
              <div className="border border-border rounded-lg p-4 bg-white">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[600px] border-0"
                  title="Email Preview"
                />
              </div>
            ) : (
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="w-full h-[600px] px-4 py-3 rounded-lg border border-border bg-transparent text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="Enter HTML content..."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

