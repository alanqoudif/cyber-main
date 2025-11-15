"use client"

import { PlayCircle } from 'lucide-react'
import { usePreferences } from '@/context/preferences-context'
import { LocaleText } from '@/components/common/LocaleText'

const videos = [
  {
    id: '1136961923',
    title: { en: 'Spotting fake links', ar: 'كيفية اكتشاف الرابط المزيف' },
    description: { en: 'Learn how to identify fake links and phishing attempts', ar: 'تعلم كيفية التعرف على الروابط المزيفة والتصيد الاحتيالي' }
  },
  {
    id: '1136961981',
    title: { en: 'How phishing attacks work', ar: 'كيف تعمل هجمات التصيد الاحتيالي' },
    description: { en: 'Understand how phishing works and how to stay safe', ar: 'فهم آلية عمل هجمات التصيد الاحتيالي وكيفية الحماية منها' }
  }
]

export function EducationalVideos() {
  const { locale } = usePreferences()

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-surface to-surface-muted/50 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg bg-blue-500/10 p-2">
          <PlayCircle className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            <LocaleText en="Educational videos" ar="الفيديوهات التعليمية" />
          </h3>
          <p className="text-xs text-muted">
            <LocaleText en="Learn how to shield yourself from phishing" ar="تعلم كيفية حماية نفسك من التصيد الاحتيالي" />
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="space-y-3">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://player.vimeo.com/video/${video.id}?badge=0&autopause=0&player_id=0&app_id=58479&dnt=1&title=0&byline=0&portrait=0`}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                title={video.title.en}
                allowFullScreen
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-1">{video.title[locale]}</h4>
              <p className="text-xs text-muted">{video.description[locale]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


