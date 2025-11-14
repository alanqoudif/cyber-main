'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BookOpenCheck,
  BrainCircuit,
  Compass,
  LockKeyhole,
  LucideIcon,
  Pause,
  Play,
  Radio,
  Scan,
  ShieldHalf,
  Sparkles,
  Target,
  Trophy,
  Users,
  Waves
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StageBlueprint {
  id: string
  title: string
  tagline: string
  description: string
  scenes: { title: string; detail: string }[]
  icon: LucideIcon
}

interface ScenarioCard {
  id: string
  title: string
  dossier: string
  hint: string
  answer: string
  options: { id: string; label: string; impact: string }[]
}

interface ClueNode {
  id: string
  title: string
  clue: string
  fix: string
  mood: 'CALM' | 'MEDIUM' | 'CRITICAL'
}

type MissionRequirement =
  | { type: 'stage'; id: string }
  | { type: 'scenario'; id: string }
  | { type: 'clue'; id: string }
  | { type: 'cipher' }

interface CrewMember {
  id: string
  name: string
  role: string
  bio: string
  focus: string
  icon: LucideIcon
}

interface MissionLevel {
  id: string
  title: string
  description: string
  reward: string
  requires: MissionRequirement[]
  icon: LucideIcon
}

const stageBlueprints: StageBlueprint[] = [
  {
    id: 'intro-call',
    title: 'المشهد الأول: المكالمة المفاجئة',
    tagline: 'قصة تبدأ برسالة صوتية قصيرة',
    description:
      'أنت الموظف الجديد الذي يتلقى مكالمة تقول: «شبكة الشركة تتعرض للعبث». لا يوجد مصطلحات معقدة، فقط أحداث تشبه يوم العمل العادي. مهمتك أن تسأل وتلاحظ قبل أن تتسرع.',
    scenes: [
      {
        title: 'خطوات التثبيت',
        detail: 'افتح البريد، استمع للمكالمة، واكتب ما شد انتباهك. لا تبحث عن كلمات تقنية، ركّز على الشعور.'
      },
      {
        title: 'تحديد البطل',
        detail: 'اختر شخصية تمثلك: مراقب هادئ أو فضولي سريع الرد. هذا يحدد كيف نحكي القصة لك.'
      }
    ],
    icon: BrainCircuit
  },
  {
    id: 'city-lights',
    title: 'المشهد الثاني: المدينة المضيئة',
    tagline: 'ثلاث لقطات من شاشتك ورسائلك اليومية',
    description:
      'تتابع يومك كالمعتاد: بريد، رسالة من تطبيق المحادثة، وموقع داخلي. فجأة تتغير التفاصيل الصغيرة. هل هو مجرد خطأ؟ كل لقطة تخبر جزءاً من القصة.',
    scenes: [
      {
        title: 'البريد المنتظر',
        detail: 'صديقك يرسل رابط احتفال الشركة. اللعبة تعرض صورته وشعاره، وأنت تقرر هل هو حقيقي.'
      },
      {
        title: 'نافذة التنبيهات',
        detail: 'يظهر إشعار يطلب كلمة المرور. اقرأ النص بصوت عالٍ وشاهد إن كان منطقي.'
      }
    ],
    icon: Scan
  },
  {
    id: 'secret-alley',
    title: 'المشهد الثالث: الحارة السرية',
    tagline: 'اللاعب يدخل التحدي الحقيقي',
    description:
      'بعد فهم الإشارات، تدخل إلى الحارة السرية حيث نخفي ثلاثة أسرار بسيطة. كل سر يشرح موقفاً من الحياة اليومية مثل USB مفقود أو طلب صيانة مزيف.',
    scenes: [
      {
        title: 'صندوق البريد القديم',
        detail: 'تستعيد بريداً قديماً وتشاهد الفرق بينه وبين البريد المزيف.'
      },
      {
        title: 'خريطة الممرات',
        detail: 'ثلاث نقاط على الخريطة، واحدة منها فقط آمنة. اختَر لتتابع القصة.'
      }
    ],
    icon: ShieldHalf
  },
  {
    id: 'council-room',
    title: 'المشهد الرابع: مجلس سايبرس',
    tagline: 'الحوار الأخير مع ليان وفريقها',
    description:
      'بعد فتح الأدلة والسيناريوهات، تنضم إلى مجلس حماة سايبرس حيث تشرح ما تعلّمته لمازن ويظهر الظل ليحاول إرباكك برسالة أخيرة. تختار كيف تهدئ الفريق بينما تنهي القصة.',
    scenes: [
      {
        title: 'حوار الفريق',
        detail: 'تشارك مازن النقاط الثلاث التي حفظت الفريق من الهجمات، وتقرر من يقود الجلسة القادمة.'
      },
      {
        title: 'المواجهـة',
        detail: 'الظل يرسل رابطاً جديداً، وتختار ما إذا كنت ستبلغ فوراً أو تراقب لتحليل مصدره.'
      }
    ],
    icon: Target
  }
]

