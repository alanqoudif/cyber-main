'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Eye, Code } from 'lucide-react'

interface LandingPage {
  id: string
  name: string
  html: string
  created_at: string
}

interface LandingPageBuilderProps {
  landingPage?: LandingPage | null
  onSave: () => void
  onCancel: () => void
}

export function LandingPageBuilder({ landingPage, onSave, onCancel }: LandingPageBuilderProps) {
  const [name, setName] = useState(landingPage?.name || '')
  const [html, setHtml] = useState(
    landingPage?.html ||
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 500px; margin: 50px auto; background: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #333; margin: 0;">Verify Your Account</h1>
    </div>
    
    <form>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">Email Address</label>
        <input 
          type="email" 
          style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;"
          placeholder="your.email@example.com"
        />
      </div>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">Password</label>
        <input 
          type="password" 
          style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;"
          placeholder="Enter your password"
        />
      </div>
      
      <button 
        type="submit"
        style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 5px; font-size: 16px; font-weight: bold; cursor: pointer;"
      >
        Verify Account
      </button>
    </form>
    
    <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
      This is a simulated phishing page for educational purposes.
    </p>
  </div>
</body>
</html>`
  )
  const [previewMode, setPreviewMode] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !html.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const url = landingPage ? `/api/landing-pages/${landingPage.id}` : '/api/landing-pages'
      const method = landingPage ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, html }),
      })

      if (res.ok) {
        onSave()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save landing page')
      }
    } catch (error) {
      console.error('Failed to save landing page:', error)
      alert('Failed to save landing page')
    } finally {
      setLoading(false)
    }
  }

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
              {landingPage ? 'Edit Landing Page' : 'New Landing Page'}
            </h2>
            <p className="text-sm text-muted mt-1">Create a phishing landing page</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Code' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Landing Page'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Page Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Landing Page Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                placeholder="e.g., Account Verification Page"
              />
            </div>
            <div className="p-3 rounded-lg bg-surface-muted">
              <p className="text-xs font-semibold text-foreground mb-2">Tips:</p>
              <ul className="text-xs text-muted space-y-1">
                <li>• Design realistic-looking forms</li>
                <li>• Include tracking pixels</li>
                <li>• Add educational warnings</li>
                <li>• Test on mobile devices</li>
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
              <div className="border border-border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={html}
                  className="w-full h-[600px] border-0"
                  title="Landing Page Preview"
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

