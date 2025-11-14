'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Play, Pause, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/context/preferences-context'
import type { Locale } from '@/lib/i18n/config'

type LocaleValue = {
  en: string
  ar: string
}

type Character = {
  id: string
  name: LocaleValue
  avatar: string // يمكن استخدام emoji أو رابط صورة
  description: LocaleValue
  theme: string
}

type Dialogue = {
  speaker: string
  text: LocaleValue
}

type Choice = {
  id: string
  text: LocaleValue
  nextScene: string
}

type Scene = {
  id: string
  title: LocaleValue
  dialogues: Dialogue[]
  choices?: Choice[]
  background: string
  isEnd?: boolean
  lesson?: LocaleValue
}

const characters: Character[] = [
  {
    id: 'mohammed',
    name: { en: 'Mohammed', ar: 'محمد' },
    avatar: '👨‍💻',
    description: { en: 'A university student who needs your help', ar: 'طالب جامعي يحتاج مساعدتك' },
    theme: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(96,165,250,0.25))'
  },
  {
    id: 'salem',
    name: { en: 'Salem', ar: 'سالم' },
    avatar: '🧑‍🎓',
    description: { en: 'A smart friend who is always cautious', ar: 'صديق ذكي دائماً حذر' },
    theme: 'linear-gradient(135deg, rgba(34,197,94,0.35), rgba(16,185,129,0.25))'
  }
]

const getLocaleText = (value: LocaleValue, locale: Locale) => value[locale]