const scenarioDeck: ScenarioCard[] = [
  {
    id: 'mail-party',
    title: 'رسالة الحفل المفاجئ',
    dossier: 'يصل بريد منسوب لمديرك يدعوك لحفل خاص. الرابط يبدو صحيحاً، لكن الخطأ الوحيد هو أن الحفل غداً بينما المدير مسافر.',
    hint: 'انظر إلى اسم المرسل بالكامل، ولاحظ كيف يضغط عليك الوقت.',
    answer: 'check',
    options: [
      { id: 'click', label: 'أضغط الرابط فوراً', impact: 'القصة تذهب لاتجاه سيء، وتتعلم متأخراً' },
      { id: 'share', label: 'أرسل البريد لقروب الزملاء', impact: 'يزداد الارتباك ولا أحد يعرف المصدر' },
      { id: 'check', label: 'تأكد من البريد عبر اتصال حقيقي', impact: 'تكتشف أن الرابط مزيف وتُنقذ الفريق' }
    ]
  },
  {
    id: 'chat-nudge',
    title: 'رسالة الدردشة الملونة',
    dossier:
      'في تطبيق المحادثة يظهر شخص يقول إنه من الدعم ويطلب منك مشاركة رمز الدخول الآن. الصورة الرمزية تبدو مألوفة، لكن الاسم ينقصه حرف.',
    hint: 'هل طلبوا شيئاً شخصياً؟ وهل كتبوا اسمك بطريقة صحيحة؟',
    answer: 'slow',
    options: [
      { id: 'give', label: 'أرسل الرمز حتى ينتهي بسرعة', impact: 'الشخصية الغامضة تسرق حسابك داخل القصة' },
      { id: 'slow', label: 'اطلب مكالمة رسمية أو بطاقة عمل', impact: 'يتضح أنه منتحل ويتراجع فوراً' },
      { id: 'ignore', label: 'تتجاهل الدردشة بدون توثيق', impact: 'تضيع فرصة التحذير لبقية الفريق' }
    ]
  },
  {
    id: 'usb-story',
    title: 'الذاكرة الصغيرة',
    dossier: 'تجد USB بجوار مقعدك مكتوب عليه «صور التدريب». هل تأخذه إلى المنزل؟ هل تخبر الأمن؟ اللعبة تتركك تختار.',
    hint: 'تذكّر أن أي ملف مجهول يمكن فتحه في مساحة آمنة أولاً.',
    answer: 'lab',
    options: [
      { id: 'home', label: 'أفتحه في المنزل بدافع الفضول', impact: 'القصة تُظهر انتشار ملف غامض لجهازك' },
      { id: 'trash', label: 'أرميه في القمامة فوراً', impact: 'لن نتعلم ماذا فيه، وتبقى القصة ناقصة' },
      { id: 'lab', label: 'أبلغ الفريق ليختبره في مختبر آمن', impact: 'نعرف الحقيقة بدون أضرار وتكسب نقطة بطل' }
    ]
  },
  {
    id: 'social-glow',
    title: 'المنشور المتلألئ',
    dossier:
      'في منصة الشركة الداخلية ينتشر منشور بخصم خاص لمن يدخل بياناته خلال ساعة. الصورة شعار الشركة لكن الحساب غير موثّق.',
    hint: 'هل الحساب يحمل علامة رسمية؟ وهل المنصة تطلب تسجيل دخول في نفس الصفحة؟',
    answer: 'verify',
    options: [
      { id: 'repost', label: 'أعيد نشر العرض للجميع', impact: 'يتعرض زملاؤك لنفس الخدعة ويتضاعف الضرر' },
      { id: 'verify', label: 'أتحقق من الحساب الرسمي أولاً', impact: 'تكتشف أنه منتحل وتنقذ الحملة' },
      { id: 'message', label: 'أرسل بياناتي في الخاص', impact: 'الظل يحصل على صلاحيات إضافية في القصة' }
    ]
  },
  {
    id: 'voice-rush',
    title: 'المكالمة السريعة',
    dossier: 'يتصل بك شخص متوتر يدعي أنه من البنك ويطلب رمز التحقق فوراً بحجة أن هناك سحباً مشبوهاً.',
    hint: 'البنوك لا تطلب الأرقام الكاملة عبر الهاتف. اطلب قناة رسمية.',
    answer: 'delay',
    options: [
      { id: 'comply', label: 'أعطيه الرمز الكامل بسرعة', impact: 'خسرت أمانك وتعلمت الدرس بطريقة صعبة' },
      { id: 'delay', label: 'أطلب التواصل عبر الرقم الرسمي', impact: 'ينقطع الاتصال لأنه كان منتحلاً' },
      { id: 'block', label: 'أغلق المكالمة دون توثيق', impact: 'تفقد القدرة على تحذير بقية الفريق' }
    ]
  }
]

