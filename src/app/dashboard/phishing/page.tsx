'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Copy,
  Eye,
  Trash2,
  ExternalLink,
  Users,
  MousePointerClick,
  FileText,
  Link2,
  ArrowLeft,
} from 'lucide-react'

interface PhishingLink {
  id: string
  slug: string
  name: string
  template_type: string
  created_at: string
  visits: number
  submissions_count: number
}

export default function PhishingPage() {
  const router = useRouter()
  const [links, setLinks] = useState<PhishingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLink, setNewLink] = useState({
    name: '',
    slug: '',
    template_type: 'instagram',
  })

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      const res = await fetch('/api/phishing')
      if (res.ok) {
        const data = await res.json()
        setLinks(data.links || [])
      }
    } catch (error) {
      console.error('Failed to load links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLink = async () => {
    if (!newLink.name || !newLink.slug || !newLink.template_type) {
      alert('يرجى ملء جميع الحقول')
      return
    }

    try {
      const res = await fetch('/api/phishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLink),
      })

      if (res.ok) {
        setShowCreateForm(false)
        setNewLink({ name: '', slug: '', template_type: 'instagram' })
        loadLinks()
      } else {
        const data = await res.json()
        alert(data.error || 'فشل إنشاء الرابط')
      }
    } catch (error) {
      console.error('Failed to create link:', error)
      alert('فشل إنشاء الرابط')
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الرابط؟')) return

    try {
      const res = await fetch(`/api/phishing/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        loadLinks()
      } else {
        alert('فشل حذف الرابط')
      }
    } catch (error) {
      console.error('Failed to delete link:', error)
      alert('فشل حذف الرابط')
    }
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/phishing/${slug}`
    navigator.clipboard.writeText(url)
    alert('تم نسخ الرابط!')
  }

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'instagram':
        return '📷'
      case 'google':
        return '🔍'
      case 'facebook':
        return '📘'
      case 'linkedin':
        return '💼'
      case 'twitter':
        return '🐦'
      default:
        return '🔗'
    }
  }

  const getTemplateName = (type: string) => {
    switch (type) {
      case 'instagram':
        return 'Instagram'
      case 'google':
        return 'Google'
      case 'facebook':
        return 'Facebook'
      case 'linkedin':
        return 'LinkedIn'
      case 'twitter':
        return 'Twitter'
      default:
        return 'Generic'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="USER" />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة إلى الداشبورد
            </Button>
            <h1 className="text-3xl font-semibold text-foreground">محاكاة Phishing</h1>
            <p className="text-muted mt-2">
              أنشئ روابط phishing تعليمية لاختبار الوعي الأمني
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            إنشاء رابط جديد
          </Button>
        </div>

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>إنشاء رابط Phishing جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  اسم الرابط *
                </label>
                <input
                  type="text"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="مثال: Instagram 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الرابط (Slug) *
                </label>
                <input
                  type="text"
                  value={newLink.slug}
                  onChange={(e) => setNewLink({ ...newLink, slug: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                  placeholder="مثال: instagram-1"
                />
                <p className="text-xs text-muted mt-1">
                  الرابط سيكون: {window.location.origin}/phishing/{newLink.slug || 'slug'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  نوع القالب *
                </label>
                <select
                  value={newLink.template_type}
                  onChange={(e) => setNewLink({ ...newLink, template_type: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  <option value="instagram">Instagram</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter</option>
                  <option value="generic">Generic</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleCreateLink}>إنشاء الرابط</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted">جاري التحميل...</div>
        ) : links.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Link2 className="h-12 w-12 text-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد روابط بعد</h3>
              <p className="text-muted mb-6">أنشئ رابط phishing جديد للبدء</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                إنشاء رابط جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <Card key={link.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{getTemplateIcon(link.template_type)}</span>
                      {link.name}
                    </CardTitle>
                    <Badge variant="outline">{getTemplateName(link.template_type)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Link2 className="h-4 w-4" />
                    <span className="truncate">/phishing/{link.slug}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 rounded bg-surface-muted">
                      <div className="text-lg font-semibold text-foreground">{link.visits}</div>
                      <div className="text-xs text-muted">زيارات</div>
                    </div>
                    <div className="text-center p-2 rounded bg-surface-muted">
                      <div className="text-lg font-semibold text-foreground">
                        {link.submissions_count}
                      </div>
                      <div className="text-xs text-muted">إدخالات</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(link.slug)}
                      className="flex-1"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      نسخ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/phishing/${link.slug}`)}
                      className="flex-1"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      فتح
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/phishing/${link.id}`)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

