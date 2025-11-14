'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  ArrowLeft,
  ArrowLeftCircle,
  ArrowRight,
  ArrowRightCircle,
  Film,
  MapPin,
  MessageCircle,
  Music2,
  Pause,
  Play,
  ShieldAlert,
  Sparkles,
  Users,
  Video,
  Volume2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/context/preferences-context'
import type { Locale } from '@/lib/i18n/config'
import * as THREE from 'three'

type LocaleValue = {
  en: string
  ar: string
}

type StoryDialogue = {
  speaker: LocaleValue
  line: LocaleValue
}

type StoryChoice = {
  id: string
  text: LocaleValue
  isCorrect: boolean
  feedback: LocaleValue
  consequence: LocaleValue
  nextScene?: string // Optional: force specific next scene
  points: number
}

type StoryScene = {
  id: string
  order: number
  title: LocaleValue
  subtitle: LocaleValue
  background: string
  overlay: string
  ambiance: LocaleValue
  description: LocaleValue
  dialogues: StoryDialogue[]
  cues: LocaleValue[]
  caution: LocaleValue
  // NEW: Interactive choices
  choices?: StoryChoice[]
  needsChoice: boolean
}

type StoryCharacter = {
  id: string
  name: LocaleValue
  role: LocaleValue
  trait: LocaleValue
  theme: string
}

type StoryScenario = {
  id: string
  label: LocaleValue
  title: LocaleValue
  tagline: LocaleValue
  summary: LocaleValue
  runtime: LocaleValue
  soundtrack: LocaleValue
  background: string
  characters: StoryCharacter[]
  scenes: StoryScene[]
  lesson: {
    title: LocaleValue
    summary: LocaleValue
    takeaways: LocaleValue[]
  }
}

type PersonaOption = {
  id: string
  title: LocaleValue
  tagline: LocaleValue
  description: LocaleValue
  sampleCallsign: string
  sampleStory: LocaleValue
  accent: string
}

// بيانات الشخصيات لواتساب
type WhatsAppContact = {
  id: string
  name: string
  avatar: string
  lastSeen: string
  isOnline: boolean
}

type WhatsAppMessage = {
  id: string
  contactId: string
  text: string
  timestamp: Date
  isRead: boolean
  isDelivered: boolean
  isOutgoing?: boolean
}

const whatsAppContacts: WhatsAppContact[] = [
  {
    id: 'salem',
    name: 'سالم',
    avatar: 'https://ui-avatars.com/api/?name=سالم&size=128&background=25D366&color=fff&bold=true',
    lastSeen: 'منذ ساعتين',
    isOnline: false
  },
  {
    id: 'mom',
    name: 'أم 💚',
    avatar: 'https://ui-avatars.com/api/?name=أم&size=128&background=FF5733&color=fff&bold=true',
    lastSeen: 'منذ 5 دقائق',
    isOnline: true
  },
  {
    id: 'girlfriend',
    name: 'حبيبتي ❤️',
    avatar: 'https://ui-avatars.com/api/?name=حبيبتي&size=128&background=E91E63&color=fff&bold=true',
    lastSeen: 'آخر ظهور منذ الآن',
    isOnline: true
  },
  {
    id: 'friend',
    name: 'صديقة',
    avatar: 'https://ui-avatars.com/api/?name=صديقة&size=128&background=9C27B0&color=fff&bold=true',
    lastSeen: 'منذ 30 دقيقة',
    isOnline: false
  }
]