const crewMembers: CrewMember[] = [
  {
    id: 'lian',
    name: 'ليان',
    role: 'قائدة حماة سايبرس',
    bio: 'تعطيك المهام واحدة تلو الأخرى بلغة بسيطة وتطلب منك إخبارها بالملاحظات الغريبة.',
    focus: 'قراءة التفاصيل الصغيرة',
    icon: ShieldHalf
  },
  {
    id: 'mazen',
    name: 'مازن',
    role: 'المتدرّب المتحمس',
    bio: 'يندفع بسرعة ويحتاج من يذكره بأن يلتقط أنفاسه قبل أن يضغط على أي رابط.',
    focus: 'تبطيء الإيقاع قبل القرار',
    icon: Compass
  },
  {
    id: 'shadow',
    name: 'الظل',
    role: 'الخصم الذكي',
    bio: 'لا يظهر بوضوح، بل يحاول تقليد زملائك ليخدعك. كل مرة تكشفه تسقط قطعة من قصته.',
    focus: 'كشف الإشارات المزيفة',
    icon: AlertTriangle
  }
]

const clueNodes: ClueNode[] = [
  {
    id: 'badge-clue',
    title: 'بطاقة الدخول اللامعة',
    clue: 'صورة البطاقة في البريد تختلف عن بطاقتك الحقيقية، اللون باهت والاسم ناقص.',
    fix: 'اطلب البطاقة الأصلية من الموارد البشرية وتجاهل الرابط المزيف.',
    mood: 'MEDIUM'
  },
  {
    id: 'timer-clue',
    title: 'مؤقت العد التنازلي',
    clue: 'العد التنازلي في البريد لا يتطابق مع توقيت الحفل في التقويم الرسمي.',
    fix: 'افتح التقويم الرسمي أو اسأل منظم الفعالية قبل أن تضغط أي شيء.',
    mood: 'CALM'
  },
  {
    id: 'voice-clue',
    title: 'المكالمة المكررة',
    clue: 'التسجيل يعيد نفس الجملة مرتين وكأنه روبوت، وهذا ما جعلها تبدو غريبة.',
    fix: 'أبلغ مسؤول التقنية ليسجلوا الصوت ويغلقوا الرقم المزيف.',
    mood: 'CRITICAL'
  }
]

