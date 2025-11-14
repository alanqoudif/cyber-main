'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, ArrowLeft } from 'lucide-react'
import { usePreferences } from '@/context/preferences-context'
import { WhatsAppChat } from '@/components/game/WhatsAppChat'

export function GameClient() {
  const { locale } = usePreferences()
  const [gameStarted, setGameStarted] = useState(false)

  if (gameStarted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-border/50 bg-surface/80 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              {locale === 'en' ? 'Story Mode' : 'طور القصة'}
            </p>
            <p className="text-sm font-semibold">
              {locale === 'en'
                ? 'Live WhatsApp-style phishing scenario'
                : 'سيناريو تصيد مباشر بأسلوب واتساب'}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setGameStarted(false)}
            className="gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === 'en' ? 'Back to intro' : 'رجوع للبداية'}
          </Button>
        </div>
        <WhatsAppChat />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          {locale === 'en' ? 'Cyber Security Game' : 'لعبة الأمن السيبراني'}
        </h1>
        <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
          {locale === 'en'
            ? 'Experience an interactive story where you help characters make the right security decisions'
            : 'عش قصة تفاعلية حيث تساعد الشخصيات على اتخاذ قرارات أمنية صحيحة'}
        </p>
        <Button
          onClick={() => setGameStarted(true)}
          size="lg"
          className="text-lg px-8 py-6"
        >
          <Play className="h-5 w-5 mr-2" />
          {locale === 'en' ? 'Start Game' : 'ابدأ اللعبة'}
        </Button>
      </div>
    </div>
  )
}