export function FullscreenGame({ onClose }: { onClose: () => void }) {
  const { locale } = usePreferences()
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [currentScene, setCurrentScene] = useState<string>('start')
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({})
  const [musicOn, setMusicOn] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Fullscreen logic
  useEffect(() => {
    if (selectedCharacter && containerRef.current) {
      const element = containerRef.current
      if (element.requestFullscreen) {
        element.requestFullscreen().catch(console.error)
      } else if ((element as any).webkitRequestFullscreen) {
        ;(element as any).webkitRequestFullscreen()
      } else if ((element as any).mozRequestFullScreen) {
        ;(element as any).mozRequestFullScreen()
      } else if ((element as any).msRequestFullscreen) {
        ;(element as any).msRequestFullscreen()
      }
    }
  }, [selectedCharacter])

  // Start music when character is selected
  useEffect(() => {
    if (selectedCharacter && !musicOn) {
      startMusic()
    }
  }, [selectedCharacter])

  const startMusic = async () => {
    if (typeof window === 'undefined' || musicOn) return

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx()
    }

    const context = audioContextRef.current
    if (!context) return

    if (context.state === 'suspended') {
      await context.resume()
    }

    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    oscillator.type = 'sawtooth'
    oscillator.frequency.value = 62 // موسيقى متوترة
    gainNode.gain.setValueAtTime(0.0001, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.02, context.currentTime + 1.5)
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start()

    oscillatorRef.current = oscillator
    gainNodeRef.current = gainNode
    setMusicOn(true)
  }

  const stopMusic = () => {
    const context = audioContextRef.current
    const oscillator = oscillatorRef.current
    const gainNode = gainNodeRef.current

    if (context && gainNode) {
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.4)
    }

    if (oscillator) {
      setTimeout(() => {
        oscillator.stop()
        oscillator.disconnect()
        oscillatorRef.current = null
      }, 450)
    }

    gainNodeRef.current = null
    setMusicOn(false)
  }

  useEffect(() => {
    return () => {
      stopMusic()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Scene definitions based on character and choices
  const getScenes = (characterId: string): Record<string, Scene> => {
    const baseScenes: Record<string, Scene> = {
      start: {
        id: 'start',
        title: { en: 'The Message', ar: 'الرسالة' },
        dialogues: [
          {
            speaker: characterId === 'mohammed' ? 'محمد' : 'سالم',
            text: {
              en: characterId === 'mohammed' 
                ? 'Brother, I received a link. I don\'t know what to do with it. What do you think I should do?'
                : 'Hey, I got this strange message. Can you help me figure out if it\'s safe?',
              ar: characterId === 'mohammed'
                ? 'أخي، وصلني رابط. لا أعرف ماذا أفعل به. ماذا تشعر بأنني من المفترض أن أفعل به؟'
                : 'يا أخي، وصلتني رسالة غريبة. تقدر تساعدني أعرف إذا كانت آمنة؟'
            }
          }
        ],
        choices: [
          {
            id: 'choice-open',
            text: { en: 'Open the link immediately', ar: 'أفتح الرابط فوراً' },
            nextScene: 'bad-ending'
          },
          {
            id: 'choice-check',
            text: { en: 'Check the link first', ar: 'أفحص الرابط أولاً' },
            nextScene: 'good-path'
          },
          {
            id: 'choice-ignore',
            text: { en: 'Ignore it for now', ar: 'أتجاهله الآن' },
            nextScene: 'safe-path'
          }
        ],
        background: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.55), rgba(15,23,42,0.95))'
      },
      'good-path': {
        id: 'good-path',
        title: { en: 'Smart Decision', ar: 'قرار ذكي' },
        dialogues: [
          {
            speaker: characterId === 'mohammed' ? 'محمد' : 'سالم',
            text: {
              en: 'Good idea! Let me check the URL... Oh wait, this doesn\'t look right.',
              ar: 'فكرة جيدة! خليني أفحص الرابط... لحظة، هذا ما يبدو صحيح.'
            }
          },
          {
            speaker: 'أنت',
            text: {
              en: 'What did you notice?',
              ar: 'شو لاحظت؟'
            }
          },
          {
            speaker: characterId === 'mohammed' ? 'محمد' : 'سالم',
            text: {
              en: 'The domain has extra words that don\'t belong. It\'s suspicious!',
              ar: 'الدومين فيه كلمات زايدة ما تنتمي. مشبوه!'
            }
          }
        ],
        choices: [
          {
            id: 'choice-report',
            text: { en: 'Report it as phishing', ar: 'أبلغ عنه كتصيد' },
            nextScene: 'lesson'
          },
          {
            id: 'choice-delete',
            text: { en: 'Delete the message', ar: 'أحذف الرسالة' },
            nextScene: 'lesson'
          }
        ],
        background: 'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.4), rgba(15,23,42,0.95))'
      },
      'safe-path': {
        id: 'safe-path',
        title: { en: 'Safe Choice', ar: 'خيار آمن' },
        dialogues: [
          {
            speaker: characterId === 'mohammed' ? 'محمد' : 'سالم',
            text: {
              en: 'You\'re right. When in doubt, it\'s better to wait.',
              ar: 'صحيح. لما تشك، الأفضل تنتظر.'
            }
          },
          {
            speaker: 'أنت',
            text: {
              en: 'Always verify before clicking suspicious links.',
              ar: 'دائماً تحقق قبل ما تضغط على روابط مشبوهة.'
            }
          }
        ],
        background: 'linear-gradient(120deg, rgba(13,148,136,0.4), rgba(56,189,248,0.35))',
        isEnd: true,
        lesson: {
          en: 'When you receive a suspicious link, always verify the sender and check the URL before clicking. When in doubt, wait and ask for help.',
          ar: 'عندما تستقبل رابط مشبوه، دائماً تحقق من المرسل وافحص الرابط قبل الضغط. لما تشك، انتظر واسأل للمساعدة.'
        }
      },
      'bad-ending': {
        id: 'bad-ending',
        title: { en: 'The Trap', ar: 'الفخ' },
        dialogues: [
          {
            speaker: characterId === 'mohammed' ? 'محمد' : 'سالم',
            text: {
              en: 'Oh no! I clicked it and now something strange is happening...',
              ar: 'لا! ضغطت عليه والآن في شيء غريب بيصير...'
            }
          },
          {
            speaker: 'أنت',
            text: {
              en: 'What happened?',
              ar: 'شو صار؟'
            }
          },
          {
            speaker: characterId === 'mohammed' ? 'محمد' : 'سالم',
            text: {
              en: 'It asked for my password! I think I made a mistake...',
              ar: 'طلب مني كلمة المرور! أعتقد إنني غلطت...'
            }
          }
        ],
        background: 'radial-gradient(circle, rgba(220,38,38,0.55), rgba(76,5,25,0.9))',
        isEnd: true,
        lesson: {
          en: 'Never click on suspicious links immediately. Always check the URL, verify the sender, and when in doubt, ask for help. Real organizations never ask for passwords via links.',
          ar: 'لا تضغط على روابط مشبوهة فوراً. دائماً افحص الرابط، تحقق من المرسل، ولما تشك اسأل للمساعدة. الجهات الرسمية ما تطلب كلمات المرور عبر روابط.'
        }
      },
      lesson: {
        id: 'lesson',
        title: { en: 'Lesson Learned', ar: 'الدرس المستفاد' },
        dialogues: [
          {
            speaker: characterId === 'mohammed' ? 'محمد' : 'سالم',
            text: {
              en: 'Thank you for helping me! I learned a lot today.',
              ar: 'شكراً لمساعدتك! تعلمت كثير اليوم.'
            }
          }
        ],
        background: 'linear-gradient(140deg, rgba(125,211,252,0.4), rgba(187,247,208,0.45))',
        isEnd: true,
        lesson: {
          en: 'Always verify suspicious links by checking the URL carefully. Look for misspellings, extra words, or unusual domains. When in doubt, don\'t click and ask for help.',
          ar: 'دائماً تحقق من الروابط المشبوهة بفحص الرابط بعناية. ابحث عن أخطاء إملائية، كلمات زائدة، أو دومينات غير عادية. لما تشك، لا تضغط واسأل للمساعدة.'
        }
      }
    }

    return baseScenes
  }

  const scenes = selectedCharacter ? getScenes(selectedCharacter.id) : {}
  const scene = scenes[currentScene]

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character)
    setCurrentScene('start')
    setDialogueIndex(0)
    setIsPlaying(true)
  }

  const handleChoice = (choice: Choice) => {
    setSelectedChoices(prev => ({ ...prev, [currentScene]: choice.id }))
    // Wait a moment before transitioning to next scene for smooth effect
    setTimeout(() => {
      setCurrentScene(choice.nextScene)
      setDialogueIndex(0)
      setIsPlaying(true)
    }, 500)
  }

  const handleNextDialogue = () => {
    if (!scene) return
    
    if (dialogueIndex < scene.dialogues.length - 1) {
      setDialogueIndex(prev => prev + 1)
    } else {
      setIsPlaying(false)
    }
  }

  const handleExitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else if ((document as any).webkitFullscreenElement) {
      await (document as any).webkitExitFullscreen()
    } else if ((document as any).mozFullScreenElement) {
      await (document as any).mozCancelFullScreen()
    } else if ((document as any).msFullscreenElement) {
      await (document as any).msExitFullscreen()
    }
    stopMusic()
    onClose()
  }

  // Auto-play dialogues
  useEffect(() => {
    if (!isPlaying || !scene) return

    const timer = setTimeout(() => {
      if (dialogueIndex < scene.dialogues.length - 1) {
        setDialogueIndex(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isPlaying, dialogueIndex, scene])

  if (!selectedCharacter) {
    return (
      <div 
        ref={containerRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      >
        <div className="text-center space-y-8 px-4">
          <h1 className="text-5xl font-bold text-white mb-4">
            {locale === 'en' ? 'Choose Your Character' : 'اختر شخصيتك'}
          </h1>
          <p className="text-xl text-white/80 mb-8">
            {locale === 'en' 
              ? 'Select a character to start the story'
              : 'اختر شخصية لبدء القصة'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {characters.map((character) => (
              <button
                key={character.id}
                onClick={() => handleCharacterSelect(character)}
                className="relative overflow-hidden rounded-3xl border-2 border-white/20 bg-white/10 p-8 backdrop-blur-sm hover:border-white/40 hover:bg-white/15 transition-all transform hover:scale-105"
                style={{ background: character.theme }}
              >
                <div className="text-8xl mb-4">{character.avatar}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {getLocaleText(character.name, locale)}
                </h2>
                <p className="text-white/80">
                  {getLocaleText(character.description, locale)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!scene) return null

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      style={{ background: scene.background }}
    >
      {/* Exit button */}
      <button
        onClick={handleExitFullscreen}
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Music control */}
      <button
        onClick={musicOn ? stopMusic : startMusic}
        className="absolute top-4 left-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
      >
        {musicOn ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
        {/* Scene title */}
        <h2 className="text-4xl font-bold text-white text-center">
          {getLocaleText(scene.title, locale)}
        </h2>

        {/* Dialogues */}
        <div className="max-w-3xl w-full space-y-4">
          {scene.dialogues.slice(0, dialogueIndex + 1).map((dialogue, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/30 bg-black/30 backdrop-blur-sm p-6 text-white animate-fade-in"
            >
              <p className="text-sm uppercase tracking-wider text-white/60 mb-2">
                {dialogue.speaker}
              </p>
              <p className="text-lg leading-relaxed">
                {getLocaleText(dialogue.text, locale)}
              </p>
            </div>
          ))}
        </div>

        {/* Choices - only show after all dialogues are shown */}
        {!isPlaying && scene.choices && scene.choices.length > 0 && dialogueIndex >= scene.dialogues.length - 1 && (
          <div className="max-w-3xl w-full space-y-4 animate-fade-in">
            <h3 className="text-2xl font-bold text-white text-center mb-4">
              {locale === 'en' ? 'What will you do?' : 'ماذا ستفعل؟'}
            </h3>
            {scene.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                className="w-full rounded-2xl border-2 border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-6 text-white text-left transition-all transform hover:scale-105"
              >
                <p className="text-lg font-semibold">
                  {getLocaleText(choice.text, locale)}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Lesson at the end - only show after all dialogues */}
        {scene.isEnd && scene.lesson && !isPlaying && dialogueIndex >= scene.dialogues.length - 1 && (
          <div className="max-w-3xl w-full rounded-2xl border-2 border-yellow-400/50 bg-yellow-500/20 backdrop-blur-sm p-8 text-white animate-fade-in">
            <h3 className="text-2xl font-bold mb-4 text-center">
              {locale === 'en' ? '💡 Lesson Learned' : '💡 الدرس المستفاد'}
            </h3>
            <p className="text-lg leading-relaxed text-center">
              {getLocaleText(scene.lesson, locale)}
            </p>
            <div className="mt-6 text-center">
              <Button
                onClick={handleExitFullscreen}
                className="bg-white text-black hover:bg-white/90"
              >
                {locale === 'en' ? 'Finish' : 'إنهاء'}
              </Button>
            </div>
          </div>
        )}

        {/* Next dialogue button */}
        {isPlaying && dialogueIndex < scene.dialogues.length - 1 && (
          <Button
            onClick={handleNextDialogue}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            {locale === 'en' ? 'Next' : 'التالي'}
          </Button>
        )}
      </div>
    </div>
  )
}