const missionLevels: MissionLevel[] = [
  {
    id: 'briefing',
    title: 'المستوى ١: الإحاطة',
    description: 'استمع لليان في المكالمة الأولى وافهم سبب القلق دون مصطلحات ثقيلة.',
    reward: 'تفهم لغة الفريق وتبدأ القصة بثقة.',
    requires: [{ type: 'stage', id: 'intro-call' }],
    icon: BookOpenCheck
  },
  {
    id: 'signals',
    title: 'المستوى ٢: إشارات المدينة',
    description: 'تحلل البريد والرسائل داخل «المدينة المضيئة» وتختار القرار السليم.',
    reward: 'تحصل على بطاقة مراقب رسمي داخل القصة.',
    requires: [
      { type: 'stage', id: 'city-lights' },
      { type: 'scenario', id: 'mail-party' }
    ],
    icon: Compass
  },
  {
    id: 'investigation',
    title: 'المستوى ٣: غرفة الأدلة',
    description: 'تساعد مازن في كشف الرسائل المزيفة وتفتح أدلة الغرفة السرية.',
    reward: 'تسيطر على الحارة السرية وتعرف حيل الظل.',
    requires: [
      { type: 'scenario', id: 'chat-nudge' },
      { type: 'scenario', id: 'social-glow' },
      { type: 'clue', id: 'badge-clue' }
    ],
    icon: LockKeyhole
  },
  {
    id: 'finale',
    title: 'المستوى ٤: ختم القصة',
    description: 'تفك الشفرة النهائية لتعلن اسم المهاجم أمام المجلس.',
    reward: 'تتسلم درع التحدي وتغلق الحلقة التدريبية.',
    requires: [{ type: 'cipher' }],
    icon: Trophy
  }
]

const cipherSolution = 'NOVA-17'

interface CyberSecurityGameProps {
  traineeName?: string | null
}