// دالة لتوليد محادثات طويلة مع اسم المستخدم
const generateWhatsAppConversations = (userName: string): Record<string, WhatsAppMessage[]> => {
  const name = userName.trim() || 'حبيبي'
  const baseTime = Date.now()
  
  return {
    salem: [
      { id: 's1', contactId: 'salem', text: `هلا ${name}`, timestamp: new Date(baseTime - 7 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's2', contactId: 'salem', text: 'شنو صاير معك؟', timestamp: new Date(baseTime - 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's3', contactId: 'salem', text: 'عندنا شغلة حلوة', timestamp: new Date(baseTime - 6 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's4', contactId: 'salem', text: 'نطلع اليوم؟', timestamp: new Date(baseTime - 5 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's5', contactId: 'salem', text: 'في مكان حلو عرفته', timestamp: new Date(baseTime - 5 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's6', contactId: 'salem', text: `يا ${name} وينك؟`, timestamp: new Date(baseTime - 4 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's7', contactId: 'salem', text: 'رد علي ضروري 😄', timestamp: new Date(baseTime - 3 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's8', contactId: 'salem', text: `يا أخي ${name} شنو الأخبار؟`, timestamp: new Date(baseTime - 2 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's9', contactId: 'salem', text: 'وينك الحين؟', timestamp: new Date(baseTime - 2 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's10', contactId: 'salem', text: 'عندنا خطط للنهار اليوم', timestamp: new Date(baseTime - 2 * 60 * 60 * 1000 + 5 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's11', contactId: 'salem', text: 'نطلع مع بعض؟', timestamp: new Date(baseTime - 2 * 60 * 60 * 1000 + 8 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 's12', contactId: 'salem', text: `احنا ننتظرك ${name}`, timestamp: new Date(baseTime - 1 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false }
    ],
    mom: [
      { id: 'm1', contactId: 'mom', text: `سلام عليكم ${name}`, timestamp: new Date(baseTime - 10 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm2', contactId: 'mom', text: 'كيفك يا ولدي؟', timestamp: new Date(baseTime - 9 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm3', contactId: 'mom', text: `وينك ${name}؟`, timestamp: new Date(baseTime - 8 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm4', contactId: 'mom', text: 'عندك وقت تمر عندي؟', timestamp: new Date(baseTime - 6 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm5', contactId: 'mom', text: 'عندي شي أقول لك', timestamp: new Date(baseTime - 5 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm6', contactId: 'mom', text: `يا ${name} وينك؟`, timestamp: new Date(baseTime - 4 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm7', contactId: 'mom', text: 'رد علي ضروري', timestamp: new Date(baseTime - 3 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm8', contactId: 'mom', text: 'سلام عليكم', timestamp: new Date(baseTime - 2 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm9', contactId: 'mom', text: 'وينك يا حبيبي؟', timestamp: new Date(baseTime - 1 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm10', contactId: 'mom', text: 'عندك وقت تمر عندي؟', timestamp: new Date(baseTime - 12 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm11', contactId: 'mom', text: `روح يبلي بصل من المحل`, timestamp: new Date(baseTime - 2 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm12', contactId: 'mom', text: 'زين الحين', timestamp: new Date(baseTime - 2 * 60 * 60 * 1000 + 1 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm13', contactId: 'mom', text: 'وخبز بعد إذا ممكن', timestamp: new Date(baseTime - 2 * 60 * 60 * 1000 + 2 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'm14', contactId: 'mom', text: `رد علي يا ولدي`, timestamp: new Date(baseTime - 30 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false }
    ],
    girlfriend: [
      { id: 'g1', contactId: 'girlfriend', text: `صباح الخير ${name} 🌅`, timestamp: new Date(baseTime - 14 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g2', contactId: 'girlfriend', text: 'كيف صار النوم؟', timestamp: new Date(baseTime - 13 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g3', contactId: 'girlfriend', text: `عندي شي حبيت أقوله لك ${name}`, timestamp: new Date(baseTime - 12 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g4', contactId: 'girlfriend', text: 'لكن لازم نشوف بعض أول 😊', timestamp: new Date(baseTime - 11 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g5', contactId: 'girlfriend', text: 'نطلع اليوم؟', timestamp: new Date(baseTime - 10 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g6', contactId: 'girlfriend', text: `وينك ${name}؟`, timestamp: new Date(baseTime - 9 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g7', contactId: 'girlfriend', text: 'رد علي ضروري', timestamp: new Date(baseTime - 8 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g8', contactId: 'girlfriend', text: `صباح الخير حبيبي 🌅`, timestamp: new Date(baseTime - 5 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g9', contactId: 'girlfriend', text: 'كيف صار النوم؟', timestamp: new Date(baseTime - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g10', contactId: 'girlfriend', text: 'نطلع اليوم؟', timestamp: new Date(baseTime - 3 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g11', contactId: 'girlfriend', text: `وينك؟ 😢`, timestamp: new Date(baseTime - 2 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'g12', contactId: 'girlfriend', text: `أنا بانتظارك ${name} 🥺`, timestamp: new Date(baseTime - 1 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false }
    ],
    friend: [
      { id: 'f1', contactId: 'friend', text: `هلا ${name}`, timestamp: new Date(baseTime - 15 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'f2', contactId: 'friend', text: 'شفت الرسالة اللي ارسلتها لك؟', timestamp: new Date(baseTime - 14 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'f3', contactId: 'friend', text: 'عندنا فرصة حلوة اليوم', timestamp: new Date(baseTime - 13 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'f4', contactId: 'friend', text: `نطلع مع بعض ${name}؟`, timestamp: new Date(baseTime - 12 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'f5', contactId: 'friend', text: 'في مكان حلو عرفته جديد', timestamp: new Date(baseTime - 11 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'f6', contactId: 'friend', text: `وينك ${name}؟`, timestamp: new Date(baseTime - 10 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'f7', contactId: 'friend', text: 'رد علي', timestamp: new Date(baseTime - 9 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'f8', contactId: 'friend', text: 'هلا', timestamp: new Date(baseTime - 6 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'f9', contactId: 'friend', text: 'نطلع مع بعض؟', timestamp: new Date(baseTime - 4 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false },
      { id: 'f10', contactId: 'friend', text: `شنو صاير معك ${name}؟`, timestamp: new Date(baseTime - 3 * 24 * 60 * 60 * 1000), isRead: true, isDelivered: true, isOutgoing: false }
    ]
  }
}

// رسائل جديدة ستصل تدريجياً
const incomingWhatsAppMessages: Array<{ contactId: string; text: string; delay: number }> = [
  { contactId: 'salem', text: 'وينك الحين؟', delay: 5000 },
  { contactId: 'mom', text: 'رد علي ضروري', delay: 8000 },
  { contactId: 'girlfriend', text: 'وينك؟ 😢', delay: 12000 },
  { contactId: 'friend', text: 'شنو صاير معك؟', delay: 15000 }
]

const personaOptions: PersonaOption[] = [
  {
    id: 'observer',
    title: { en: 'Calm Watcher', ar: 'المراقب الهادي' },
    tagline: { en: 'Reads every room before reacting', ar: 'يقرأ المكان كله قبل ما يتحرك' },
    description: { en: 'You rely on stillness and micro clues.', ar: 'قوتك في الهدوء والإشارات الصغيرة.' },
    sampleCallsign: 'الرادار',
    sampleStory: {
      en: 'You grew up fixing routers for neighbors and learned that silence is data.',
      ar: 'كبرت تصلح الراوتر للحي وتعلمت أن السكون عبارة عن معلومات.'
    },
    accent: 'from-sky-500/20 via-blue-500/10 to-transparent'
  },
  {
    id: 'signal',
    title: { en: 'Signal Diver', ar: 'غطاس الإشارات' },
    tagline: { en: 'Jumps into chaos and finds patterns fast', ar: 'ينط داخل الزحمة ويطلع النمط بسرعة' },
    description: { en: 'You like decoding emojis, typos, and tone shifts.', ar: 'تحب تفكك الإيموجي والأخطاء والهزات في الأسلوب.' },
    sampleCallsign: 'نبض',
    sampleStory: {
      en: 'You once ran three chats at once to save a coworker from a fake CFO.',
      ar: 'مرة أدرت ثلاث محادثات بنفس الوقت وأنقذت زميل من مدير مالي مزيف.'
    },
    accent: 'from-fuchsia-500/20 via-purple-500/10 to-transparent'
  },
  {
    id: 'decoy',
    title: { en: 'Street Analyst', ar: 'محلل الحارة' },
    tagline: { en: 'Turns gut feelings into defense plans', ar: 'يحّول الإحساس السريع لخطة دفاع' },
    description: { en: 'You question every badge and build backup stories.', ar: 'تشّك في أي ختم وتبني قصة احتياطية.' },
    sampleCallsign: 'الشبح',
    sampleStory: {
      en: 'You learned to doubt every "urgent" link after a payroll clone almost hit your family.',
      ar: 'تعلمت تشك في أي رابط "عاجل" بعد ما نسخة كشوفات كادت تخدع أهلك.'
    },
    accent: 'from-amber-500/20 via-orange-500/10 to-transparent'
  }
]

const storyScenarios: StoryScenario[] = [
  {
    id: 'phishing-trap',
    label: {
      en: 'Scenario 01',
      ar: 'السيناريو ٠١'
    },
    title: {
      en: 'The Midnight Thread That Pulled Ahmed In',
      ar: 'رسالة نص الليل اللي مسكت أحمد'
    },
    tagline: {
      en: 'Ahmed writes like a secret letter begging for a calm mind before dawn.',
      ar: 'أحمد يرسل لك رسالة سرية يبي فيها عقل هادي قبل الفجر.'
    },
    summary: {
      en: 'Swipe through WhatsApp bubbles, holograms, and a narrator reminding you that you control the tempo.',
      ar: 'تتصفح فقاعة واتساب مع هولوجرام وراوي يذكرك أنك المتحكم بالإيقاع.'
    },
    runtime: {
      en: '4 reactive scenes',
      ar: '٤ مشاهد تفاعلية'
    },
    soundtrack: {
      en: 'Neon oud pulses + dusty heartbeat percussion',
      ar: 'نبض عود إلكتروني مع دقات صحراوية'
    },
    background: 'linear-gradient(125deg, rgba(15,23,42,0.92), rgba(30,64,175,0.75))',
    characters: [
      {
        id: 'mohammed',
        name: { en: 'Ahmed', ar: 'أحمد' },
        role: { en: 'University student', ar: 'طالب جامعي' },
        trait: { en: 'Turns panic into long messages when trust drops', ar: 'إذا توتر كتب فقرات طويلة لما تقل الثقة' },
        theme: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(96,165,250,0.25))'
      },
      {
        id: 'salem',
        name: { en: 'Khalid', ar: 'خالد' },
        role: { en: 'Best friend', ar: 'الصديق الذكي' },
        trait: { en: 'Drops chaotic voice notes but spots red flags fast', ar: 'يرسل فويسات فوضوية بس يشوف العلامات الحمرا بسرعة' },
        theme: 'linear-gradient(135deg, rgba(34,197,94,0.35), rgba(16,185,129,0.25))'
      },
      {
        id: 'attacker',
        name: { en: 'Shadowed attacker', ar: 'المهاجم' },
        role: { en: 'Voice in the dark', ar: 'صوت في الظلام' },
        trait: { en: 'Pretends to be a cold official auto message', ar: 'يتصنع أنه رسالة رسمية جامدة' },
        theme: 'linear-gradient(135deg, rgba(250,204,21,0.3), rgba(248,113,113,0.25))'
      }
    ],
    scenes: [
      {
        id: 'phishing-trap-1',
        order: 1,
        title: { en: 'Midnight message thread', ar: 'رسالة نص الليل' },
        subtitle: { en: 'WhatsApp UI · rain tapping', ar: 'واجهة واتساب · مطر يطق على الشباك' },
        background: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.55), rgba(15,23,42,0.95))',
        overlay: 'linear-gradient(190deg, rgba(2,6,23,0.35), rgba(2,6,23,0.85))',
        ambiance: { en: 'Neon oud pulse · ticking fan', ar: 'نبض إلكتروني خفيف + مروحة تتنفس' },
        description: {
          en: 'Chat bubbles slide in like paper letters while Ahmed narrates with shaking thumbs.',
          ar: 'فقاعات المحادثة تطلع كأنها رسائل ورقية وأحمد يسرد والقلب مرتجف.'
        },
        dialogues: [
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Hey [USER_NAME]...`,
              ar: `يا [USER_NAME]...`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `You up?`,
              ar: `صاحي؟`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Bro I need your help`,
              ar: `أخوي محتاجك`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Just got this message from someone claiming to be from "National Digital Services"`,
              ar: `جاني رسالة من واحد يقول إنه من "الخدمات الرقمية الوطنية"`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Sounds official but something feels off`,
              ar: `صوته رسمي بس في شي غريب`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `They said I have to update my info within 20 minutes or my account gets frozen`,
              ar: `قالولي لازم أحدث بياناتي خلال ٢٠ دقيقة وإلا بيجمدون حسابي`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `And they sent me this link...`,
              ar: `وإرسلولي ذا الرابط...`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `https://gov-verify-login-security.com/update`,
              ar: `https://gov-verify-login-security.com/update`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `I know you're [USER_PERSONA_TITLE] - [USER_CALLSIGN] - and you've dealt with stuff like this before`,
              ar: `أعرف إنك [USER_PERSONA_TITLE] - [USER_CALLSIGN] - ومر عليك هالموضوع قبل`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Remember when you told me "[USER_BACKSTORY]"?`,
              ar: `تذكر لما قلت لي "[USER_BACKSTORY]"؟`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `That's why I'm coming to you first`,
              ar: `هذا ليه جيتك أول واحد`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `What should I do?`,
              ar: `شو أنصحني؟`
            }
          }
        ],
        cues: [
          {
            en: 'Chat bubble unfurls like paper then hovers near a neon seal.',
            ar: 'فقاعة الدردشة تنفرد كأنها ورقة وتقف جنب ختم نيون.'
          },
          {
            en: 'A transparent timer writes "20:00 → 19:59" over the link.',
            ar: 'عداد شفاف يكتب "20:00 → 19:59" فوق الرابط.'
          }
        ],
        caution: {
          en: 'You own the tempo, not the fake seal.',
          ar: 'أنت اللي تحدد سرعة الرد، مو الختم المزيف.'
        },
        needsChoice: true,
        choices: [
          {
            id: 'choice-1-open',
            text: { en: 'Tell him to click immediately because officials hate delays', ar: 'قله اضغط فوراً لأن الجهات الرسمية ما تحب التأخير' },
            isCorrect: false,
            feedback: { en: '❌ Urgency hijacked you. You echoed the attacker.', ar: '❌ الاستعجال خطفك. صرت تردد كلام المحتال.' },
            consequence: { en: 'He opens the fake panel and the attacker stores his ID and password before you blink.', ar: 'فتح لوحة مزيفة والمهاجم خزّن هويته وكلمته قبل ترمش.' },
            points: 0
          },
          {
            id: 'choice-1-check',
            text: { en: 'Ask for two minutes to inspect the link structure first', ar: 'قل له عطنا دقيقتين نفكك شكل الرابط أول' },
            isCorrect: true,
            feedback: { en: '✅ Investigator energy unlocked.', ar: '✅ مود المحقق اشتغل.' },
            consequence: { en: 'You zoom on the weird "gov-verify-login-security" mashup and flag it.', ar: 'كبرت الرابط ولاحظت خربطة "gov-verify-login-security" ورفعت الراية.' },
            points: 10
          },
          {
            id: 'choice-1-verify',
            text: { en: 'Ask for the official sender handle before touching anything', ar: 'اطلب منه اسم الجهة الرسمي قبل ما يضغط' },
            isCorrect: true,
            feedback: { en: '✅ Smart. Identity first, link later.', ar: '✅ ذكي. الهوية قبل الرابط.' },
            consequence: { en: 'He notices the WhatsApp number has a foreign prefix and no verified badge.', ar: 'تنبه أن رقم الواتساب مقدمة أجنبية وما عليه توثيق.' },
            points: 12
          },
          {
            id: 'choice-1-ignore',
            text: { en: 'Tell him to screenshot, breathe, and wait for daylight to call', ar: 'قله صور الشاشة وخذ نفس وانتظر لبكرة وتتصل' },
            isCorrect: true,
            feedback: { en: '✅ Slow is smooth in cyber stories.', ar: '✅ الهدوء في السايبر قوة.' },
            consequence: { en: 'You stop the panic loop and keep his credentials untouched.', ar: 'كسرت حلقة القلق وخليت بياناته ما تحركت.' },
            points: 8
          }
        ]
      },
      {
        id: 'phishing-trap-2',
        order: 2,
        title: { en: 'Shadow countdown', ar: 'عد تنازلي مظلل' },
        subtitle: { en: 'Static overlay + fake seal', ar: 'تشويش + ختم مزيف' },
        background: 'radial-gradient(circle, rgba(2,6,23,0.95), rgba(76,29,149,0.75))',
        overlay: 'linear-gradient(145deg, rgba(190,24,93,0.35), rgba(2,6,23,0.6))',
        ambiance: { en: 'Distorted countdown · desert percussion', ar: 'عد تنازلي مشوه + ايقاع صحراوي' },
        description: {
          en: "The fake seal flickers while a neon countdown orbits Ahmed's chat window.",
          ar: 'الختم المزيف يومض والعداد النيوني يلف حول شاشة محادثة محمد.'
        },
        dialogues: [
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `They sent another message`,
              ar: `جاني رسالة ثانية`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `This time it says "FINAL WARNING"`,
              ar: `هالمرة كاتبين "إنذار أخير"`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Timer now shows 12 minutes left`,
              ar: `العداد صار ١٢ دقيقة`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `They wrote: "Update your information NOW or we will freeze your national ID tonight. This is your last chance."`,
              ar: `كتبوا: "حدث معلوماتك الحين وإلا راح نجمد هويتك الوطنية الليلة. هذي آخر فرصة لك."`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `[USER_NAME]... I'm getting scared`,
              ar: `[USER_NAME]... بديت أخاف`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `My hands are literally shaking`,
              ar: `يدي ترجف`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `What if it's real and I miss the deadline?`,
              ar: `وش لو صحيح وما فعلت؟`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Please [USER_NAME], tell me what to do`,
              ar: `يا [USER_NAME]، قولي شو أسوي`
            }
          }
        ],
        cues: [
          {
            en: 'Neon countdown orbits and glitches whenever you hover over the link.',
            ar: 'عداد نيون يلف ويعمل جليتش كل ما مررت فوق الرابط.'
          },
          {
            en: 'A red halo pulses every four beats to mimic a heartbeat.',
            ar: 'هالة حمرا تنبض كل أربع دقات كأنها نبض.'
          }
        ],
        caution: {
          en: 'If their tone shakes you, pause until yours returns.',
          ar: 'إذا نغمتهم رجت قلبك، وقف لين ترجع نغمتك.'
        },
        needsChoice: true,
        choices: [
          {
            id: 'choice-2-trust',
            text: { en: 'Repeat their threat and tell him to hurry and click', ar: 'كرر تهديدهم وقله استعجل واضغط' },
            isCorrect: false,
            feedback: { en: '❌ You sided with the countdown. Trap triggered.', ar: '❌ صرت مع العداد. الفخ اشتغل.' },
            consequence: { en: 'He follows the fake urgency and the attacker steals his session.', ar: 'اتبع العجلة المزيفة والمحتال خطف الجلسة.' },
            points: 0
          },
          {
            id: 'choice-2-examine',
            text: { en: 'Make him zoom on every letter and compare it with the real gov domain', ar: 'خله يكبر كل حرف ويقارن بالدومين الحكومي الحقيقي' },
            isCorrect: true,
            feedback: { en: '✅ Forensics mode engaged.', ar: '✅ دخلت وضعية التحليل.' },
            consequence: { en: 'The mashup words glow red, exposing the clone.', ar: 'الكلمات المدموجة تومض بالأحمر وتكشف النسخة المزيفة.' },
            points: 15
          },
          {
            id: 'choice-2-calm',
            text: { en: 'Remind him that real offices schedule calls, not WhatsApp countdowns', ar: 'ذكره أن الجهات الحقيقية تحجز اتصال، مو عد تنازلي واتساب' },
            isCorrect: true,
            feedback: { en: '✅ Perfect coaching. You broke the fear loop.', ar: '✅ توجيه مثالي. كسرت دائرة الخوف.' },
            consequence: { en: 'He breathes, the timer loses power, and Khalid prepares the facts.', ar: 'تنفس، العداد فقد هيبته، وخالد جهز الحقائق.' },
            points: 18
          },
          {
            id: 'choice-2-verify',
            text: { en: 'Tell him to call the official hotline from his saved contacts', ar: 'قله يتصل على رقم الجهة الرسمي المحفوظ عنده' },
            isCorrect: true,
            feedback: { en: '✅ Verification beats imitation.', ar: '✅ التحقق يهزم التقليد.' },
            consequence: { en: 'A real agent confirms no such message was sent.', ar: 'الموظف الحقيقي أكد ما في رسالة مثلها.' },
            points: 20
          }
        ]
      },
      {
        id: 'phishing-trap-3',
        order: 3,
        title: { en: 'Digital autopsy', ar: 'تحليل رقمي' },
        subtitle: { en: 'Message zoom + interface overlay', ar: 'زووم على الرسالة مع تراكب' },
        background: 'radial-gradient(circle at 80% 20%, rgba(59,130,246,0.4), rgba(15,23,42,0.95))',
        overlay: 'linear-gradient(160deg, rgba(15,118,110,0.4), rgba(5,5,5,0.7))',
        ambiance: { en: 'Muted beeps + Khalid tapping the desk', ar: 'نقرات خالد على الطاولة + بيب خفيف' },
        description: {
          en: 'The interface freezes while every letter in the phishing domain glows for inspection.',
          ar: 'الواجهة تتجمد وكل حرف في الدومين الوهمي يضيء للتفتيش.'
        },
        dialogues: [
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `[USER_NAME] you were SO right`,
              ar: `[USER_NAME] كنت صح ١٠٠٪؜`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `I looked closer at the link like you said`,
              ar: `شفت الرابط زين زي ما قلت`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `The domain has "verify-login-security" all mashed together`,
              ar: `الدومين مكتوب فيه "verify-login-security" كلو ملزق`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `No real government website looks like that`,
              ar: `ما في موقع حكومي حقيقي كذا`
            }
          },
          {
            speaker: { en: 'Khalid', ar: 'خالد' },
            line: {
              en: `Yo Ahmed! Just saw your message`,
              ar: `يا محمد! شفت رسالتك`
            }
          },
          {
            speaker: { en: 'Khalid', ar: 'خالد' },
            line: {
              en: `I zoomed in on the screenshot you sent`,
              ar: `كبرت السكرين شوت اللي بعثته`
            }
          },
          {
            speaker: { en: 'Khalid', ar: 'خالد' },
            line: {
              en: `Bro it's not even "microsoft" - it's "rnicrosft"`,
              ar: `أخوي حتى "microsoft" مو صح، كاتبين "rnicrosft"`
            }
          },
          {
            speaker: { en: 'Khalid', ar: 'خالد' },
            line: {
              en: `Classic typosquatting scam`,
              ar: `حركة typo معروفة`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `[USER_NAME] your advice saved me`,
              ar: `[USER_NAME] نصيحتك أنقذتني`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `When you reminded me of "[USER_BACKSTORY]"`,
              ar: `لما ذكرتني بـ "[USER_BACKSTORY]"`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `That's what stopped me from clicking`,
              ar: `هذا اللي منعني أضغط`
            }
          }
        ],
        cues: [
          {
            en: 'Each suspicious letter outlines in neon, showing "rn" stacked over "m".',
            ar: 'كل حرف مشبوه يتحدد بنور نيون ويبين "rn" فوق "m".'
          },
          {
            en: 'Side panel displays WHOIS age dropping below seven days.',
            ar: 'لوحة جانبية تعرض عمر الدومين أقل من سبعة أيام.'
          }
        ],
        caution: {
          en: 'Letters tell on themselves when you slow the scene.',
          ar: 'الحروف تفضح نفسها لما تبطئ المشهد.'
        },
        needsChoice: false
      },
      {
        id: 'phishing-trap-4',
        order: 4,
        title: { en: 'Aftermath letter', ar: 'رسالة بعد العاصفة' },
        subtitle: { en: 'Morning light · calm HUD', ar: 'ضوء الصبح · واجهة هادئة' },
        background: 'linear-gradient(140deg, rgba(59,130,246,0.35), rgba(34,197,94,0.25))',
        overlay: 'linear-gradient(180deg, rgba(2,6,23,0.2), rgba(15,15,15,0.5))',
        ambiance: { en: 'Gentle oud echo', ar: 'صدى عود ناعم' },
        description: {
          en: 'Sunrise washes the dorm while Ahmed drafts one last message to you.',
          ar: 'الشمس ترش نورها على الغرفة ومحمد يكتب آخر رسالة لك.'
        },
        dialogues: [
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Morning [USER_NAME]`,
              ar: `صباح الخير [USER_NAME]`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Couldn't sleep much last night`,
              ar: `ما نمت كثير البارحة`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `But I kept thinking about what you said`,
              ar: `بس فكرت في اللي قلته`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `If you hadn't been there...`,
              ar: `لو ما كنت موجود...`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `I probably would have clicked that link`,
              ar: `غالباً كان اضغطت الرابط`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `And given them everything`,
              ar: `وعطيتهم كل شي`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `You turned my panic into... I don't know, like a mission?`,
              ar: `حولت خوفي ل... ما أدري، كأنه مهمة؟`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `From now on, nothing happens until [USER_PERSONA_TITLE] - [USER_CALLSIGN] - checks it first`,
              ar: `من اليوم، ما أتحرك على شي إلا لما [USER_PERSONA_TITLE] - [USER_CALLSIGN] - يوافق أول`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `You're my first call from now on`,
              ar: `أنت أول واحد أدق عليه من اليوم`
            }
          },
          {
            speaker: { en: 'Ahmed', ar: 'أحمد' },
            line: {
              en: `Thank you bro`,
              ar: `الله يعطيك العافية أخوي`
            }
          }
        ],
        cues: [
          {
            en: 'Text card fades in: "CyberMirror · Protect Your Click."',
            ar: 'بطاقة نص تظهر: "CyberMirror · Protect Your Click."'
          }
        ],
        caution: {
          en: 'Awareness turns panic into a playable scenario.',
          ar: 'الوعي يحول القلق لقصة قابلة للعب.'
        },
        needsChoice: false
      }
    ],
    lesson: {
      title: { en: 'Takeaway', ar: 'الدرس' },
      summary: {
        en: 'Authority tone plus a weird domain means you slow everything down.',
        ar: 'نبرة رسمية مع دومين غريب يعني تهدي كل شي.'
      },
      takeaways: [
        {
          en: 'Legit government services use short, known domains.',
          ar: 'الخدمات الحكومية الحقيقية تستخدم دومينات بسيطة ومعروفة.'
        },
        {
          en: 'Treat urgent WhatsApp links like levels that require inspection.',
          ar: 'أي رابط عاجل في واتساب اعتبره مرحلة تحتاج تفكيك قبل الضغط.'
        }
      ]
    }
  },
  {
    id: 'fake-login',
    label: {
      en: 'Scenario 02',
      ar: 'السيناريو ٠٢'
    },
    title: {
      en: 'Instagram Mirage',
      ar: 'انستغرام المزيف'
    },
    tagline: {
      en: 'A shiny sponsorship tries to hijack Nora\'s influence.',
      ar: 'إعلان لامع يحاول يسرق تأثير ريم.'
    },
    summary: {
      en: 'Switch between pastel excitement and sudden red alerts as Nora chases a dream deal.',
      ar: 'التنقل بين ألوان الباستيل والحمر المفاجئ بينما ريم تركض خلف إعلان أحلامها.'
    },
    runtime: {
      en: '4 pastel-to-crimson scenes',
      ar: '٤ مشاهد من الباستيل للأحمر'
    },
    soundtrack: {
      en: 'Upbeat intro → alarm stingers',
      ar: 'موسيقى لطيفة تتحول لجُرس إنذار'
    },
    background: 'linear-gradient(130deg, rgba(236,72,153,0.35), rgba(79,70,229,0.4))',
    characters: [
      {
        id: 'reem',
        name: { en: 'Nora', ar: 'نورا' },
        role: { en: 'Micro influencer', ar: 'مؤثرة صغيرة' },
        trait: { en: 'Lives for colorful aesthetics', ar: 'تعشق الألوان والمشاهد اللطيفة' },
        theme: 'linear-gradient(135deg, rgba(244,114,182,0.35), rgba(251,207,232,0.3))'
      },
      {
        id: 'shahad',
        name: { en: 'Sara', ar: 'سارة' },
        role: { en: 'Practical friend', ar: 'الصديقة الواقعية' },
        trait: { en: 'Always asks "from where?"', ar: 'أول سؤال عندها: من وين؟' },
        theme: 'linear-gradient(135deg, rgba(14,165,233,0.35), rgba(125,211,252,0.25))'
      },
      {
        id: 'whatsapp-attacker',
        name: { en: 'Unknown sender', ar: 'مرسل مجهول' },
        role: { en: 'WhatsApp contact', ar: 'محتال واتساب' },
        trait: { en: 'Sounds like a brand rep', ar: 'صوته كأنه ممثل شركة' },
        theme: 'linear-gradient(135deg, rgba(251,191,36,0.35), rgba(248,113,113,0.25))'
      }
    ],
    scenes: [
      {
        id: 'fake-login-1',
        order: 1,
        title: { en: 'Dream offer', ar: 'الإعلان الحلم' },
        subtitle: { en: 'Instagram UI · pastel glow', ar: 'واجهة انستغرام بألوان باستيل' },
        background: 'radial-gradient(circle at 25% 20%, rgba(236,72,153,0.45), rgba(30,27,75,0.9))',
        overlay: 'linear-gradient(180deg, rgba(15,15,15,0.15), rgba(15,15,15,0.65))',
        ambiance: { en: 'Light pop beat', ar: 'موسيقى بوب لطيفة' },
        description: {
          en: 'Confetti particles burst as the offer message enters.',
          ar: 'قصاصات ورق صغيرة تطير مع دخول رسالة العرض.'
        },
        dialogues: [
          {
            speaker: { en: 'Nora', ar: 'نورا' },
            line: {
              en: 'Yes! Finally a big brand wants me to log in and confirm the campaign.',
              ar: 'واااو! أخيرًا شركة كبيرة تبغاني أسجل وأأكد الحملة.'
            }
          }
        ],
        cues: [
          {
            en: 'Message bubble includes a shortened link.',
            ar: 'فقاعة الرسالة تحتوي رابط مختصر.'
          }
        ],
        caution: {
          en: 'Excitement can blur details.',
          ar: 'الحماس يعمي التفاصيل.'
        },
        needsChoice: true,
        choices: [
          {
            id: 'choice-insta-1-click',
            text: { en: 'Click the link immediately!', ar: 'اضغط الرابط فوراً!' },
            isCorrect: false,
            feedback: { en: '❌ Too fast! Excitement clouded your judgment.', ar: '❌ سريع جداً! الحماس عماك عن التفكير.' },
            consequence: { en: 'You opened a fake login page.', ar: 'فتحت صفحة تسجيل دخول مزيفة.' },
            points: 0
          },
          {
            id: 'choice-insta-1-check',
            text: { en: 'Check where the link goes first', ar: 'أفحص وين الرابط رايح أول' },
            isCorrect: true,
            feedback: { en: '✅ Smart! Always check links before clicking.', ar: '✅ ذكي! دايماً افحص الروابط قبل.' },
            consequence: { en: 'You noticed it goes to a suspicious domain.', ar: 'لاحظت إنه رايح لدومين مشبوه.' },
            points: 10
          },
          {
            id: 'choice-insta-1-verify',
            text: { en: 'Ask Sara to look at it', ar: 'اسأل سارة تشوفه' },
            isCorrect: true,
            feedback: { en: '✅ Great! A second opinion saves lives.', ar: '✅ ممتاز! رأي ثاني ينقذ حياتك.' },
            consequence: { en: 'Sara spotted the typo in the domain.', ar: 'سارة لقت الغلط في الدومين.' },
            points: 12
          }
        ]
      },
      {
        id: 'fake-login-2',
        order: 2,
        title: { en: 'Glitch in the glow', ar: 'الصدمة' },
        subtitle: { en: 'Fake login page turns crimson', ar: 'صفحة تسجيل دخول مزيفة باللون الأحمر' },
        background: 'radial-gradient(circle, rgba(220,38,38,0.55), rgba(76,5,25,0.9))',
        overlay: 'linear-gradient(140deg, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
        ambiance: { en: 'Alarm tone builds', ar: 'صوت إنذار يرتفع تدريجيًا' },
        description: {
          en: 'Sara walks into the frame as the UI flickers.',
          ar: 'شهد تدخل المشهد والواجهة ترمش.'
        },
        dialogues: [
          {
            speaker: { en: 'Sara', ar: 'سارة' },
            line: {
              en: 'Why is Instagram asking on a random site called instgram-help.com?',
              ar: 'ليش انستغرام يطلب تسجيل دخول من موقع اسمه instgram-help.com؟'
            }
          },
          {
            speaker: { en: 'Nora', ar: 'نورا' },
            line: {
              en: 'He said he\'s from the company…',
              ar: 'قال لي إنه من الشركة…'
            }
          }
        ],
        cues: [
          {
            en: 'URL letters drop out revealing the missing “a”.',
            ar: 'حروف الدومين تتساقط وتكشف حرف a الناقص.'
          }
        ],
        caution: {
          en: 'Typos scream scam.',
          ar: 'الأخطاء الإملائية تصرخ: احتيال.'
        },
        needsChoice: true,
        choices: [
          {
            id: 'choice-insta-2-login',
            text: { en: 'Enter my Instagram password anyway', ar: 'أدخل كلمة السر حقت انستغرام' },
            isCorrect: false,
            feedback: { en: '❌ Terrible choice! Account stolen!', ar: '❌ اختيار كارثي! تم سرقة الحساب!' },
            consequence: { en: 'They got your password and took over your account.', ar: 'سرقوا كلمة المرور وسيطروا على حسابك.' },
            points: 0
          },
          {
            id: 'choice-insta-2-close',
            text: { en: 'Close the page immediately', ar: 'أقفل الصفحة فوراً' },
            isCorrect: true,
            feedback: { en: '✅ Perfect! You recognized the trap in time.', ar: '✅ مثالي! عرفت الفخ في الوقت المناسب.' },
            consequence: { en: 'You saved your account by not entering credentials.', ar: 'أنقذت حسابك بعدم إدخال البيانات.' },
            points: 20
          }
        ]
      },
      {
        id: 'fake-login-3',
        order: 3,
        title: { en: 'Account hijacked', ar: 'الحساب يروح' },
        subtitle: { en: 'Instagram logged out screen', ar: 'شاشة تسجيل الخروج من انستغرام' },
        background: 'linear-gradient(120deg, rgba(17,24,39,0.9), rgba(180,83,9,0.4))',
        overlay: 'linear-gradient(160deg, rgba(239,68,68,0.3), rgba(0,0,0,0.8))',
        ambiance: { en: 'Silence + single bass drop', ar: 'صمت يتبعه صوت ثقيل' },
        description: {
          en: 'Notification “Your account has been logged out” appears with echo.',
          ar: 'تنبيه «تم تسجيل الخروج من حسابك» يظهر مع صدى صوت.'
        },
        dialogues: [
          {
            speaker: { en: 'Nora', ar: 'نورا' },
            line: {
              en: 'No! My followers!',
              ar: 'لااا! متابعيني!'
            }
          },
          {
            speaker: { en: 'Sara', ar: 'سارة' },
            line: {
              en: 'They stole your password through that fake page.',
              ar: 'سرقوا كلمة المرور من الصفحة المزيفة.'
            }
          }
        ],
        cues: [
          {
            en: 'Progress bar drains to zero.',
            ar: 'شريط التقدم يفرغ إلى صفر.'
          }
        ],
        caution: {
          en: 'Logging in outside the real app is a goodbye.',
          ar: 'تسجيل الدخول خارج التطبيق الأصلي = وداع.'
        },
        needsChoice: false
      },
      {
        id: 'fake-login-4',
        order: 4,
        title: { en: 'Promise to self', ar: 'نهاية هادئة' },
        subtitle: { en: 'Blue sky background', ar: 'خلفية سماء زرقاء' },
        background: 'linear-gradient(140deg, rgba(59,130,246,0.35), rgba(125,211,252,0.5))',
        overlay: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(15,23,42,0.55))',
        ambiance: { en: 'Soft wind + birds', ar: 'صوت هواء خفيف مع عصافير' },
        description: {
          en: 'Nora writes a reminder note on her phone.',
          ar: 'ريم تكتب ملاحظة في جوالها كتذكير.'
        },
        dialogues: [
          {
            speaker: { en: 'Nora', ar: 'نورا' },
            line: {
              en: 'From now on I log in from the official app only.',
              ar: 'من اليوم ما أسجل دخولي إلا من التطبيق الأصلي.'
            }
          }
        ],
        cues: [
          {
            en: 'Sticky note animation: “Official app or nothing.”',
            ar: 'ملصق يظهر: التطبيق الرسمي أو لا شيء.'
          }
        ],
        caution: {
          en: 'Shortcut links cost entire careers.',
          ar: 'روابط shortcuts ممكن تكلف مهنة كاملة.'
        },
        needsChoice: false
      }
    ],
    lesson: {
      title: { en: 'Lesson', ar: 'الرسالة' },
      summary: {
        en: 'Brand reps never ask for your login on random pages.',
        ar: 'ممثلي الشركات ما يطلبون معلومات الدخول في صفحات مجهولة.'
      },
      takeaways: [
        {
          en: 'Check the full address bar before typing credentials.',
          ar: 'شيّك شريط العنوان كامل قبل ما تكتب البيانات.'
        },
        {
          en: 'Use the official app even when offers feel urgent.',
          ar: 'حتى مع العروض العاجلة، استخدم التطبيق الرسمي فقط.'
        }
      ]
    }
  },
  {
    id: 'job-scam',
    label: {
      en: 'Scenario 03',
      ar: 'السيناريو ٠٣'
    },
    title: {
      en: 'The Imaginary Job',
      ar: 'الوظيفة الوهمية'
    },
    tagline: {
      en: 'Youssef hunts for hope while a scammer builds a fake HR desk.',
      ar: 'فهد يدور فرصة بينما محتال يجهز مكتب توظيف مزيف.'
    },
    summary: {
      en: 'Warm office lights slowly fade into a cold warning banner.',
      ar: 'إضاءة المكتب الدافئة تتحول تدريجيًا لتحذير بارد.'
    },
    runtime: {
      en: '4 layered scenes',
      ar: '٤ مشاهد متتابعة'
    },
    soundtrack: {
      en: 'Hopeful strings → glitch alarm',
      ar: 'أوتار أمل تتحول إلى إنذار مشوش'
    },
    background: 'linear-gradient(120deg, rgba(252,211,77,0.35), rgba(14,165,233,0.4))',
    characters: [
      {
        id: 'fahad',
        name: { en: 'Youssef', ar: 'يوسف' },
        role: { en: 'Fresh graduate', ar: 'خريج جديد' },
        trait: { en: 'Believes every good email', ar: 'يصدق أي إيميل جميل' },
        theme: 'linear-gradient(135deg, rgba(249,115,22,0.35), rgba(251,191,36,0.3))'
      },
      {
        id: 'lian',
        name: { en: 'Layla', ar: 'ليلى' },
        role: { en: 'Sister', ar: 'أخته' },
        trait: { en: 'Reads the fine print', ar: 'تقرأ التفاصيل الصغيرة' },
        theme: 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(96,165,250,0.25))'
      },
      {
        id: 'job-attacker',
        name: { en: 'Fake recruiter', ar: 'المحتال' },
        role: { en: 'Email charmer', ar: 'محتال الإيميل' },
        trait: { en: 'Collects personal data via PDFs', ar: 'يجمع البيانات عبر ملفات PDF مزيفة' },
        theme: 'linear-gradient(135deg, rgba(248,113,113,0.35), rgba(239,68,68,0.25))'
      }
    ],
    scenes: [
      {
        id: 'job-scam-1',
        order: 1,
        title: { en: 'The dream call', ar: 'الحلم' },
        subtitle: { en: 'Office sunlight + coffee steam', ar: 'إضاءة مكتب دافئة + بخار قهوة' },
        background: 'radial-gradient(circle at 30% 20%, rgba(251,191,36,0.45), rgba(15,23,42,0.9))',
        overlay: 'linear-gradient(180deg, rgba(2,6,23,0.2), rgba(2,6,23,0.7))',
        ambiance: { en: 'Hopeful strings', ar: 'أوتار أمل' },
        description: {
          en: 'Youssef opens an email with golden seal graphics.',
          ar: 'فهد يفتح إيميل فيه ختم ذهبي.'
        },
        dialogues: [
          {
            speaker: { en: 'Youssef', ar: 'يوسف' },
            line: {
              en: 'Finally! A company wants me to fill the form and send my CV.',
              ar: 'أخيرًا! شركة تبغاني أعبي نموذج وأرسل السيرة الذاتية.'
            }
          }
        ],
        cues: [
          {
            en: 'Golden particles highlight the email header.',
            ar: 'جزيئات ذهبية تبرز ترويسة الإيميل.'
          }
        ],
        caution: {
          en: 'Shiny seals can be printed by anyone.',
          ar: 'أي شخص يقدر يحط ختم ذهبي.'
        },
        needsChoice: true,
        choices: [
          {
            id: 'choice-job-1-fill',
            text: { en: 'Fill the form immediately', ar: 'أعبي النموذج فوراً' },
            isCorrect: false,
            feedback: { en: '❌ Too eager! Never rush with personal data.', ar: '❌ متحمس زيادة! لا تستعجل ببياناتك الشخصية.' },
            consequence: { en: 'You started entering sensitive information.', ar: 'بدأت تدخل معلومات حساسة.' },
            points: 0
          },
          {
            id: 'choice-job-1-check',
            text: { en: 'Verify the company email first', ar: 'أتحقق من إيميل الشركة أولاً' },
            isCorrect: true,
            feedback: { en: '✅ Smart! Always verify the sender.', ar: '✅ ذكي! دايماً تحقق من المرسل.' },
            consequence: { en: 'You noticed the email domain looks suspicious.', ar: 'لاحظت إن دومين الإيميل مشبوه.' },
            points: 15
          },
          {
            id: 'choice-job-1-ask',
            text: { en: 'Ask Layla to review it', ar: 'اطلب من ليلى تراجعه' },
            isCorrect: true,
            feedback: { en: '✅ Wise! Getting a second opinion helps.', ar: '✅ حكيم! رأي ثاني يساعدك.' },
            consequence: { en: 'Layla spotted red flags in the request.', ar: 'ليلى لقت علامات تحذير في الطلب.' },
            points: 12
          }
        ]
      },
      {
        id: 'job-scam-2',
        order: 2,
        title: { en: 'The trap', ar: 'الفخ' },
        subtitle: { en: 'Fake PDF glowing', ar: 'ملف PDF مزيف يلمع' },
        background: 'radial-gradient(circle, rgba(249,115,22,0.55), rgba(67,20,7,0.92))',
        overlay: 'linear-gradient(150deg, rgba(0,0,0,0.35), rgba(0,0,0,0.7))',
        ambiance: { en: 'Bass pulse', ar: 'نبض ثقيل' },
        description: {
          en: 'Layla leans over as sensitive fields flash red.',
          ar: 'ليان تميل على الشاشة والحقول الحساسة تومض بالأحمر.'
        },
        dialogues: [
          {
            speaker: { en: 'Layla', ar: 'ليلى' },
            line: {
              en: 'Why would HR need your ID photo and bank number before any interview?',
              ar: 'ليش الموارد البشرية يحتاجون صورتك المدنية ورقم حسابك قبل أي مقابلة؟'
            }
          },
          {
            speaker: { en: 'Youssef', ar: 'يوسف' },
            line: {
              en: 'Isn\'t it for opening an employee file?',
              ar: 'مو عشان يفتحون لي ملف وظيفي؟'
            }
          }
        ],
        cues: [
          {
            en: 'Form fields labeled “National ID” and “Bank IBAN” pulse red.',
            ar: 'حقل «الهوية الوطنية» و«رقم الحساب» ينبضان باللون الأحمر.'
          }
        ],
        caution: {
          en: 'Legit HR teams start with a chat, not a bank request.',
          ar: 'التوظيف الحقيقي يبدأ بمكالمة مو بطلب بيانات بنكية.'
        },
        needsChoice: true,
        choices: [
          {
            id: 'choice-job-2-share',
            text: { en: 'Share my ID and bank details', ar: 'أشارك الهوية ورقم الحساب' },
            isCorrect: false,
            feedback: { en: '❌ Disaster! Never share banking info before interview.', ar: '❌ كارثة! لا تشارك معلومات بنكية قبل المقابلة.' },
            consequence: { en: 'Your personal data is now in wrong hands.', ar: 'بياناتك الشخصية الآن بيد الخطأ.' },
            points: 0
          },
          {
            id: 'choice-job-2-refuse',
            text: { en: 'Refuse and ask for interview first', ar: 'أرفض وأطلب مقابلة أولاً' },
            isCorrect: true,
            feedback: { en: '✅ Perfect! Real companies interview first.', ar: '✅ مثالي! الشركات الحقيقية تسوي مقابلة أول.' },
            consequence: { en: 'You protected your sensitive information.', ar: 'حميت معلوماتك الحساسة.' },
            points: 25
          }
        ]
      },
      {
        id: 'job-scam-3',
        order: 3,
        title: { en: 'The reveal', ar: 'الكشف' },
        subtitle: { en: 'Dark mode warning banner', ar: 'تحذير بلون داكن' },
        background: 'radial-gradient(circle, rgba(15,118,110,0.6), rgba(3,7,18,0.95))',
        overlay: 'linear-gradient(160deg, rgba(190,24,93,0.35), rgba(0,0,0,0.8))',
        ambiance: { en: 'Alert ping + glitch', ar: 'جرس تحذير مع جليتش' },
        description: {
          en: 'Browser banner pops: “This domain was reported as scam.”',
          ar: 'ينبثق شريط: «هذا الدومين تم التبليغ عنه كاحتيال».'
        },
        dialogues: [
          {
            speaker: { en: 'Youssef', ar: 'يوسف' },
            line: {
              en: 'I was a second away from submitting everything…',
              ar: 'كنت على ثانية من إرسال كل شي…'
            }
          },
          {
            speaker: { en: 'Layla', ar: 'ليلى' },
            line: {
              en: 'Not every formal email is real. Verify the sender.',
              ar: 'مو كل إيميل رسمي يعني صحيح. تحقّق من المرسل.'
            }
          }
        ],
        cues: [
          {
            en: 'Warning banner shakes once and locks the submit button.',
            ar: 'شريط التحذير يهتز مرة ويقفل زر الإرسال.'
          }
        ],
        caution: {
          en: 'Systems do warn you—only if you pause to read.',
          ar: 'الأنظمة تحذرك… بس لو وقفت وقرأت.'
        },
        needsChoice: false
      },
      {
        id: 'job-scam-4',
        order: 4,
        title: { en: 'Lesson learned', ar: 'النهاية' },
        subtitle: { en: 'Calm office again', ar: 'أجواء مكتب هادئة' },
        background: 'linear-gradient(140deg, rgba(125,211,252,0.4), rgba(187,247,208,0.45))',
        overlay: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(15,23,42,0.5))',
        ambiance: { en: 'Gentle piano', ar: 'بيانو هادئ' },
        description: {
          en: 'Youssef pins a sticky note: "Call to confirm first."',
          ar: 'فهد يلصق ورقة: «اتصل وتأكد أول».'
        },
        dialogues: [
          {
            speaker: { en: 'Youssef', ar: 'يوسف' },
            line: {
              en: 'From now on I verify before trusting.',
              ar: 'من اليوم أتأكد قبل ما أصدق.'
            }
          }
        ],
        cues: [
          {
            en: 'Phone animation showing he calls the real company.',
            ar: 'تحريك له وهو يتصل بالشركة الحقيقية.'
          }
        ],
        caution: {
          en: 'Hope plus patience beats any trap.',
          ar: 'الأمل مع صبر يهزم أي فخ.'
        },
        needsChoice: false
      }
    ],
    lesson: {
      title: { en: 'Remember', ar: 'تذكّر' },
      summary: {
        en: 'Legitimate hiring happens through official portals or voice calls.',
        ar: 'التوظيف الحقيقي يتم عبر بوابات رسمية أو اتصال واضح.'
      },
      takeaways: [
        {
          en: 'Never share banking data on a PDF form.',
          ar: 'لا تشارك معلوماتك البنكية عبر نموذج PDF.'
        },
        {
          en: 'Search the domain name + “scam” before submitting.',
          ar: 'ابحث عن اسم الدومين مع كلمة «scam» قبل الإرسال.'
        }
      ]
    }
  }
]

const NeonParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const array = new Float32Array(600 * 3)
    for (let i = 0; i < 600; i += 1) {
      const idx = i * 3
      array[idx] = (Math.random() - 0.5) * 8
      array[idx + 1] = (Math.random() - 0.5) * 4
      array[idx + 2] = (Math.random() - 0.5) * 8
    }
    return array
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.07
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#38bdf8" size={0.06} sizeAttenuation opacity={0.65} transparent />
    </points>
  )
}

const PulseRing = () => {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2
      meshRef.current.rotation.y = time * 0.2
    }
  })

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 3, 0, 0]}>
      <torusGeometry args={[1.8, 0.04, 32, 200]} />
      <meshBasicMaterial color="#a855f7" transparent opacity={0.35} />
    </mesh>
  )
}

const StoryThreeBackdrop = () => (
  <Canvas className="h-full w-full" camera={{ position: [0, 0, 5], fov: 55 }}>
    <color attach="background" args={['#020617']} />
    <ambientLight intensity={0.4} />
    <pointLight position={[3, 4, 2]} intensity={0.4} color="#67e8f9" />
    <NeonParticleField />
    <PulseRing />
  </Canvas>
)

const getLocaleText = (value: LocaleValue, locale: Locale) => value[locale]

export function StoryModeExperience() {
  const { locale } = usePreferences()
  const [activeScenarioId, setActiveScenarioId] = useState(storyScenarios[0]?.id ?? '')
  const [sceneIndex, setSceneIndex] = useState(0)
  const [dialogueIndex, setDialogueIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [musicOn, setMusicOn] = useState(false)
  const [isImmersiveMode, setIsImmersiveMode] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // User character creation
  const [userName, setUserName] = useState<string>('')
  const [showCharacterCreation, setShowCharacterCreation] = useState(true)
  const [characterCreated, setCharacterCreated] = useState(false)
  const [selectedPersonaId, setSelectedPersonaId] = useState(personaOptions[0]?.id ?? 'observer')
  const [personaCallsign, setPersonaCallsign] = useState('')
  const [personaBackstory, setPersonaBackstory] = useState('')
  const selectedPersona = useMemo<PersonaOption>(
    () => personaOptions.find((option) => option.id === selectedPersonaId) ?? personaOptions[0]!,
    [selectedPersonaId]
  )

  useEffect(() => {
    if (!selectedPersona) return
    setPersonaCallsign((prev) => (prev.trim() ? prev : selectedPersona.sampleCallsign))
  }, [selectedPersona])

  useEffect(() => {
    if (!selectedPersona) return
    setPersonaBackstory((prev) =>
      prev.trim() ? prev : getLocaleText(selectedPersona.sampleStory, locale)
    )
  }, [selectedPersona, locale])

  // NEW: Interactive game state
  const [totalScore, setTotalScore] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [choiceFeedback, setChoiceFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [storyBlocked, setStoryBlocked] = useState(false) // NEW: Block story progression on wrong choices
  const [showEvaluation, setShowEvaluation] = useState(false) // NEW: Show evaluation screen
  const [scenarioScore, setScenarioScore] = useState(0) // NEW: Score for current scenario only
  
  // NEW: WhatsApp-style chat interface
  const [userMessages, setUserMessages] = useState<Array<{ id: string; text: string; timestamp: Date }>>([])
  const [ahmedResponses, setAhmedResponses] = useState<Array<{ id: string; text: string; timestamp: Date }>>([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  // WhatsApp conversations with characters - generate with user name
  const [whatsAppConversations, setWhatsAppConversations] = useState<Record<string, WhatsAppMessage[]>>(() => 
    generateWhatsAppConversations(userName)
  )
  const [whatsAppMessageCounters, setWhatsAppMessageCounters] = useState<Record<string, number>>({})
  const [selectedWhatsAppContact, setSelectedWhatsAppContact] = useState<string | null>(null)
  const notificationAudioRef = useRef<(() => void) | null>(null)
  
  // Update conversations when user name changes
  useEffect(() => {
    if (characterCreated && userName.trim()) {
      setWhatsAppConversations(generateWhatsAppConversations(userName))
    }
  }, [userName, characterCreated])

  const scenario = useMemo(() => {
    const found = storyScenarios.find((item) => item.id === activeScenarioId) ?? storyScenarios[0]
    const persona = selectedPersona ?? personaOptions[0]
    const trimmedName = userName.trim()
    const playerContext = {
      en: {
        name: trimmedName || 'Agent',
        personaTitle: persona.title.en,
        personaTagline: persona.tagline.en,
        callsign: personaCallsign.trim() || persona.sampleCallsign,
        backstory: personaBackstory.trim() || persona.sampleStory.en
      },
      ar: {
        name: trimmedName || 'اللاعب',
        personaTitle: persona.title.ar,
        personaTagline: persona.tagline.ar,
        callsign: personaCallsign.trim() || persona.sampleCallsign,
        backstory: personaBackstory.trim() || persona.sampleStory.ar
      }
    }

    const applyPlaceholders = (text: string, lang: Locale) => {
      if (!text) return text
      return text
        .replace(/\[USER_NAME\]/g, playerContext[lang].name)
        .replace(/\[USER_PERSONA_TITLE\]/g, playerContext[lang].personaTitle)
        .replace(/\[USER_PERSONA_TAGLINE\]/g, playerContext[lang].personaTagline)
        .replace(/\[USER_CALLSIGN\]/g, playerContext[lang].callsign)
        .replace(/\[USER_BACKSTORY\]/g, playerContext[lang].backstory)
    }

    const transformValue = (value: LocaleValue): LocaleValue => ({
      en: applyPlaceholders(value.en, 'en'),
      ar: applyPlaceholders(value.ar, 'ar')
    })

    return {
      ...found,
      label: transformValue(found.label),
      title: transformValue(found.title),
      tagline: transformValue(found.tagline),
      summary: transformValue(found.summary),
      runtime: transformValue(found.runtime),
      soundtrack: transformValue(found.soundtrack),
      scenes: found.scenes.map((scene) => ({
        ...scene,
        title: transformValue(scene.title),
        subtitle: transformValue(scene.subtitle),
        ambiance: transformValue(scene.ambiance),
        description: transformValue(scene.description),
        dialogues: scene.dialogues.map((dialogue) => ({
          ...dialogue,
          speaker: transformValue(dialogue.speaker),
          line: transformValue(dialogue.line)
        })),
        cues: scene.cues.map((cue) => transformValue(cue)),
        caution: transformValue(scene.caution),
        choices: scene.choices?.map((choice) => ({
          ...choice,
          text: transformValue(choice.text),
          feedback: transformValue(choice.feedback),
          consequence: transformValue(choice.consequence)
        }))
      })),
      lesson: {
        title: transformValue(found.lesson.title),
        summary: transformValue(found.lesson.summary),
        takeaways: found.lesson.takeaways.map((takeaway) => transformValue(takeaway))
      }
    }
  }, [activeScenarioId, personaBackstory, personaCallsign, selectedPersona, userName])

  const activeScenarioPosition = useMemo(() => {
    return storyScenarios.findIndex((item) => item.id === scenario.id)
  }, [scenario])

  const scene = scenario.scenes[sceneIndex]
  const isFirstGlobalScene = activeScenarioPosition === 0 && sceneIndex === 0
  const isLastGlobalScene =
    activeScenarioPosition === storyScenarios.length - 1 && sceneIndex === scenario.scenes.length - 1

  const handleScenarioChange = (nextScenarioId: string) => {
    setActiveScenarioId(nextScenarioId)
    setSceneIndex(0)
    setDialogueIndex(0)
    setIsPlaying(false)
    // Don't reset totalScore - keep it across scenarios
    setScenarioScore(0) // Reset scenario score
    setSelectedChoice(null)
    setChoiceFeedback(null)
    setHasAnswered(false)
    setStoryBlocked(false) // Reset story block
    setUserMessages([])
    setAhmedResponses([])
    setShowCustomInput(false)
    setCustomInput('')
    setIsTyping(false)
    setShowEvaluation(false)
  }

  const handleSceneSelect = (nextIndex: number) => {
    setSceneIndex(nextIndex)
    setDialogueIndex(0)
    setIsPlaying(false)
    setSelectedChoice(null)
    setChoiceFeedback(null)
    setHasAnswered(false)
    setStoryBlocked(false) // Reset story block
    setUserMessages([])
    setAhmedResponses([])
    setShowCustomInput(false)
    setCustomInput('')
    setIsTyping(false)
  }

  const handleChoiceSelect = (choice: StoryChoice) => {
    if (hasAnswered) return // Prevent multiple answers
    
    setSelectedChoice(choice.id)
    setHasAnswered(true)
    const pointsToAdd = choice.points
    setTotalScore(prev => prev + pointsToAdd)
    setScenarioScore(prev => prev + pointsToAdd)
    
    // Add user message to chat
    setUserMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      text: getLocaleText(choice.text, locale),
      timestamp: new Date()
    }])
    
    setChoiceFeedback({
      text: getLocaleText(choice.feedback, locale),
      isCorrect: choice.isCorrect
    })
    
    // NEW: Block story progression if choice is wrong
    if (!choice.isCorrect) {
      setStoryBlocked(true)
      return // Stop here, don't continue the story
    }
    
    // Show typing indicator then add Ahmed's response (only if choice is correct)
    // First response
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const firstResponse = {
          id: `ahmed-${Date.now()}-1`,
          text: getLocaleText(choice.consequence, locale),
          timestamp: new Date()
        }
        setAhmedResponses(prev => [...prev, firstResponse])
      }, 1500)
    }, 1000)
    
    // Second response - 4 seconds after first
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const secondResponse = {
          id: `ahmed-${Date.now()}-2`,
          text: locale === 'en' 
            ? 'Thanks for your help! I\'ll be more careful next time.' 
            : 'شكراً لمساعدتك! سأكون حذر أكثر المرة الجاية.',
          timestamp: new Date()
        }
        setAhmedResponses(prev => [...prev, secondResponse])
      }, 1500)
    }, 4000)
    
    // Third response - 7 seconds after first
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const thirdResponse = {
          id: `ahmed-${Date.now()}-3`,
          text: locale === 'en'
            ? 'Let me know if you see anything else suspicious.'
            : 'قول لي إذا شفت شي غريب ثاني.',
          timestamp: new Date()
        }
        setAhmedResponses(prev => [...prev, thirdResponse])
        
        // After all Ahmed's messages, wait a bit then automatically move to next scene
        setTimeout(() => {
          if (sceneIndex < scenario.scenes.length - 1) {
            setSceneIndex(prev => prev + 1)
            setDialogueIndex(0)
            setHasAnswered(false)
            setSelectedChoice(null)
            setChoiceFeedback(null)
            setUserMessages([])
            setAhmedResponses([])
            setIsTyping(false)
            setTimeout(() => {
              setIsPlaying(true)
            }, 1000)
          } else {
            setIsPlaying(false)
            setTimeout(() => {
              setShowEvaluation(true)
            }, 2000)
          }
        }, 3000)
      }, 1500)
    }, 7000)
  }

  const handleCustomReply = (replyText: string) => {
    if (!replyText.trim() || hasAnswered) return
    
    // Add user message
    const newMessage = {
      id: `msg-${Date.now()}`,
      text: replyText,
      timestamp: new Date()
    }
    setUserMessages(prev => [...prev, newMessage])
    setCustomInput('')
    setShowCustomInput(false)
    setHasAnswered(true)
    
    // Analyze reply and provide feedback
    const lowerReply = replyText.toLowerCase()
    const isSuspicious = lowerReply.includes('click') || lowerReply.includes('اضغط') || 
                        lowerReply.includes('hurry') || lowerReply.includes('استعجل') ||
                        lowerReply.includes('urgent') || lowerReply.includes('عاجل')
    const isCorrect = !isSuspicious && (
      lowerReply.includes('check') || lowerReply.includes('فحص') ||
      lowerReply.includes('verify') || lowerReply.includes('تأكد') ||
      lowerReply.includes('wait') || lowerReply.includes('انتظر') ||
      lowerReply.includes('don\'t') || lowerReply.includes('لا')
    )
    
    if (isCorrect) {
      setTotalScore(prev => prev + 10)
      setChoiceFeedback({
        text: locale === 'en' 
          ? '✅ Smart thinking! You chose to verify first.' 
          : '✅ تفكير ذكي! اخترت التحقق أولاً.',
        isCorrect: true
      })
    } else if (isSuspicious) {
      setTotalScore(prev => prev + 0)
      setStoryBlocked(true)
      setChoiceFeedback({
        text: locale === 'en' 
          ? '❌ Be careful! Urgency is a red flag in phishing.' 
          : '❌ احذر! الاستعجال علامة خطر في التصيد.',
        isCorrect: false
      })
      return // Stop here if wrong choice
    } else {
      setTotalScore(prev => prev + 5)
      setChoiceFeedback({
        text: locale === 'en' 
          ? '🤔 Good start, but make sure to verify the link first.' 
          : '🤔 بداية جيدة، لكن تأكد من فحص الرابط أولاً.',
        isCorrect: false
      })
    }
    
    // Show typing indicator and add Ahmed's response, then continue conversation
    // First response
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const firstResponse = {
          id: `ahmed-custom-${Date.now()}-1`,
          text: isCorrect 
            ? (locale === 'en' 
                ? 'Good thinking! Let me check that link more carefully...' 
                : 'تفكير جيد! خليني أفحص الرابط أكثر...')
            : (locale === 'en'
                ? 'Hmm, I\'m not sure about that. Let me think...'
                : 'همم، مو متأكد من هالشي. خليني أفكر...'),
          timestamp: new Date()
        }
        setAhmedResponses(prev => [...prev, firstResponse])
      }, 1500)
    }, 1000)
    
    // Second response - 4 seconds after first
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const secondResponse = {
          id: `ahmed-custom-${Date.now()}-2`,
          text: isCorrect
            ? (locale === 'en'
                ? 'Thanks for the advice! I really appreciate it.'
                : 'شكراً على النصيحة! أقدرها كثير.')
            : (locale === 'en'
                ? 'I see... I should be more careful with these things.'
                : 'فهمت... لازم أكون حذر أكثر في هالاشياء.'),
          timestamp: new Date()
        }
        setAhmedResponses(prev => [...prev, secondResponse])
      }, 1500)
    }, 4000)
    
    // Third response if correct - 7 seconds after first
    if (isCorrect) {
      setTimeout(() => {
        setIsTyping(true)
        setTimeout(() => {
          setIsTyping(false)
          const thirdResponse = {
            id: `ahmed-custom-${Date.now()}-3`,
            text: locale === 'en'
              ? 'I\'ll make sure to verify everything next time.'
              : 'راح أتأكد من كل شيء المرة الجاية.',
            timestamp: new Date()
          }
          setAhmedResponses(prev => [...prev, thirdResponse])
          
          // After all messages, move to next scene
          setTimeout(() => {
            if (sceneIndex < scenario.scenes.length - 1) {
              setSceneIndex(prev => prev + 1)
              setDialogueIndex(0)
              setHasAnswered(false)
              setSelectedChoice(null)
              setChoiceFeedback(null)
              setUserMessages([])
              setAhmedResponses([])
              setIsTyping(false)
              setTimeout(() => {
                setIsPlaying(true)
              }, 1000)
            } else {
              setIsPlaying(false)
              setTimeout(() => {
                setShowEvaluation(true)
              }, 2000)
            }
          }, 3000)
        }, 1500)
      }, 7000)
    } else {
      // If incorrect, wait then stop
      setTimeout(() => {
        setIsPlaying(false)
      }, 6000)
    }
  }

  const startMusic = async () => {
    if (typeof window === 'undefined' || musicOn) return

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return

      const context = new AudioCtx()
      const masterGain = context.createGain()
      masterGain.gain.value = 0.35
      masterGain.connect(context.destination)

      // Enhanced pad with richer harmonics
      const createPad = (freq: number, detune: number = 0, volume: number = 0.08) => {
        const osc = context.createOscillator()
        const gain = context.createGain()
        const filter = context.createBiquadFilter()
        const lfo = context.createOscillator()
        const lfoGain = context.createGain()
        const compressor = context.createDynamicsCompressor()
        
        osc.type = 'sawtooth'
        osc.frequency.value = freq
        osc.detune.value = detune
        
        gain.gain.value = volume
        filter.type = 'lowpass'
        filter.frequency.value = 1100
        filter.Q.value = 1.2

        lfo.type = 'sine'
        lfo.frequency.value = 0.02 + Math.random() * 0.03
        lfoGain.gain.value = 0.15 * volume
        lfo.connect(lfoGain)
        lfoGain.connect(filter.frequency)

        compressor.threshold.value = -24
        compressor.knee.value = 30
        compressor.ratio.value = 12
        compressor.attack.value = 0.003
        compressor.release.value = 0.25

        osc.connect(filter)
        filter.connect(compressor)
        compressor.connect(gain)
        gain.connect(masterGain)
        
        osc.start()
        lfo.start()

        return { osc, gain, filter, lfo, lfoGain, compressor }
      }

      // More layered pads for depth
      const padLayers = [
        createPad(82.41, 0, 0.1),  // E2
        createPad(164.81, -3, 0.08), // E3
        createPad(329.63, 5, 0.06), // E4
        createPad(246.94, 0, 0.05)  // B3
      ]

      // Atmospheric noise with better filtering
      const noiseBuffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5)
      }
      const noiseSource = context.createBufferSource()
      noiseSource.buffer = noiseBuffer
      noiseSource.loop = true

      const noiseFilter = context.createBiquadFilter()
      noiseFilter.type = 'bandpass'
      noiseFilter.frequency.value = 350
      noiseFilter.Q.value = 1.0

      const noiseGain = context.createGain()
      noiseGain.gain.value = 0.025

      noiseSource.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(masterGain)
      noiseSource.start()

      // Rhythmic pulse with varying intensity
      const pulseOsc = context.createOscillator()
      pulseOsc.type = 'triangle'
      pulseOsc.frequency.value = 180
      const pulseGain = context.createGain()
      pulseGain.gain.value = 0
      const pulseFilter = context.createBiquadFilter()
      pulseFilter.type = 'lowpass'
      pulseFilter.frequency.value = 400
      
      pulseOsc.connect(pulseFilter)
      pulseFilter.connect(pulseGain)
      pulseGain.connect(masterGain)
      pulseOsc.start()

      let pulseCount = 0
      const triggerPulse = () => {
        const now = context.currentTime
        pulseGain.gain.cancelScheduledValues(now)
        const intensity = 0.25 + Math.sin(pulseCount * 0.3) * 0.1
        pulseGain.gain.setValueAtTime(0.0001, now)
        pulseGain.gain.exponentialRampToValueAtTime(intensity, now + 0.015)
        pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
        pulseCount++
      }
      triggerPulse()
      const pulseInterval = window.setInterval(triggerPulse, 1200)

      // Deep bass layer
      const bassOsc = context.createOscillator()
      bassOsc.type = 'sine'
      bassOsc.frequency.value = 41.2  // E1
      const bassGain = context.createGain()
      bassGain.gain.value = 0.03
      const bassFilter = context.createBiquadFilter()
      bassFilter.type = 'lowpass'
      bassFilter.frequency.value = 200
      
      bassOsc.connect(bassFilter)
      bassFilter.connect(bassGain)
      bassGain.connect(masterGain)
      bassOsc.start()

      // Subtle modulation
      const modOsc = context.createOscillator()
      modOsc.type = 'sine'
      modOsc.frequency.value = 0.15
      const modGain = context.createGain()
      modGain.gain.value = 0.05
      modOsc.connect(modGain)
      modGain.connect(masterGain.gain)
      modOsc.start()

      ;(audioRef as any).current = {
        context,
        masterGain,
        padLayers,
        noise: { source: noiseSource, filter: noiseFilter, gain: noiseGain },
        pulse: { osc: pulseOsc, gain: pulseGain, filter: pulseFilter, interval: pulseInterval },
        bass: { osc: bassOsc, gain: bassGain, filter: bassFilter },
        mod: { osc: modOsc, gain: modGain }
      }
      setMusicOn(true)
    } catch (error) {
      console.error('Failed to start music:', error)
    }
  }

  const stopMusic = () => {
    try {
      const audioData = (audioRef as any).current
      if (audioData) {
        const { context, masterGain, padLayers, noise, pulse, bass, mod } = audioData
        const now = context.currentTime

        if (pulse?.interval) {
          window.clearInterval(pulse.interval)
        }

        if (masterGain) {
          masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
        }

        padLayers?.forEach((layer: any) => {
          try {
            layer.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
            layer.osc.stop(now + 0.8)
            layer.lfo.stop(now + 0.8)
          } catch {
            // ignore
          }
        })

        try {
          noise?.source?.stop(now + 0.5)
        } catch {
          // ignore
        }

        try {
          pulse?.osc?.stop(now + 0.7)
        } catch {
          // ignore
        }

        try {
          bass?.osc?.stop(now + 0.7)
        } catch {
          // ignore
        }

        try {
          mod?.osc?.stop(now + 0.6)
        } catch {
          // ignore
        }

        setTimeout(() => {
          try {
            context.close()
          } catch {
            // ignore
          }
        }, 1000)
      }
      audioRef.current = null
      setMusicOn(false)
    } catch (error) {
      console.error('Failed to stop music:', error)
    }
  }

  // إنشاء صوت إشعار واتساب
  useEffect(() => {
    const playNotificationSound = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) return

        const context = new AudioContext()
        
        // صوت إشعار واتساب (نغمة متعددة)
        const oscillator1 = context.createOscillator()
        const oscillator2 = context.createOscillator()
        const gainNode = context.createGain()
        
        oscillator1.type = 'sine'
        oscillator1.frequency.setValueAtTime(800, context.currentTime)
        oscillator1.frequency.setValueAtTime(600, context.currentTime + 0.1)
        oscillator1.frequency.setValueAtTime(800, context.currentTime + 0.2)
        
        oscillator2.type = 'sine'
        oscillator2.frequency.setValueAtTime(600, context.currentTime)
        oscillator2.frequency.setValueAtTime(800, context.currentTime + 0.1)
        oscillator2.frequency.setValueAtTime(600, context.currentTime + 0.2)
        
        gainNode.gain.setValueAtTime(0, context.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.05)
        gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.3)
        
        oscillator1.connect(gainNode)
        oscillator2.connect(gainNode)
        gainNode.connect(context.destination)
        
        oscillator1.start(context.currentTime)
        oscillator2.start(context.currentTime)
        oscillator1.stop(context.currentTime + 0.3)
        oscillator2.stop(context.currentTime + 0.3)
        
        setTimeout(() => context.close(), 500)
      } catch (error) {
        console.error('Error playing notification sound:', error)
      }
    }

    notificationAudioRef.current = playNotificationSound
  }, [])

  // إضافة رسائل جديدة تدريجياً مع صوت الإشعار
  useEffect(() => {
    if (!isImmersiveMode || !characterCreated) return

    const timers: NodeJS.Timeout[] = []

    incomingWhatsAppMessages.forEach((msg) => {
      const timer = setTimeout(() => {
        const newMsg: WhatsAppMessage = {
          id: `new-${Date.now()}-${Math.random()}`,
          contactId: msg.contactId,
          text: msg.text,
          timestamp: new Date(),
          isRead: false,
          isDelivered: true,
          isOutgoing: false
        }

        setWhatsAppConversations((prev) => ({
          ...prev,
          [msg.contactId]: [...(prev[msg.contactId] || []), newMsg]
        }))

        setWhatsAppMessageCounters((prev) => ({
          ...prev,
          [msg.contactId]: (prev[msg.contactId] || 0) + 1
        }))

        // تشغيل صوت الإشعار
        if (notificationAudioRef.current) {
          notificationAudioRef.current()
        }
      }, msg.delay)

      timers.push(timer)
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [isImmersiveMode, characterCreated])

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [dialogueIndex, userMessages, ahmedResponses, isTyping])

  // Auto-play dialogue with typing effect
  useEffect(() => {
    if (!isPlaying) return

    const currentScene = scenario.scenes[sceneIndex]
    if (!currentScene) {
      setIsPlaying(false)
      return
    }

    // If we've shown all dialogues in this scene
    if (dialogueIndex >= currentScene.dialogues.length - 1) {
      setIsPlaying(false)
      
      // If this scene doesn't need a choice and it's the last scene, show evaluation
      if (!currentScene.needsChoice && sceneIndex === scenario.scenes.length - 1) {
        setTimeout(() => {
          setShowEvaluation(true)
        }, 2000)
      }
      // If this scene doesn't need a choice but there are more scenes, auto-advance
      else if (!currentScene.needsChoice && sceneIndex < scenario.scenes.length - 1) {
        setTimeout(() => {
          setSceneIndex(prev => prev + 1)
          setDialogueIndex(0)
          setUserMessages([])
          setAhmedResponses([])
          setIsPlaying(true)
        }, 2000)
      }
      return
    }

    const timer = setTimeout(() => {
      setDialogueIndex((prev) => {
        // Don't go beyond the last dialogue
        if (prev >= currentScene.dialogues.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 3000) // Show each dialogue for 3 seconds

    return () => clearTimeout(timer)
  }, [isPlaying, dialogueIndex, sceneIndex, scenario])

  useEffect(() => {
    return () => {
      stopMusic()
    }
  }, [])

  const handleCreateCharacter = () => {
    if (userName.trim() && personaCallsign.trim()) {
      setCharacterCreated(true)
      setShowCharacterCreation(false)
      setIsImmersiveMode(true)
      setScenarioScore(0) // Reset scenario score
      setShowEvaluation(false) // Reset evaluation
      // Start music automatically
      setTimeout(() => {
        startMusic()
      }, 500)
      // Auto-start the story
      setTimeout(() => {
        setIsPlaying(true)
      }, 1000)
    }
  }

  const handleNext = () => {
    setDialogueIndex(0)
    setIsPlaying(false)
    setSelectedChoice(null)
    setChoiceFeedback(null)
    setHasAnswered(false)
    setStoryBlocked(false) // Reset story block
    setUserMessages([])
    setAhmedResponses([])
    setShowCustomInput(false)
    setCustomInput('')
    setIsTyping(false)
    
    if (sceneIndex < scenario.scenes.length - 1) {
      setSceneIndex((prev) => prev + 1)
      return
    }

    const nextScenario = storyScenarios[activeScenarioPosition + 1]
    if (nextScenario) {
      setActiveScenarioId(nextScenario.id)
      setSceneIndex(0)
      // Keep the score across scenarios
    }
  }

  const handlePrev = () => {
    setDialogueIndex(0)
    setIsPlaying(false)
    setSelectedChoice(null)
    setChoiceFeedback(null)
    setHasAnswered(false)
    setStoryBlocked(false) // Reset story block
    setUserMessages([])
    setAhmedResponses([])
    setShowCustomInput(false)
    setCustomInput('')
    setIsTyping(false)
    
    if (sceneIndex > 0) {
      setSceneIndex((prev) => prev - 1)
      return
    }

    const previousScenario = storyScenarios[activeScenarioPosition - 1]
    if (previousScenario) {
      setActiveScenarioId(previousScenario.id)
      setSceneIndex(previousScenario.scenes.length - 1)
    }
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
    } else {
      setDialogueIndex(0)
      setIsPlaying(true)
    }
  }

  // Calculate maximum possible score for current scenario
  const calculateMaxScore = (scenario: StoryScenario): number => {
    return scenario.scenes.reduce((max, scene) => {
      if (scene.choices) {
        const maxChoicePoints = Math.max(...scene.choices.map(c => c.points))
        return max + maxChoicePoints
      }
      return max
    }, 0)
  }

  // Get personalized evaluation based on score
  const getEvaluation = () => {
    const maxScore = calculateMaxScore(scenario)
    const percentage = maxScore > 0 ? (scenarioScore / maxScore) * 100 : 0
    
    if (percentage >= 90) {
      return {
        title: locale === 'en' ? '🏆 Expert Level' : '🏆 مستوى خبير',
        description: locale === 'en' 
          ? 'Outstanding! You demonstrated expert-level cybersecurity awareness.'
          : 'ممتاز! أظهرت وعيًا أمنيًا على مستوى الخبراء.',
        strengths: locale === 'en' 
          ? ['Perfect threat detection', 'Excellent decision-making', 'Strong analytical skills']
          : ['كشف مثالي للتهديدات', 'قرارات ممتازة', 'مهارات تحليلية قوية'],
        improvements: locale === 'en'
          ? ['Keep sharing your knowledge with others!']
          : ['استمر في مشاركة معرفتك مع الآخرين!'],
        advice: locale === 'en'
          ? 'You are a cybersecurity champion. Consider mentoring others to spread awareness.'
          : 'أنت بطل في الأمن السيبراني. فكر في إرشاد الآخرين لنشر الوعي.'
      }
    } else if (percentage >= 70) {
      return {
        title: locale === 'en' ? '⭐ Advanced Level' : '⭐ مستوى متقدم',
        description: locale === 'en'
          ? 'Great job! You showed strong cybersecurity instincts.'
          : 'عمل رائع! أظهرت غرائز أمنية قوية.',
        strengths: locale === 'en'
          ? ['Good threat awareness', 'Solid decision-making', 'Quick thinking']
          : ['وعي جيد بالتهديدات', 'قرارات سليمة', 'تفكير سريع'],
        improvements: locale === 'en'
          ? ['Double-check suspicious links', 'Verify sender identities more thoroughly']
          : ['تحقق مرتين من الروابط المشبوهة', 'تحقق من هويات المرسلين بشكل أعمق'],
        advice: locale === 'en'
          ? 'You\'re on the right track. Practice makes perfect - keep learning!'
          : 'أنت على الطريق الصحيح. الممارسة تصنع الكمال - استمر في التعلم!'
      }
    } else if (percentage >= 50) {
      return {
        title: locale === 'en' ? '🎯 Good Start' : '🎯 بداية جيدة',
        description: locale === 'en'
          ? 'Not bad! You have the basics, but there\'s room for improvement.'
          : 'ليس سيئًا! لديك الأساسيات، لكن هناك مجال للتحسين.',
        strengths: locale === 'en'
          ? ['Basic awareness', 'Willingness to learn']
          : ['وعي أساسي', 'رغبة في التعلم'],
        improvements: locale === 'en'
          ? ['Always verify before clicking', 'Question urgent requests', 'Check domain names carefully']
          : ['تحقق دائمًا قبل الضغط', 'شكك في الطلبات العاجلة', 'افحص أسماء النطاقات بعناية'],
        advice: locale === 'en'
          ? 'Take your time with security decisions. When in doubt, verify first!'
          : 'خذ وقتك في القرارات الأمنية. عند الشك، تحقق أولاً!'
      }
    } else {
      return {
        title: locale === 'en' ? '📚 Learning Mode' : '📚 وضع التعلم',
        description: locale === 'en'
          ? 'Every expert was once a beginner. Keep practicing!'
          : 'كل خبير كان مبتدئًا يومًا. استمر في الممارسة!',
        strengths: locale === 'en'
          ? ['You\'re learning', 'Awareness is growing']
          : ['أنت تتعلم', 'الوعي ينمو'],
        improvements: locale === 'en'
          ? ['Never click suspicious links', 'Always verify sender identity', 'Take time to think before acting', 'Ask for help when unsure']
          : ['لا تضغط على الروابط المشبوهة أبدًا', 'تحقق دائمًا من هوية المرسل', 'خذ وقتك للتفكير قبل التصرف', 'اطلب المساعدة عند الشك'],
        advice: locale === 'en'
          ? 'Remember: Real organizations never rush you. When something feels urgent, it\'s often a scam. Take your time!'
          : 'تذكر: المؤسسات الحقيقية لا تستعجلك أبدًا. عندما يبدو شيء عاجلًا، غالبًا ما يكون احتيالًا. خذ وقتك!'
      }
    }
  }

  const nextButtonLabel = sceneIndex === scenario.scenes.length - 1
    ? activeScenarioPosition === storyScenarios.length - 1
      ? locale === 'en'
        ? 'Restart story'
        : 'إعادة القصة'
      : locale === 'en'
        ? 'Next scenario'
        : 'السيناريو التالي'
    : locale === 'en'
      ? 'Next scene'
      : 'المشهد التالي'

  const prevButtonLabel = sceneIndex === 0
    ? activeScenarioPosition === 0
      ? locale === 'en'
        ? 'At beginning'
        : 'نقطة البداية'
      : locale === 'en'
        ? 'Previous scenario'
        : 'السيناريو السابق'
    : locale === 'en'
      ? 'Previous scene'
      : 'المشهد السابق'

  // Character creation screen
  if (showCharacterCreation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">
              {locale === 'en' ? '🎮 Create Your Character' : '🎮 أنشئ شخصيتك'}
            </h1>
            <p className="text-lg text-white/80">
              {locale === 'en' 
                ? 'Give us a name, a codename, and the vibe you want to bring into the story.'
                : 'عطنا اسمك، اسمك الحركي، والمزاج اللي تبغى تدخله في القصة.'}
            </p>
          </div>
          
          <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  {locale === 'en' ? 'Your Name' : 'اسمك'}
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCharacter()}
                  placeholder={locale === 'en' ? 'Enter your name...' : 'أدخل اسمك...'}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  {locale === 'en' ? 'Codename' : 'اسمك الحركي'}
                </label>
                <input
                  type="text"
                  value={personaCallsign}
                  onChange={(e) => setPersonaCallsign(e.target.value)}
                  placeholder={selectedPersona?.sampleCallsign ?? 'الرادار'}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                {locale === 'en' ? 'Choose your persona vibe' : 'اختر نوع شخصيتك'}
              </label>
              <div className="grid gap-3 md:grid-cols-3">
                {personaOptions.map((option) => {
                  const isActive = option.id === selectedPersonaId
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedPersonaId(option.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? 'border-white/70 bg-white/15 text-white'
                          : 'border-white/20 bg-white/5 text-white/70 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>{getLocaleText(option.title, locale)}</span>
                        <span className="text-xs uppercase tracking-[0.3em] opacity-80">
                          {option.sampleCallsign}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/80">
                        {getLocaleText(option.tagline, locale)}
                      </p>
                      <p className="mt-2 text-xs text-white/60">
                        {getLocaleText(option.description, locale)}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                {locale === 'en' ? 'Backstory' : 'حكاية شخصيتك'}
              </label>
              <textarea
                value={personaBackstory}
                onChange={(e) => setPersonaBackstory(e.target.value)}
                placeholder={getLocaleText(selectedPersona?.sampleStory ?? personaOptions[0].sampleStory, locale)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent min-h-[120px]"
              />
              <p className="mt-2 text-xs text-white/60">
                {locale === 'en'
                  ? 'Give Ahmed a reason to trust your instincts.'
                  : 'خل محمد يعرف ليه يثق في إحساسك.'}
              </p>
            </div>
            
            <Button
              onClick={handleCreateCharacter}
              disabled={!userName.trim() || !personaCallsign.trim()}
              className="w-full bg-white text-black hover:bg-white/90 text-lg py-6"
            >
              {locale === 'en' ? 'Start Adventure' : 'ابدأ المغامرة'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-500 ${isImmersiveMode ? 'bg-slate-900' : 'bg-background'}`}>
      {isImmersiveMode ? (
        // Immersive Game Mode - Full Screen WhatsApp Experience with Browser Tabs
        <div className="h-full w-full flex flex-col relative overflow-hidden bg-gray-100">
          {/* Browser Window Frame - Like Chrome/WhatsApp Web */}
          <div className="relative z-30 bg-gray-200 border-b border-gray-300">
            {/* Browser Tabs Bar */}
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-200 overflow-x-auto">
              {/* Active Tab - WhatsApp */}
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-t-lg border border-b-0 border-gray-300 min-w-[200px]">
                <div className="w-4 h-4 rounded-full bg-green-500 flex-shrink-0"></div>
                <span className="text-sm text-gray-700 truncate">
                  {locale === 'en' ? 'WhatsApp' : 'واتساب'}
                </span>
                <div className="ml-auto flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                </div>
              </div>
              {/* Other Tabs */}
              <div className="flex items-center gap-1 px-3 py-2 bg-gray-300 rounded-t-lg min-w-[150px] opacity-70">
                <span className="text-xs text-gray-600 truncate">YouTube</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-2 bg-gray-300 rounded-t-lg min-w-[150px] opacity-70">
                <span className="text-xs text-gray-600 truncate">Gmail</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-2 bg-gray-300 rounded-t-lg min-w-[150px] opacity-70">
                <span className="text-xs text-gray-600 truncate">Teams</span>
              </div>
              {/* Plus button for new tab */}
              <button className="px-2 py-2 text-gray-500 hover:bg-gray-300 rounded">
                <span className="text-lg">+</span>
              </button>
            </div>
            
            {/* Browser Address Bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-300">
              <div className="flex gap-1">
                <button className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                  <span className="text-xs">↻</span>
                </button>
              </div>
              <div className="flex-1 flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-lg">
                <span className="text-xs text-gray-500">🔒</span>
                <span className="text-sm text-gray-700 flex-1">web.whatsapp.com</span>
              </div>
            </div>
          </div>
          
          {/* WhatsApp Content Area - Split Layout like WhatsApp Web */}
          <div className="flex-1 flex relative overflow-hidden" style={{ background: '#f0f2f5' }}>
            {/* Left Sidebar - Chat List */}
            <div className="w-[30%] min-w-[300px] flex flex-col bg-white border-r border-gray-300">
              {/* Search Bar */}
              <div className="p-3 bg-[#f0f2f5] border-b border-gray-200">
                <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg">
                  <span className="text-gray-400 text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder={locale === 'en' ? 'Search or start new chat' : 'البحث عن دردشة أو بدء دردشة جديدة'}
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                    readOnly
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 px-3 py-2 bg-white border-b border-gray-200">
                <button className="px-4 py-2 text-sm font-medium text-[#008069] border-b-2 border-[#008069]">
                  {locale === 'en' ? 'All' : 'الكل'}
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  {locale === 'en' ? 'Unread' : 'غير مقروء'}
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  {locale === 'en' ? 'Favorites' : 'المفضلة'}
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  {locale === 'en' ? 'Groups' : 'المجموعات'}
                </button>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto bg-white">
                {/* Active Chat - Highlighted (Ahmed) */}
                <div 
                  onClick={() => setSelectedWhatsAppContact(null)}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer border-l-4 border-[#008069] ${
                    !selectedWhatsAppContact ? 'bg-[#f0f2f5]' : 'bg-white'
                  }`}
                >
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {getLocaleText(scenario.characters.find(c => c.id === 'mohammed')?.name ?? { en: 'Ahmed', ar: 'أحمد' }, locale).charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getLocaleText(scenario.characters.find(c => c.id === 'mohammed')?.name ?? { en: 'Ahmed', ar: 'أحمد' }, locale)}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {locale === 'en' ? 'Yesterday' : 'أمس'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 truncate">
                        {locale === 'en' ? 'Excellent' : 'تم ممتاز'}
                      </span>
                      <span className="text-[#008069] text-xs">✓✓</span>
                    </div>
                  </div>
                </div>

                {/* Other Chats - Real Characters */}
                {whatsAppContacts.map((contact) => {
                  const messages = whatsAppConversations[contact.id] || []
                  const lastMessage = messages[messages.length - 1]
                  const unreadCount = whatsAppMessageCounters[contact.id] || 0
                  const isSelected = selectedWhatsAppContact === contact.id
                  
                  const formatTime = (date: Date) => {
                    const now = new Date()
                    const diff = now.getTime() - date.getTime()
                    const hours = Math.floor(diff / (1000 * 60 * 60))
                    if (hours < 1) {
                      const minutes = Math.floor(diff / (1000 * 60))
                      return minutes < 1 ? 'الآن' : `منذ ${minutes} دقيقة`
                    } else if (hours < 24) {
                      return `منذ ${hours} ساعة`
                    } else {
                      return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
                    }
                  }

                  return (
                    <div
                      key={contact.id}
                      onClick={() => {
                        setSelectedWhatsAppContact(contact.id)
                        // إزالة العداد عند فتح المحادثة
                        if (unreadCount > 0) {
                          setWhatsAppMessageCounters((prev) => ({ ...prev, [contact.id]: 0 }))
                          // تحديث حالة الرسائل إلى مقروءة
                          setWhatsAppConversations((prev) => {
                            const updated = { ...prev }
                            if (updated[contact.id]) {
                              updated[contact.id] = updated[contact.id].map((msg) => ({
                                ...msg,
                                isRead: true
                              }))
                            }
                            return updated
                          })
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-[#f5f6f6] cursor-pointer relative ${
                        isSelected ? 'bg-[#e9edef]' : ''
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="h-12 w-12 rounded-full flex-shrink-0 object-cover"
                          loading="lazy"
                        />
                        {contact.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {contact.name}
                          </p>
                          {lastMessage && (
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {formatTime(lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          {lastMessage && (
                            <p className="text-xs text-gray-500 truncate">
                              {lastMessage.text}
                            </p>
                          )}
                          {unreadCount > 0 && (
                            <span className="bg-[#25d366] text-white text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 min-w-[20px] text-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Side - Chat Window */}
            <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: '#efeae2' }}>
              {/* Chat Pattern Background */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23000000'/%3E%3Cpath d='M0 0l100 100M100 0L0 100' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E")`,
                  backgroundSize: '100px 100px'
                }}
              />
              
              {/* Chat Header */}
              <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-[#f0f2f5] border-b border-gray-300">
                <div className="flex items-center gap-3">
                  {selectedWhatsAppContact && (
                    <button
                      onClick={() => setSelectedWhatsAppContact(null)}
                      className="text-gray-600 hover:text-gray-800 transition p-1"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  )}
                  {!selectedWhatsAppContact && (
                    <button
                      onClick={() => {
                        setIsImmersiveMode(false)
                        stopMusic()
                      }}
                      className="text-gray-600 hover:text-gray-800 transition p-1"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  )}
                  {selectedWhatsAppContact ? (
                    <>
                      <img
                        src={whatsAppContacts.find(c => c.id === selectedWhatsAppContact)?.avatar || ''}
                        alt={whatsAppContacts.find(c => c.id === selectedWhatsAppContact)?.name || ''}
                        className="h-10 w-10 rounded-full flex-shrink-0 object-cover"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {whatsAppContacts.find(c => c.id === selectedWhatsAppContact)?.name || ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {whatsAppContacts.find(c => c.id === selectedWhatsAppContact)?.isOnline ? (
                            <>
                              {locale === 'en' ? 'Online' : 'متصل'}
                              <span className="inline-block w-2 h-2 bg-[#00a884] rounded-full ml-2" />
                            </>
                          ) : (
                            whatsAppContacts.find(c => c.id === selectedWhatsAppContact)?.lastSeen || ''
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {getLocaleText(scenario.characters.find(c => c.id === 'mohammed')?.name ?? { en: 'Ahmed', ar: 'أحمد' }, locale).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {getLocaleText(scenario.characters.find(c => c.id === 'mohammed')?.name ?? { en: 'Ahmed', ar: 'أحمد' }, locale)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {locale === 'en' ? 'Online' : 'متصل'}
                          <span className="inline-block w-2 h-2 bg-[#00a884] rounded-full ml-2" />
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!selectedWhatsAppContact && (
                    <div className="text-gray-600 text-xs font-medium px-2 py-1 bg-white rounded">
                      {locale === 'en' ? 'Score' : 'النقاط'}: <span className="text-[#008069] font-semibold">{totalScore}</span>
                    </div>
                  )}
                  <button
                    onClick={musicOn ? stopMusic : startMusic}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition"
                  >
                    {musicOn ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                </div>
              </div>

            {/* Main Chat Area - WhatsApp Web Style */}
            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
            {/* Scrollable Chat Messages Area - WhatsApp Web Style */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-2"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="max-w-4xl mx-auto py-4">
                {/* Chat Messages */}
                <div className="space-y-1">
                  {selectedWhatsAppContact ? (
                    // عرض محادثة الشخصية المختارة
                    (() => {
                      const contactMessages = whatsAppConversations[selectedWhatsAppContact] || []
                      return contactMessages.map((msg, idx) => {
                        const prevMsg = idx > 0 ? contactMessages[idx - 1] : null
                        const showDate = !prevMsg || 
                          Math.abs(msg.timestamp.getTime() - prevMsg.timestamp.getTime()) > 5 * 60 * 1000
                        
                        const formatTime = (date: Date) => {
                          return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                        }
                        
                        const formatDate = (date: Date) => {
                          const now = new Date()
                          const diff = now.getTime() - date.getTime()
                          const hours = Math.floor(diff / (1000 * 60 * 60))
                          if (hours < 1) {
                            const minutes = Math.floor(diff / (1000 * 60))
                            return minutes < 1 ? 'الآن' : `منذ ${minutes} دقيقة`
                          } else if (hours < 24) {
                            return `منذ ${hours} ساعة`
                          } else {
                            return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
                          }
                        }

                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="text-center my-4">
                                <span className="bg-[#f0f2f5] text-[#667781] text-xs px-3 py-1 rounded">
                                  {formatDate(msg.timestamp)}
                                </span>
                              </div>
                            )}
                            <div className={`flex mb-2 ${msg.isOutgoing ? 'justify-end' : 'justify-start'}`}>
                              <div
                                className={`max-w-[65%] rounded-lg px-3 py-2 shadow-sm ${
                                  msg.isOutgoing
                                    ? 'bg-[#dcf8c6] rounded-tr-none'
                                    : 'bg-white rounded-tl-none'
                                }`}
                                style={{ 
                                  fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif'
                                }}
                              >
                                <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${
                                  msg.isOutgoing ? 'text-[#111b21]' : 'text-[#111b21]'
                                }`}>
                                  {msg.text}
                                </p>
                                <div className="flex items-center justify-end gap-1 mt-1">
                                  <span className="text-[0.6875rem] text-[#667781]" style={{ fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
                                    {formatTime(msg.timestamp)}
                                  </span>
                                  {msg.isOutgoing && (
                                    <span className="ml-1">
                                      {msg.isRead ? (
                                        <span className="text-[#53bdeb] text-xs">✓✓</span>
                                      ) : msg.isDelivered ? (
                                        <span className="text-[#667781] text-xs">✓✓</span>
                                      ) : (
                                        <span className="text-[#667781] text-xs">✓</span>
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()
                  ) : (
                    // عرض محادثة أحمد (الافتراضية)
                    <>
                      {/* Ahmed's messages - Show all dialogues up to current index */}
                      {scene.dialogues.slice(0, dialogueIndex + 1).map((dialogue, idx) => (
                        <div 
                          key={`${scene.id}-dialogue-${idx}`} 
                          className="flex justify-start mb-1 animate-slide-in-left"
                          style={{ animationDelay: `${idx * 300}ms` }}
                        >
                          <div className="max-w-[65%] relative group">
                            <div 
                              className="rounded-lg px-2 py-1 shadow-sm"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderRadius: '7.5px 7.5px 7.5px 0px'
                              }}
                            >
                              <p className="text-sm text-[#111b21] leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
                                {getLocaleText(dialogue.line, locale)}
                              </p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[0.6875rem] text-[#667781]" style={{ fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
                                  {new Date().toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* User's messages */}
                      {userMessages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className="flex justify-end mb-1 animate-slide-in-right"
                        >
                          <div className="max-w-[65%] relative group">
                            <div 
                              className="rounded-lg px-2 py-1 shadow-sm"
                              style={{ 
                                backgroundColor: '#dcf8c6',
                                borderRadius: '7.5px 0px 7.5px 7.5px'
                              }}
                            >
                              <p className="text-sm text-[#111b21] leading-relaxed" style={{ fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
                                {msg.text}
                              </p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[0.6875rem] text-[#667781]" style={{ fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
                                  {msg.timestamp.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[#53bdeb] text-xs">✓✓</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Ahmed's responses after user choices */}
                      {ahmedResponses.map((msg) => (
                        <div 
                          key={msg.id} 
                          className="flex justify-start mb-1 animate-slide-in-left"
                        >
                          <div className="max-w-[65%] relative group">
                            <div 
                              className="rounded-lg px-2 py-1 shadow-sm"
                              style={{ 
                                backgroundColor: '#ffffff',
                                borderRadius: '7.5px 7.5px 7.5px 0px'
                              }}
                            >
                              <p className="text-sm text-[#111b21] leading-relaxed" style={{ fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
                                {msg.text}
                              </p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-[0.6875rem] text-[#667781]" style={{ fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif' }}>
                                  {msg.timestamp.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Typing indicator - WhatsApp style */}
                      {isTyping && (
                        <div className="flex justify-start mb-1 animate-fade-in">
                          <div 
                            className="rounded-lg px-4 py-3 shadow-sm"
                            style={{ 
                              backgroundColor: '#ffffff',
                              borderRadius: '7.5px 7.5px 7.5px 0px'
                            }}
                          >
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-[#667781] rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }} />
                              <span className="w-2 h-2 bg-[#667781] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }} />
                              <span className="w-2 h-2 bg-[#667781] rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Message Input Bar - WhatsApp Web Style */}
            {/* لا تعرض input bar للمحادثات الأخرى - فقط لمحادثة أحمد */}
            {selectedWhatsAppContact ? (
              <div className="relative z-20 px-4 py-3 bg-[#f0f2f5] border-t border-gray-300">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">
                    <span className="text-xl">+</span>
                  </button>
                  <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white rounded-full">
                    <input
                      type="text"
                      placeholder={locale === 'en' ? 'Type a message' : 'اكتب رسالة'}
                      className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                      readOnly
                    />
                  </div>
                  <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">
                    <span className="text-xl">🎤</span>
                  </button>
                </div>
              </div>
            ) : !scene.needsChoice || hasAnswered || storyBlocked || isPlaying || dialogueIndex < scene.dialogues.length - 1 ? (
              <div className="relative z-20 px-4 py-3 bg-[#f0f2f5] border-t border-gray-300">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">
                    <span className="text-xl">+</span>
                  </button>
                  <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white rounded-full">
                    <input
                      type="text"
                      placeholder={locale === 'en' ? 'Type a message' : 'اكتب رسالة'}
                      className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                      readOnly
                    />
                  </div>
                  <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition">
                    <span className="text-xl">🎤</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Fixed Choices Section at Bottom - Only show after all dialogues are shown and auto-play has stopped AND user is in Ahmed's chat */}
            {!selectedWhatsAppContact && scene.needsChoice && scene.choices && scene.choices.length > 0 && !hasAnswered && !storyBlocked && !isPlaying && dialogueIndex >= scene.dialogues.length - 1 && (
              <div className="relative z-20 border-t border-gray-300 bg-[#f0f2f5] px-4 py-4">
                <div className="max-w-4xl mx-auto space-y-4">
                  {/* Prompt message */}
                  <div className="text-center mb-4">
                    <p className="text-gray-800 text-lg font-semibold">
                      {locale === 'en' ? '💬 How would you respond?' : '💬 كيف ترد؟'}
                    </p>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Button
                      onClick={() => setShowCustomInput(false)}
                      variant={!showCustomInput ? "primary" : "outline"}
                      className={!showCustomInput ? "bg-[#008069] hover:bg-[#006b57] text-white" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}
                      size="sm"
                    >
                      {locale === 'en' ? 'Use suggestions' : 'استخدم الاقتراحات'}
                    </Button>
                    <Button
                      onClick={() => setShowCustomInput(true)}
                      variant={showCustomInput ? "primary" : "outline"}
                      className={showCustomInput ? "bg-[#008069] hover:bg-[#006b57] text-white" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}
                      size="sm"
                    >
                      {locale === 'en' ? 'Write my own' : 'اكتب بنفسي'}
                    </Button>
                  </div>

                  {!showCustomInput ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {scene.choices.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => handleChoiceSelect(choice)}
                          className="relative overflow-hidden rounded-lg border border-gray-300 bg-white hover:bg-gray-50 hover:shadow-md p-4 text-left cursor-pointer transform transition-all duration-200 ease-out"
                        >
                          <p className="text-sm font-medium text-gray-900 leading-relaxed">
                            {getLocaleText(choice.text, locale)}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder={locale === 'en' ? 'Type your reply to Ahmed...' : 'اكتب ردك لأحمد...'}
                        className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#008069] resize-none"
                        rows={4}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && customInput.trim()) {
                            e.preventDefault()
                            handleCustomReply(customInput.trim())
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        onClick={() => handleCustomReply(customInput.trim())}
                        disabled={!customInput.trim()}
                        className="w-full bg-[#008069] hover:bg-[#006b57] text-white"
                      >
                        {locale === 'en' ? 'Send Reply' : 'إرسال الرد'}
                      </Button>
                    </div>
                  )}

                  {/* Feedback */}
                  {choiceFeedback && (
                    <div className={`
                      rounded-lg border p-4 text-center animate-slide-up
                      ${choiceFeedback.isCorrect 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-red-500 bg-red-50'
                      }
                    `}>
                      <p className="text-base font-semibold text-gray-900">
                        {choiceFeedback.text}
                      </p>
                      {!choiceFeedback.isCorrect && (
                        <p className="text-sm text-gray-700 mt-2">
                          {locale === 'en' 
                            ? 'The story cannot continue. Please try again with a different choice.' 
                            : 'القصة لا يمكن أن تستمر. يرجى المحاولة مرة أخرى باختيار مختلف.'}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Story Blocked Message */}
                  {storyBlocked && (
                    <div className="rounded-lg border border-red-500 bg-red-50 p-6 text-center animate-slide-up">
                      <p className="text-lg font-bold text-gray-900 mb-2">
                        {locale === 'en' ? '⚠️ Story Blocked' : '⚠️ القصة متوقفة'}
                      </p>
                      <p className="text-sm text-gray-700 mb-4">
                        {locale === 'en' 
                          ? 'Your choice led to a security breach. The story cannot continue from here. Please restart the scene to try again.' 
                          : 'اختيارك أدى إلى خرق أمني. القصة لا يمكن أن تستمر من هنا. يرجى إعادة تشغيل المشهد للمحاولة مرة أخرى.'}
                      </p>
                      <Button
                        onClick={() => {
                          setStoryBlocked(false)
                          setHasAnswered(false)
                          setSelectedChoice(null)
                          setChoiceFeedback(null)
                          setUserMessages([])
                          setAhmedResponses([])
                          setDialogueIndex(0)
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        {locale === 'en' ? 'Restart Scene' : 'إعادة تشغيل المشهد'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
            </div>
          </div>
        </div>
      ) : showEvaluation ? (
        // Evaluation Screen
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
          <div className="max-w-3xl w-full space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl font-bold text-white">
                {locale === 'en' ? '📊 Your Performance' : '📊 أداؤك'}
              </h1>
              <p className="text-lg text-white/80">
                {getLocaleText(scenario.title, locale)}
              </p>
            </div>

            <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-sm p-8 space-y-6">
              {/* Score Display */}
              <div className="text-center space-y-2">
                <div className="text-6xl font-bold text-white mb-2">
                  {scenarioScore} / {calculateMaxScore(scenario)}
                </div>
                <div className="text-xl text-white/80">
                  {calculateMaxScore(scenario) > 0 
                    ? Math.round((scenarioScore / calculateMaxScore(scenario)) * 100)
                    : 0}%
                </div>
                {totalScore > scenarioScore && (
                  <div className="text-sm text-white/60 mt-2">
                    {locale === 'en' 
                      ? `Total Score: ${totalScore}` 
                      : `النقاط الإجمالية: ${totalScore}`}
                  </div>
                )}
              </div>

              {/* Evaluation */}
              {(() => {
                const evalData = getEvaluation()
                return (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {evalData.title}
                      </h2>
                      <p className="text-lg text-white/90">
                        {evalData.description}
                      </p>
                    </div>

                    {/* Strengths */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-green-400">
                        {locale === 'en' ? '✨ Your Strengths' : '✨ نقاط قوتك'}
                      </h3>
                      <ul className="space-y-2">
                        {evalData.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-white/90">
                            <span className="text-green-400 mt-1">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-yellow-400">
                        {locale === 'en' ? '📈 Areas to Improve' : '📈 مجالات التحسين'}
                      </h3>
                      <ul className="space-y-2">
                        {evalData.improvements.map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-white/90">
                            <span className="text-yellow-400 mt-1">→</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Personal Advice */}
                    <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-6 space-y-3">
                      <h3 className="text-xl font-semibold text-blue-400">
                        {locale === 'en' ? '💡 Personal Advice' : '💡 نصيحة شخصية'}
                      </h3>
                      <p className="text-white/90 leading-relaxed">
                        {evalData.advice}
                      </p>
                    </div>

                    {/* Lesson Summary */}
                    <div className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-6 space-y-3">
                      <h3 className="text-xl font-semibold text-purple-400">
                        {getLocaleText(scenario.lesson.title, locale)}
                      </h3>
                      <p className="text-white/90 leading-relaxed">
                        {getLocaleText(scenario.lesson.summary, locale)}
                      </p>
                      <ul className="space-y-2 mt-4">
                        {scenario.lesson.takeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-white/90">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{getLocaleText(takeaway, locale)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })()}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={() => {
                    setShowEvaluation(false)
                    setSceneIndex(0)
                    setDialogueIndex(0)
                    setScenarioScore(0)
                    setHasAnswered(false)
                    setSelectedChoice(null)
                    setChoiceFeedback(null)
                    setUserMessages([])
                    setAhmedResponses([])
                    setIsPlaying(true)
                  }}
                  className="flex-1 bg-white text-black hover:bg-white/90 text-lg py-6"
                >
                  {locale === 'en' ? '🔄 Play Again' : '🔄 العب مرة أخرى'}
                </Button>
                {activeScenarioPosition < storyScenarios.length - 1 && (
                  <Button
                    onClick={() => {
                      const nextScenario = storyScenarios[activeScenarioPosition + 1]
                      if (nextScenario) {
                        handleScenarioChange(nextScenario.id)
                        setIsPlaying(true)
                      }
                    }}
                    className="flex-1 bg-green-500 text-white hover:bg-green-600 text-lg py-6"
                  >
                    {locale === 'en' ? '➡️ Next Scenario' : '➡️ السيناريو التالي'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Regular non-immersive mode (old interface - hidden for now)
        <div className="min-h-screen p-4">
          <div className="text-center space-y-4 py-12">
            <p className="text-muted">
              {locale === 'en' ? 'Create your character to start the immersive experience' : 'أنشئ شخصيتك لتبدأ التجربة المنغمسة'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