export function CyberSecurityGame({ traineeName }: CyberSecurityGameProps) {
  const [activeStage, setActiveStage] = useState(stageBlueprints[0].id)
  const [experienceLog, setExperienceLog] = useState<string[]>([
    'الراوي: ' + (traineeName || 'ضيفنا') + ' دخل القصة ويستعد للمشهد الأول.'
  ])
  const [selectedCrew, setSelectedCrew] = useState<string>(crewMembers[0].id)
  const [scenarioStatus, setScenarioStatus] = useState<Record<string, 'idle' | 'success' | 'error'>>(() => {
    const initial: Record<string, 'idle' | 'success' | 'error'> = {}
    scenarioDeck.forEach((scenario) => {
      initial[scenario.id] = 'idle'
    })
    return initial
  })
  const [revealedNodes, setRevealedNodes] = useState<Record<string, boolean>>({})
  const [progressMap, setProgressMap] = useState<Record<string, boolean>>(() => ({
    [`stage-${stageBlueprints[0].id}`]: true
  }))
  const [cipherAttempt, setCipherAttempt] = useState('')
  const [cipherState, setCipherState] = useState<'idle' | 'success' | 'error'>('idle')
  const [musicOn, setMusicOn] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const focusedCrewMember = useMemo(() => crewMembers.find((crew) => crew.id === selectedCrew) ?? crewMembers[0], [selectedCrew])
  const completedPoints = useMemo(() => Object.keys(progressMap).length, [progressMap])
  const personaBonusPoints = 1
  const maxPoints = scenarioDeck.length + clueNodes.length + stageBlueprints.length + personaBonusPoints + 1
  const masteryPercent = Math.min(100, Math.round((completedPoints / maxPoints) * 100))
  const currentStage = stageBlueprints.find((stage) => stage.id === activeStage) ?? stageBlueprints[0]
  const missionStatuses = useMemo(() => {
    const statusMap: Record<string, 'locked' | 'in-progress' | 'done'> = {}
    const hasRequirement = (requirement: MissionRequirement): boolean => {
      if (requirement.type === 'cipher') {
        return Boolean(progressMap['cipher'])
      }
      if (requirement.type === 'stage') {
        return Boolean(progressMap[`stage-${requirement.id}`])
      }
      if (requirement.type === 'scenario') {
        return Boolean(progressMap[`scenario-${requirement.id}`])
      }
      if (requirement.type === 'clue') {
        return Boolean(progressMap[`node-${requirement.id}`])
      }
      return false
    }

    missionLevels.forEach((mission) => {
      const flags = mission.requires.map((requirement) => hasRequirement(requirement))
      const isDone = flags.every(Boolean)
      const partial = flags.some(Boolean)
      statusMap[mission.id] = isDone ? 'done' : partial ? 'in-progress' : 'locked'
    })

    return statusMap
  }, [progressMap])

  const pushLog = (message: string) => {
    const formatter = new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    const stamp = formatter.format(new Date())
    setExperienceLog((prev) => {
      const next = [`${stamp} — ${message}`, ...prev]
      return next.slice(0, 10)
    })
  }

  const registerProgress = (key: string) => {
    setProgressMap((prev) => {
      if (prev[key]) {
        return prev
      }
      return { ...prev, [key]: true }
    })
  }

  const handleCrewSelect = (crewId: string) => {
    setSelectedCrew(crewId)
    registerProgress('persona-selected')
    const crew = crewMembers.find((member) => member.id === crewId)
    if (crew) {
      pushLog(`اخترت العمل مع ${crew.name} وستستقبل القصة من زاويته.`)
    }
  }

  const handleStageSwitch = (stageId: string) => {
    setActiveStage(stageId)
    const blueprint = stageBlueprints.find((stage) => stage.id === stageId)
    if (blueprint) {
      pushLog(`انتقلت القصة إلى «${blueprint.title}»`)
      registerProgress(`stage-${stageId}`)
    }
  }

  const handleScenarioChoice = (scenarioId: string, optionId: string) => {
    const scenario = scenarioDeck.find((entry) => entry.id === scenarioId)
    if (!scenario) {
      return
    }

    setScenarioStatus((prev) => {
      if (prev[scenarioId] === 'success') {
        return prev
      }

      const isCorrect = optionId === scenario.answer
      const updated: Record<string, 'idle' | 'success' | 'error'> = { ...prev }
      updated[scenarioId] = isCorrect ? 'success' : 'error'

      if (isCorrect) {
        registerProgress(`scenario-${scenarioId}`)
        pushLog(`خيار موفق في «${scenario.title}»؛ القصة تستمر بأمان.`)
      } else {
        pushLog(`الخيار لا يساعد القصة في «${scenario.title}»، حاول فكرة أبسط.`)
      }

      return updated
    })
  }

  const handleRevealNode = (nodeId: string, title: string) => {
    setRevealedNodes((prev) => {
      if (prev[nodeId]) {
        return prev
      }
      registerProgress(`node-${nodeId}`)
      pushLog(`تم فتح دليل جديد: «${title}» سيقودك للخطوة التالية.`)
      return { ...prev, [nodeId]: true }
    })
  }

  const handleCipherSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cipherAttempt.trim()) {
      return
    }

    const normalizedAttempt = cipherAttempt.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    const normalizedSolution = cipherSolution.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

    if (normalizedAttempt === normalizedSolution) {
      setCipherState('success')
      registerProgress('cipher')
      pushLog('تم فك الشفرة بسهولة، والباب السري انفتح.')
    } else {
      setCipherState('error')
      pushLog('الكود ليس صحيحاً بعد، تذكّر تفاصيل القصة والعَدّات المخفية.')
    }
  }

  const startMusic = async () => {
    if (typeof window === 'undefined' || musicOn) {
      return
    }

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) {
      pushLog('متصفحك لا يشغّل الأجواء الصوتية، لكن يمكنك متابعة القصة بصمت.')
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx()
    }

    const context = audioContextRef.current
    if (!context) {
      return
    }

    if (context.state === 'suspended') {
      await context.resume()
    }

    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    oscillator.type = 'sawtooth'
    oscillator.frequency.value = 62
    gainNode.gain.setValueAtTime(0.0001, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.02, context.currentTime + 1.5)
    oscillator.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start()

    oscillatorRef.current = oscillator
    gainNodeRef.current = gainNode
    setMusicOn(true)
    pushLog('بدأت الموسيقى المشوقة، تخيّل أنك في غرفة تحقيق سينمائية.')
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
    pushLog('أطفأنا الموسيقى، خذ نفساً عميقاً قبل القرار التالي.')
  }

  useEffect(() => {
    return () => {
      stopMusic()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-10 shadow-lg">
        <div className="lab-gradient" />
        <div className="lab-constellation" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="eyebrow">CYBER EXPERIENCE</div>
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">قصة الأمن التفاعلية</h1>
            <p className="text-muted text-lg leading-relaxed">
              الفكرة بسيطة: ندخلك في قصة قصيرة من ثلاث لقطات. تقرأ بريد، ترد على رسالة، وتستكشف غرضاً مفقوداً. كل مرة تختار فيها، نفهم
              كيف تفكر ونرجع لك تنبيهاً سهل الفهم. لا تحتاج معرفة تقنية؛ فقط تخيل أنك بطل الفيلم وتحمي فريقك بخطوات طبيعية.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => handleStageSwitch('intro-call')}>ابدأ من المشهد الأول</Button>
              <Button variant="ghost" onClick={() => handleStageSwitch('secret-alley')}>
                أريد القفز للنهاية
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">مؤشر التقدم</p>
                <p className="text-3xl font-bold text-foreground">{masteryPercent}%</p>
              </div>
              <Sparkles className="h-10 w-10 text-accent" />
            </div>
            <div className="mt-4 h-2 rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft"
                style={{ width: `${masteryPercent}%` }}
              />
            </div>
            <p className="mt-4 text-sm text-muted">
              كل اختيار صحيح يفتح لك مشهداً جديداً أو دليل قصة إضافياً. اجمعها كلها لتستلم دعوة التحدي الكامل قبل الدورة.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {stageBlueprints.map((stage) => (
                <div
                  key={stage.id}
                  className={`rounded-xl border p-3 text-sm ${
                    activeStage === stage.id ? 'border-accent bg-accent/5' : 'border-border bg-surface'
                  }`}
                >
                  <p className="font-semibold text-foreground">{stage.title}</p>
                  <p className="text-muted">{stage.tagline}</p>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">الشخصيات التفاعلية</p>
              <h2 className="text-2xl font-bold text-foreground">فريق حماة سايبرس</h2>
              <p className="text-muted">
                اختر البطل الذي تود أن يحكي لك القصة. الآن تتبع {focusedCrewMember.name} الذي يركز على{' '}
                {focusedCrewMember.focus}.
              </p>
            </div>
            <Users className="h-10 w-10 text-accent" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {crewMembers.map((member) => (
              <div
                key={member.id}
                className={`flex flex-col gap-3 rounded-2xl border p-4 ${
                  member.id === selectedCrew ? 'border-accent bg-accent/5 shadow-md' : 'border-border bg-surface-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-background/80 p-2">
                    <member.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{member.name}</p>
                    <p className="text-sm text-muted">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted">{member.bio}</p>
                <p className="text-xs font-semibold text-foreground">قوته: {member.focus}</p>
                <Button
                  variant={member.id === selectedCrew ? 'secondary' : 'outline'}
                  onClick={() => handleCrewSelect(member.id)}
                >
                  {member.id === selectedCrew ? 'الشخصية الحالية' : `اختر ${member.name}`}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">خريطة المستويات</p>
              <h2 className="text-2xl font-bold text-foreground">مسار سايبرس</h2>
              <p className="text-muted">اتبع التقدم من الإحاطة الأولى حتى كشف الشفرة.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {missionLevels.map((mission, index) => {
              const status = missionStatuses[mission.id] ?? 'locked'
              const statusLabel =
                status === 'done' ? 'مكتمل' : status === 'in-progress' ? 'قيد اللعب' : 'غير مفتوح بعد'
              const statusColor =
                status === 'done' ? 'text-green-600' : status === 'in-progress' ? 'text-amber-500' : 'text-muted'
              const barWidth = status === 'done' ? '100%' : status === 'in-progress' ? '60%' : '20%'
              const barColor =
                status === 'done'
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : status === 'in-progress'
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500'
                    : 'bg-border'

              return (
                <div key={mission.id} className="rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-surface-muted p-2">
                        <mission.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted">Level {index + 1}</p>
                        <p className="text-lg font-semibold text-foreground">{mission.title}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{mission.description}</p>
                  <p className="mt-2 text-xs font-semibold text-foreground">الجائزة: {mission.reward}</p>
                  <div className="mt-4 h-2 rounded-full bg-surface-muted">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: barWidth }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">المرحلة النشطة</p>
              <h2 className="text-2xl font-bold text-foreground">{currentStage.title}</h2>
              <p className="text-muted">{currentStage.tagline}</p>
            </div>
            <currentStage.icon className="h-10 w-10 text-accent" />
          </div>
          <p className="mt-4 text-muted leading-relaxed">{currentStage.description}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {currentStage.scenes.map((scene) => (
              <div key={scene.title} className="rounded-2xl border border-border/60 bg-surface-muted p-4">
                <p className="text-sm text-muted">لقطة من القصة</p>
                <p className="text-lg font-semibold text-foreground">{scene.title}</p>
                <p className="text-sm text-muted mt-2">{scene.detail}</p>
                <Button
                  className="mt-4 w-full"
                  variant="secondary"
                  onClick={() => pushLog(`شاهدت لقطة «${scene.title}» ضمن ${currentStage.title}`)}
                >
                  عِش المشهد
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {stageBlueprints.map((stage) => (
              <Button
                key={stage.id}
                variant={stage.id === activeStage ? 'primary' : 'outline'}
                onClick={() => handleStageSwitch(stage.id)}
              >
                {stage.title}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-gradient-to-br from-[#060b1a] to-[#0a1c32] p-6 text-white shadow-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-teal-300">قلب القصة</p>
          <h3 className="mt-3 text-2xl font-semibold">صوت الأجواء السينمائية</h3>
          <p className="mt-3 text-sm text-white/70">
            موسيقى خفيفة لكنها متوترة. عندما تشغلها تشعر أن المشهد حقيقي وكأنك في فيلم تحقيق سريع الوتيرة.
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Mood</p>
                <p className="text-lg font-semibold">{musicOn ? 'متوتر / مركز' : 'هادئ قبل العاصفة'}</p>
              </div>
              <Waves className="h-8 w-8 text-teal-200" />
            </div>
            <div className="mt-4 flex gap-3">
              <Button className="flex-1" onClick={musicOn ? stopMusic : startMusic}>
                {musicOn ? (
                  <>
                    <Pause className="h-4 w-4" /> إيقاف النبض
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> تشغيل النبض
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-white hover:bg-white/10"
                onClick={() => pushLog('إعادة ضبط الإحساس السمعي.')}
              >
                إعادة ضبط
              </Button>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm text-white/70">
            <p className="flex items-center gap-2">
              <Radio className="h-4 w-4" /> كلما تفاعلت مع الصوت، نحكي لك السيناريو التالي بطريقة تناسبك.
            </p>
            <p className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> تغير الإيقاع يعني أن القصة قدمت لك تلميحاً جديداً.
            </p>
            <p className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> إذا سكت الصوت فهذا يعني أنك اتخذت خياراً أنقذ بقية الفريق.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">ثلاث لقطات</p>
              <h3 className="text-2xl font-semibold text-foreground">اختيارات بطل القصة</h3>
              <p className="text-muted">اقرأ القصة القصيرة ثم اضغط الاختيار الذي تراه طبيعياً في حياتك اليومية.</p>
            </div>
            <Compass className="h-10 w-10 text-accent" />
          </div>
          <div className="mt-6 space-y-4">
            {scenarioDeck.map((scenario) => (
              <div key={scenario.id} className="rounded-2xl border border-border/70 bg-surface-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted">Story</p>
                    <p className="text-lg font-semibold text-foreground">{scenario.title}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      scenarioStatus[scenario.id] === 'success'
                        ? 'text-green-600'
                        : scenarioStatus[scenario.id] === 'error'
                          ? 'text-amber-500'
                          : 'text-muted'
                    }`}
                  >
                    {scenarioStatus[scenario.id] === 'success'
                      ? 'قرار رائع'
                      : scenarioStatus[scenario.id] === 'error'
                        ? 'جرب إجابة مختلفة'
                        : 'بانتظار دورك'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{scenario.dossier}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">تلميح: {scenario.hint}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {scenario.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleScenarioChoice(scenario.id, option.id)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        scenarioStatus[scenario.id] === 'success' && option.id === scenario.answer
                          ? 'border-green-500 bg-green-500/10 text-green-700'
                          : 'border-border bg-white hover:border-accent'
                      }`}
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-muted">{option.impact}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">أدلة القصة</p>
              <h3 className="text-2xl font-semibold text-foreground">غرفة الأدلة المخفية</h3>
              <p className="text-muted">اضغط على كل بطاقة لتتعرف على الخدعة وكيفية التعامل معها بأسلوب بسيط.</p>
            </div>
            <LockKeyhole className="h-10 w-10 text-accent" />
          </div>
          <div className="mt-6 space-y-4">
            {clueNodes.map((node) => (
              <div key={node.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-foreground">{node.title}</p>
                  <span
                    className={`text-xs font-bold ${
                      node.mood === 'CRITICAL'
                        ? 'text-red-600'
                        : node.mood === 'MEDIUM'
                          ? 'text-amber-500'
                          : 'text-green-600'
                    }`}
                  >
                    {node.mood === 'CRITICAL' ? 'حرج' : node.mood === 'MEDIUM' ? 'متوسط' : 'هادئ'}
                  </span>
                </div>
                <p className="text-sm text-muted">{node.clue}</p>
                {revealedNodes[node.id] ? (
                  <div className="mt-3 rounded-xl bg-surface-muted p-3 text-sm text-foreground">
                    الحل: {node.fix}
                  </div>
                ) : (
                  <Button className="mt-3" variant="secondary" onClick={() => handleRevealNode(node.id, node.title)}>
                    اكشف الحل
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr]">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">باب النهاية</p>
              <h3 className="text-2xl font-semibold text-foreground">لغز الكلمة السرية</h3>
              <p className="text-muted">الأرقام المخبأة في القصة تعطي رمزاً بسيطاً. اكتب ما تعتقد أنه صحيح وجرب حظك.</p>
            </div>
            <Target className="h-10 w-10 text-accent" />
          </div>
          <form onSubmit={handleCipherSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              className="w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-lg font-semibold text-foreground focus:border-accent focus:outline-none"
              placeholder="اكتب الشفرة هنا"
              value={cipherAttempt}
              onChange={(event) => setCipherAttempt(event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit">تأكيد الشفرة</Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCipherAttempt('')
                  setCipherState('idle')
                  pushLog('أعدنا كتابة الصفحة، جرّب كلمة مختلفة.')
                }}
              >
                امسح المحاولة
              </Button>
            </div>
            {cipherState === 'success' && <p className="text-sm font-semibold text-green-600">تم فك الشفرة! لقد فتحت باب الدورة المتقدمة.</p>}
            {cipherState === 'error' && <p className="text-sm font-semibold text-red-500">الكلمة لا تطابق القصة بعد، فكر في التفاصيل الصغيرة.</p>}
          </form>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg">
          <p className="text-sm text-muted">سجل المختبر</p>
          <h3 className="text-2xl font-semibold text-foreground">وحدة التتبع اللحظي</h3>
          <p className="text-muted">كل قرار يُسجل هنا لتراقب كيف تتطور شخصيتك الدفاعية.</p>
          <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-2">
            {experienceLog.map((entry, index) => (
              <div key={index} className="rounded-2xl border border-border/80 bg-surface-muted px-4 py-3 text-sm text-foreground">
                {entry}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
