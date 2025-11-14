'use client'

import { useEffect, useRef, useState } from 'react'
import { usePreferences } from '@/context/preferences-context'
import { Check, CheckCheck, Phone, Video, MoreVertical, Send, Paperclip, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type WhatsAppContact = {
  id: string
  name: string
  avatar: string
  lastSeen?: string
  isOnline?: boolean
}

type WhatsAppMessage = {
  id: string
  contactId: string
  text: string
  timestamp: Date
  isRead: boolean
  isDelivered: boolean
  isOutgoing?: boolean
  isLink?: boolean
  linkUrl?: string
  linkText?: string
  options?: MessageOption[]
}

type MessageOption = {
  id: string
  text: string
  action: 'link' | 'phone' | 'text'
}

type WhatsAppConversation = {
  contactId: string
  messages: WhatsAppMessage[]
}

type GameStage = 
  | 'welcome' 
  | 'phishing_link_check'
  | 'send_link'
  | 'wait_for_submission'
  | 'request_phone'
  | 'sending_sms'
  | 'followup'
  | 'education'
  | 'complete'

type PhishingLink = {
  id: string
  name: string
  slug: string
  template_type: string
  url: string
}

// بيانات الشخصيات
const contacts: WhatsAppContact[] = [
  {
    id: 'ahmad',
    name: 'أحمد',
    avatar: 'https://ui-avatars.com/api/?name=أحمد&size=128&background=25D366&color=fff&bold=true',
    lastSeen: 'متصل الآن',
    isOnline: true
  },
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

// محادثات موجودة مسبقاً
const initialConversations: Record<string, WhatsAppMessage[]> = {
  ahmad: [],
  salem: [
    {
      id: '1',
      contactId: 'salem',
      text: 'يا أخي شنو الأخبار؟',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '2',
      contactId: 'salem',
      text: 'وينك الحين؟',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '3',
      contactId: 'salem',
      text: 'عندنا خطط للنهار اليوم',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '4',
      contactId: 'salem',
      text: 'نطلع مع بعض؟',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 8 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '5',
      contactId: 'salem',
      text: 'رد علي ضروري 😄',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    }
  ],
  mom: [
    {
      id: '1',
      contactId: 'mom',
      text: 'سلام عليكم',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '2',
      contactId: 'mom',
      text: 'وينك يا حبيبي؟',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '3',
      contactId: 'mom',
      text: 'عندك وقت تمر عندي؟',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '4',
      contactId: 'mom',
      text: 'روح يبلي بصل من المحل',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '5',
      contactId: 'mom',
      text: 'زين الحين',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 1 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '6',
      contactId: 'mom',
      text: 'وخبز بعد إذا ممكن',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000 + 2 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '7',
      contactId: 'mom',
      text: 'رد علي يا ولدي',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    }
  ],
  girlfriend: [
    {
      id: '1',
      contactId: 'girlfriend',
      text: 'صباح الخير حبيبي 🌅',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '2',
      contactId: 'girlfriend',
      text: 'كيف صار النوم؟',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000 + 5 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '3',
      contactId: 'girlfriend',
      text: 'عندي شي حبيت أقوله لك',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '4',
      contactId: 'girlfriend',
      text: 'لكن لازم نشوف بعض أول 😊',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 3 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '5',
      contactId: 'girlfriend',
      text: 'نطلع اليوم؟',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    }
  ],
  friend: [
    {
      id: '1',
      contactId: 'friend',
      text: 'هلا',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '2',
      contactId: 'friend',
      text: 'شفت الرسالة اللي ارسلتها لك؟',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '3',
      contactId: 'friend',
      text: 'عندنا فرصة حلوة اليوم',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '4',
      contactId: 'friend',
      text: 'نطلع مع بعض؟',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 10 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    },
    {
      id: '5',
      contactId: 'friend',
      text: 'في مكان حلو عرفته جديد',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
      isDelivered: true,
      isOutgoing: false
    }
  ]
}

// رسائل جديدة ستصل تدريجياً
const incomingMessages: Array<{ contactId: string; text: string; delay: number }> = [
  { contactId: 'salem', text: 'وينك الحين؟', delay: 5000 },
  { contactId: 'mom', text: 'رد علي ضروري', delay: 8000 },
  { contactId: 'girlfriend', text: 'وينك؟ 😢', delay: 12000 },
  { contactId: 'friend', text: 'شنو صاير معك؟', delay: 15000 },
  { contactId: 'salem', text: 'احنا ننتظرك 😄', delay: 20000 },
  { contactId: 'mom', text: 'يا ولدي وينك؟', delay: 25000 },
  { contactId: 'girlfriend', text: 'أنا بانتظارك 🥺', delay: 30000 }
]

export function WhatsAppChat() {
  const { locale } = usePreferences()
  const [selectedContact, setSelectedContact] = useState<string | null>('ahmad')
  const [conversations, setConversations] = useState<Record<string, WhatsAppMessage[]>>(initialConversations)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<(() => void) | null>(null)
  const [messageCounters, setMessageCounters] = useState<Record<string, number>>({})
  const [gameStage, setGameStage] = useState<GameStage>('welcome')
  const [phishingLinks, setPhishingLinks] = useState<PhishingLink[]>([])
  const [selectedLink, setSelectedLink] = useState<PhishingLink | null>(null)
  const [userPhone, setUserPhone] = useState('')
  const [userName, setUserName] = useState<string>('')
  const [showNameInput, setShowNameInput] = useState(true)
  const [submittedData, setSubmittedData] = useState<any>(null)
  const [isPhoneInputVisible, setIsPhoneInputVisible] = useState(false)
  const [showEducationScreen, setShowEducationScreen] = useState(false)
  const [mistakes, setMistakes] = useState<string[]>([])
  const loadingLinksRef = useRef(false)

  // إضافة رسالة من أحمد
  const addAhmadMessage = (text: string, options?: MessageOption[]) => {
    const message: WhatsAppMessage = {
      id: `ahmad-${Date.now()}-${Math.random()}`,
      contactId: 'ahmad',
      text,
      timestamp: new Date(),
      isRead: false,
      isDelivered: true,
      isOutgoing: false,
      options
    }

    setConversations((prev) => ({
      ...prev,
      ahmad: [...(prev.ahmad || []), message]
    }))

    if (selectedContact !== 'ahmad') {
      setMessageCounters((prev) => ({
        ...prev,
        ahmad: (prev.ahmad || 0) + 1
      }))
    }

    playNotification()
  }

  // جلب روابط الفيشينج من المستخدم
  useEffect(() => {
    if (loadingLinksRef.current) return
    loadingLinksRef.current = true
    
    const fetchPhishingLinks = async () => {
      try {
        const response = await fetch('/api/phishing')
        if (response.ok) {
          const data = await response.json()
          if (data.links && data.links.length > 0) {
            const formattedLinks = data.links.map((link: any) => ({
              id: link.id,
              name: link.name,
              slug: link.slug,
              template_type: link.template_type,
              url: `${window.location.origin}/phishing/${link.slug}`
            }))
            setPhishingLinks(formattedLinks)
          }
        }
      } catch (error) {
        console.error('Error fetching phishing links:', error)
      }
    }

    fetchPhishingLinks()
  }, [])

  // بدء السيناريو بعد إدخال الاسم
  useEffect(() => {
    if (!showNameInput && gameStage === 'welcome' && selectedContact === 'ahmad' && userName) {
      const timer = setTimeout(() => {
        addAhmadMessage(`يا ${userName}! وقعت في مشكلة كبيرة! 😰`)
        setTimeout(() => {
          addAhmadMessage('دخلت على رابط غريب ووالله خايف إنهم سرقوا بياناتي...')
          setTimeout(() => {
            addAhmadMessage(`أنت خبير في الأمن السيبراني صح؟ أرجوك ساعدني! 🙏`)
            setTimeout(() => {
              if (phishingLinks.length > 0) {
                setGameStage('send_link')
                addAhmadMessage('وصلني هذا الرابط من "الحكومة" يقولون لازم أحدث بياناتي...')
                setTimeout(() => {
                  addAhmadMessage('تقدر تشوفه وتقولي إذا آمن أو لا؟ أنا خايف أدخله مرة ثانية!')
                  setTimeout(() => {
                    const latestLink = phishingLinks[0]
                    setSelectedLink(latestLink)
                    sendPhishingLink(latestLink)
                  }, 2000)
                }, 3000)
              } else {
                setGameStage('phishing_link_check')
                addAhmadMessage('وصلني رابط غريب من شخص يقول إنه من الحكومة...')
                setTimeout(() => {
                  addAhmadMessage('إذا أنت مكاني، وش تسوي في هالموقف؟', [
                    { id: 'click', text: 'أدخل وأتحقق من الرابط', action: 'text' },
                    { id: 'check', text: 'أتحقق من المصدر أولاً', action: 'text' },
                    { id: 'ignore', text: 'أتجاهله تماماً', action: 'text' }
                  ])
                }, 3000)
              }
            }, 3000)
          }, 2500)
        }, 2000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameStage, selectedContact, phishingLinks, showNameInput, userName])

  // مراقبة إرسال البيانات من صفحة الفيشينج
  useEffect(() => {
    const handlePhishingSubmit = (event: CustomEvent) => {
      const data = event.detail
      console.log('Phishing data submitted:', data)
      setSubmittedData(data)
      setGameStage('request_phone')
      
      setTimeout(() => {
        addAhmadMessage('شفته؟ وش رأيك فيه؟')
        setTimeout(() => {
          addAhmadMessage('والله أنا دخلت عليه وحطيت بياناتي... خايف يكون مشبوه 😰')
          setTimeout(() => {
            addAhmadMessage('بالمناسبة، عطني رقمك عشان الجهة اللي راسلت لي يبون يتواصلوا معك 📱')
            setTimeout(() => {
              addAhmadMessage('اكتب رقمك بدون + (مثال: 96890200)')
              setIsPhoneInputVisible(true)
            }, 2000)
          }, 2500)
        }, 2000)
      }, 1000)
    }

    window.addEventListener('phishingDataSubmitted', handlePhishingSubmit as EventListener)
    return () => {
      window.removeEventListener('phishingDataSubmitted', handlePhishingSubmit as EventListener)
    }
  }, [])

  // إرسال رابط الفيشينج
  const sendPhishingLink = (link: PhishingLink) => {
    setTimeout(() => {
      const message: WhatsAppMessage = {
        id: `ahmad-link-${Date.now()}`,
        contactId: 'ahmad',
        text: `هذا الرابط اللي وصلني:\n\n`,
        timestamp: new Date(),
        isRead: false,
        isDelivered: true,
        isOutgoing: false,
        isLink: true,
        linkUrl: link.url,
        linkText: link.name
      }

      setConversations((prev) => ({
        ...prev,
        ahmad: [...(prev.ahmad || []), message]
      }))

      playNotification()
      setGameStage('wait_for_submission')

      // رسالة تحفيزية بعد قليل
      setTimeout(() => {
        addAhmadMessage('تقدر تدخل عليه وتتحقق منه؟ أبي أعرف إذا آمن 🙏')
        setTimeout(() => {
          addAhmadMessage('أنا مو فاهم وايد في هالأمور، بس أنت خبير فأكيد بتعرف!')
          addMistake('الثقة العمياء في طلبات الأصدقاء دون التحقق')
        }, 3000)
      }, 3000)
    }, 2000)
  }

  // إرسال رسالة واتساب حقيقية
  const sendWhatsAppMessage = async (phone: string) => {
    try {
      setGameStage('sending_sms')
      
      let message = `😈 هلا ${userName || 'يالغالي'}!

يا حظك! وقعت في فخ الفيشينج 
أنا المخترق اللي أرسل الرابط لصديقك أحمد

شف بياناتك اللي حطيتها في الرابط:\n`
      
      if (submittedData?.email) {
        message += `📧 الإيميل: ${submittedData.email}\n`
      }
      if (submittedData?.username) {
        message += `👤 اليوزر: ${submittedData.username}\n`
      }
      if (submittedData?.password) {
        message += `🔑 الباسورد: ${submittedData.password}\n`
      }
      if (submittedData?.phone) {
        message += `📱 الجوال: ${submittedData.phone}\n`
      }
      
      message += `\n⚠️ كذا يقدرون المخترقين يوصلون لبياناتك!`

      console.log('Sending WhatsApp message to:', phone)
      console.log('Message:', message)

      const response = await fetch('/api/game/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone,
          message,
          submittedData
        })
      })

      const result = await response.json()
      console.log('WhatsApp API response:', result)

      if (response.ok) {
        // انتظار 3-4 ثواني قبل رسالة المتابعة
        setTimeout(() => {
          setGameStage('followup')
          addAhmadMessage('يا أخوي... 😔')
          
          setTimeout(() => {
            addAhmadMessage('للأسف... أنا كنت جزء من التدريب 😅')
            setTimeout(() => {
              addAhmadMessage('شف جوالك! وصلتك رسالة؟ 📱', [
                { id: 'yes', text: 'إيه وصلتني! 😱', action: 'text' },
                { id: 'no', text: 'لا ما وصلتني', action: 'text' }
              ])
            }, 2500)
          }, 2000)
        }, 3500)
      } else {
        console.error('Failed to send WhatsApp:', result)
        addAhmadMessage('للأسف فيه مشكلة بالإرسال... لكن تخيل لو وصلتك رسالة فيها بياناتك! 😨')
        setTimeout(() => {
          showEducationSummary()
        }, 2000)
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error)
      addAhmadMessage('فيه مشكلة بالإرسال... بس تخيل لو وصلتك رسالة فيها بياناتك! 😨')
      setTimeout(() => {
        showEducationSummary()
      }, 2000)
    }
  }

  // عرض الشاشة التعليمية
  const showEducationSummary = () => {
    setGameStage('education')
    setShowEducationScreen(true)
  }

  // إضافة خطأ للقائمة
  const addMistake = (mistake: string) => {
    setMistakes((prev) => [...prev, mistake])
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

    // حفظ الدالة
    audioRef.current = playNotificationSound
  }, [])

  // تشغيل صوت الإشعار
  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current()
    }
  }

  // إضافة رسائل جديدة تدريجياً
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    incomingMessages.forEach((msg) => {
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

        setConversations((prev) => ({
          ...prev,
          [msg.contactId]: [...(prev[msg.contactId] || []), newMsg]
        }))

        // تحديث عداد الرسائل غير المقروءة
        setMessageCounters((prev) => ({
          ...prev,
          [msg.contactId]: (prev[msg.contactId] || 0) + 1
        }))

        // تشغيل صوت الإشعار
        playNotification()
      }, msg.delay)

      timers.push(timer)
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  // التمرير إلى آخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, selectedContact])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return

    const message: WhatsAppMessage = {
      id: `outgoing-${Date.now()}`,
      contactId: selectedContact,
      text: newMessage,
      timestamp: new Date(),
      isRead: false,
      isDelivered: false,
      isOutgoing: true
    }

    setConversations((prev) => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), message]
    }))

    // معالجة إدخال رقم الهاتف في سيناريو أحمد
    if (selectedContact === 'ahmad' && isPhoneInputVisible && gameStage === 'request_phone') {
      const phonePattern = /^[0-9]{8,15}$/
      if (phonePattern.test(newMessage.trim())) {
        setUserPhone(newMessage.trim())
        setIsPhoneInputVisible(false)
        addMistake('مشاركة رقم الهاتف مع شخص غير موثوق')
        
        setTimeout(() => {
          addAhmadMessage('أوكي تمام، حين أرسله بشوفه 👍')
          setTimeout(() => {
            sendWhatsAppMessage(newMessage.trim())
          }, 2000)
        }, 1000)
      } else {
        setTimeout(() => {
          addAhmadMessage('حط رقم صح بدون + (مثال: 96890200)')
        }, 500)
      }
    }

    setNewMessage('')
  }

  // معالجة الضغط على الخيارات
  const handleOptionClick = (optionId: string) => {
    if (selectedContact !== 'ahmad') return

    // إرسال الخيار كرسالة من المستخدم
    const message: WhatsAppMessage = {
      id: `outgoing-${Date.now()}`,
      contactId: 'ahmad',
      text: optionId === 'yes' ? 'نعم وصلتني! 😱' : optionId === 'no' ? 'لا ما وصلتني' : optionId === 'click' ? 'أضغط على الرابط مباشرة' : optionId === 'check' ? 'أتحقق من المصدر أولاً' : 'أتجاهل الرسالة',
      timestamp: new Date(),
      isRead: false,
      isDelivered: false,
      isOutgoing: true
    }

    setConversations((prev) => ({
      ...prev,
      ahmad: [...(prev.ahmad || []), message]
    }))

    // رد أحمد على الخيار
    if (optionId === 'yes') {
      setTimeout(() => {
        addAhmadMessage('والله أنا آسف! 😔')
        setTimeout(() => {
          addAhmadMessage('كان هذا جزء من تدريب أمني... والهدف إنك تتعلم من الغلط!')
          setTimeout(() => {
            addAhmadMessage('حتى الخبراء ممكن يقعون في الفخ... الدرس المهم: دائماً تحقق! 📚')
            setTimeout(() => {
              showEducationSummary()
            }, 2000)
          }, 2000)
        }, 2000)
      }, 1000)
    } else if (optionId === 'no') {
      setTimeout(() => {
        addAhmadMessage('لا بأس، ممكن استغرقت وقت...')
        setTimeout(() => {
          addAhmadMessage('المهم إنك فهمت الدرس: حتى لما صديقك يطلب منك تدخل رابط، لازم تتحقق!')
          setTimeout(() => {
            showEducationSummary()
          }, 2000)
        }, 2000)
      }, 1000)
    } else if (optionId === 'click') {
      addMistake('مساعدة الصديق دون التحقق من الرابط أولاً')
      setTimeout(() => {
        addAhmadMessage('للأسف... هذا كان فخ! 😰')
        setTimeout(() => {
          addAhmadMessage('حتى لو صديقك يطلب، لازم تتحقق من الرابط قبل ما تدخل!')
          setTimeout(() => {
            showEducationSummary()
          }, 2000)
        }, 2000)
      }, 1000)
    } else if (optionId === 'check') {
      setTimeout(() => {
        addAhmadMessage('ممتاز! 🎉 هذا الخيار الصح!')
        setTimeout(() => {
          addAhmadMessage('دائماً تحقق من المصدر، حتى لو كان الطلب من صديق!')
          setTimeout(() => {
            showEducationSummary()
          }, 2000)
        }, 2000)
      }, 1000)
    } else if (optionId === 'ignore') {
      setTimeout(() => {
        addAhmadMessage('خيار جيد للحماية، لكن الأفضل تساعد صديقك بإنك تتحقق وتنصحه')
        setTimeout(() => {
          showEducationSummary()
        }, 2000)
      }, 1000)
    }
  }

  const selectedContactData = selectedContact ? contacts.find((c) => c.id === selectedContact) : null
  const currentMessages = selectedContact ? conversations[selectedContact] || [] : []

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
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

  // معالجة إدخال الاسم
  const handleNameSubmit = (name: string) => {
    if (name.trim()) {
      setUserName(name.trim())
      setShowNameInput(false)
      setGameStage('welcome')
    }
  }

  return (
    <>
      {/* شاشة إدخال الاسم */}
      {showNameInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border-2 border-[#25d366] rounded-3xl p-8 max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-[#25d366]/10 rounded-full mb-4">
                <svg className="w-16 h-16 text-[#25d366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">مرحباً! 👋</h2>
              <p className="text-lg text-[#8696a0]">عشان الرسائل توصلك بالشكل الصحيح</p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const input = e.currentTarget.querySelector('input') as HTMLInputElement
                if (input?.value.trim()) {
                  handleNameSubmit(input.value.trim())
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  اكتب اسمك
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="مثال: فيصل"
                  className="w-full bg-[#202c33] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25d366] text-lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.currentTarget as HTMLInputElement
                      if (input.value.trim()) {
                        handleNameSubmit(input.value.trim())
                      }
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors"
              >
                ابدأ اللعبة 🎮
              </button>
            </form>
          </div>
        </div>
      )}

      {/* الشاشة التعليمية */}
      {showEducationScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#1a1f2e] to-[#0f1419] border-2 border-[#25d366] rounded-3xl p-8 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-[#25d366]/10 rounded-full mb-4">
                <svg className="w-16 h-16 text-[#25d366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">مبروك! 🎉</h2>
              <p className="text-xl text-[#8696a0]">لقد أكملت التدريب الأمني التفاعلي</p>
            </div>

            <div className="space-y-6">
              {/* ملخص ما حدث */}
              <div className="bg-[#202c33]/50 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-[#25d366] mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ملخص ما حدث
                </h3>
                <div className="space-y-3 text-[#e9edef]">
                  <p>✅ تلقيت رسالة من صديقك "أحمد" يطلب المساعدة</p>
                  <p>✅ أخبرك أنه وقع في فخ وطلب منك التحقق من رابط</p>
                  <p>✅ ثقت به لأنه صديقك وضغطت على الرابط</p>
                  <p>✅ أدخلت بياناتك الشخصية "للتحقق" من الرابط</p>
                  <p>✅ أعطيته رقم هاتفك عندما طلبه</p>
                  <p>✅ اكتشفت أن هذا كان تدريب أمني ووقعت في الفخ!</p>
                </div>
              </div>

              {/* الأخطاء المرتكبة */}
              {mistakes.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    الأخطاء التي ارتكبتها
                  </h3>
                  <ul className="space-y-2 text-[#e9edef]">
                    {mistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-400 mt-1">❌</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ما كان يجب عليك فعله */}
              <div className="bg-[#25d366]/10 border border-[#25d366]/30 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-[#25d366] mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ما كان يجب عليك فعله
                </h3>
                <ul className="space-y-3 text-[#e9edef]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#25d366] mt-1 text-xl">✓</span>
                    <div>
                      <strong>عدم الثقة العمياء:</strong> حتى لو كانت الرسالة من صديق، تحقق من الرابط قبل الضغط عليه
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#25d366] mt-1 text-xl">✓</span>
                    <div>
                      <strong>فحص الروابط أولاً:</strong> استخدم أدوات فحص الروابط أو تحقق من عنوان URL بعناية
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#25d366] mt-1 text-xl">✓</span>
                    <div>
                      <strong>التأكد من حساب الصديق:</strong> اتصل به هاتفياً أو بطريقة أخرى للتأكد أنه فعلاً من أرسل الرسالة
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#25d366] mt-1 text-xl">✓</span>
                    <div>
                      <strong>عدم إدخال بيانات حساسة:</strong> لا تدخل بياناتك الشخصية على روابط مشبوهة حتى "للتحقق"
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#25d366] mt-1 text-xl">✓</span>
                    <div>
                      <strong>الشك دائماً أفضل:</strong> من الأفضل أن تشك وتتحقق بدلاً من الثقة العمياء
                    </div>
                  </li>
                </ul>
              </div>

              {/* نصائح إضافية */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  نصائح إضافية للحماية
                </h3>
                <ul className="space-y-2 text-[#e9edef]">
                  <li>💡 المهاجمون يستخدمون الهندسة الاجتماعية (استغلال الثقة والعواطف)</li>
                  <li>💡 حتى الخبراء يقعون في الفخ إذا لم ينتبهوا</li>
                  <li>💡 الطلبات العاجلة أو العاطفية (مثل "ساعدني!") تكتيك شائع</li>
                  <li>💡 حسابات الأصدقاء قد تُخترق وتُستخدم للاحتيال</li>
                  <li>💡 استخدم أدوات فحص الروابط مثل VirusTotal قبل الضغط</li>
                  <li>💡 فعّل التحقق بخطوتين على جميع حساباتك</li>
                </ul>
              </div>

              {/* البيانات المسروقة */}
              {submittedData && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
                  <h3 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    البيانات التي تم "سرقتها" في التدريب
                  </h3>
                  <div className="bg-black/30 rounded-xl p-4 font-mono text-sm text-[#e9edef]">
                    {submittedData.email && <p>📧 البريد الإلكتروني: {submittedData.email}</p>}
                    {submittedData.password && <p>🔑 كلمة المرور: {submittedData.password}</p>}
                    {submittedData.username && <p>👤 اسم المستخدم: {submittedData.username}</p>}
                    {userPhone && <p>📱 رقم الهاتف: {userPhone}</p>}
                  </div>
                  <p className="mt-3 text-amber-400 text-sm">
                    ⚠️ هذه البيانات تم جمعها لأغراض تعليمية فقط ولن يتم حفظها أو استخدامها
                  </p>
                </div>
              )}
            </div>

            {/* زر الإغلاق */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => {
                  setShowEducationScreen(false)
                  setGameStage('complete')
                }}
                className="bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors"
              >
                فهمت! أغلق الشاشة 🎯
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="flex h-[calc(100vh-64px)] bg-[#0b141a] text-white">
      {/* قائمة الاتصالات */}
      <div className="w-1/3 border-r border-[#2a3942] bg-[#111b21] flex flex-col">
        {/* رأس القائمة */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">WhatsApp</h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-[#2a3942] rounded-full">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* قائمة المحادثات */}
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => {
            const messages = conversations[contact.id] || []
            const lastMessage = messages[messages.length - 1]
            const unreadCount = messageCounters[contact.id] || 0

            return (
              <div
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact.id)
                  // إزالة العداد عند فتح المحادثة وقراءة الرسائل
                  if (messageCounters[contact.id]) {
                    setMessageCounters((prev) => ({ ...prev, [contact.id]: 0 }))
                    // تحديث حالة الرسائل إلى مقروءة
                    setConversations((prev) => {
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
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-[#202c33] ${
                  selectedContact === contact.id ? 'bg-[#2a3942]' : ''
                }`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full bg-[#2a3942] object-cover"
                    loading="lazy"
                  />
                  {contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111b21]"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">{contact.name}</h3>
                    {lastMessage && (
                      <span className="text-xs text-[#8696a0] ml-2">
                        {formatTime(lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  {lastMessage && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#8696a0] truncate">{lastMessage.text}</p>
                      {unreadCount > 0 && (
                        <span className="bg-[#25d366] text-white text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* منطقة المحادثة */}
      <div className="flex-1 flex flex-col bg-[#0b141a]">
        {selectedContactData ? (
          <>
            {/* رأس المحادثة */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedContactData.avatar}
                  alt={selectedContactData.name}
                  className="w-10 h-10 rounded-full bg-[#2a3942] object-cover"
                  loading="lazy"
                />
                <div>
                  <h3 className="font-semibold">{selectedContactData.name}</h3>
                  <p className="text-xs text-[#8696a0]">
                    {selectedContactData.isOnline ? 'متصل الآن' : `آخر ظهور ${selectedContactData.lastSeen}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-[#2a3942] rounded-full">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-[#2a3942] rounded-full">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 hover:bg-[#2a3942] rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* الرسائل */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#0b141a] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0wIDBoMTAwdjEwMEgweiIgZmlsbD0iIzBhMTIxOSIvPjxwYXRoIGQ9Ik0yMCAyMGg2MHY2MEgyMHoiIGZpbGw9IiMxMGI0MWEiIG9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')]">
              {currentMessages.map((message, index) => {
                const prevMessage = index > 0 ? currentMessages[index - 1] : null
                const showDate = !prevMessage || 
                  Math.abs(message.timestamp.getTime() - prevMessage.timestamp.getTime()) > 5 * 60 * 1000

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex mb-2 ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[65%] rounded-lg px-3 py-2 ${
                          message.isOutgoing
                            ? 'bg-[#005c4b] rounded-tr-none'
                            : 'bg-[#202c33] rounded-tl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                        
                        {/* عرض الرابط إذا كان موجوداً */}
                        {message.isLink && message.linkUrl && (
                          <button
                            onClick={() => {
                              // فتح الرابط في نفس الصفحة أو في iframe
                              window.open(message.linkUrl, '_blank')
                              // إضافة رسالة توضيحية
                              addMistake('فتح رابط مشبوه من صديق دون التحقق من مصدره')
                              // مراقبة إغلاق النافذة أو التخزين المحلي
                              const checkInterval = setInterval(() => {
                                const storedData = localStorage.getItem('phishingSubmission')
                                if (storedData) {
                                  try {
                                    const data = JSON.parse(storedData)
                                    localStorage.removeItem('phishingSubmission')
                                    clearInterval(checkInterval)
                                    
                                    // معالجة البيانات
                                    setSubmittedData(data)
                                    setGameStage('request_phone')
                                    setTimeout(() => {
                                      addAhmadMessage('شفته؟ وش رأيك فيه؟')
                                      setTimeout(() => {
                                        addAhmadMessage('والله أنا دخلت عليه وحطيت بياناتي... خايف يكون مشبوه 😰')
                                        setTimeout(() => {
              addAhmadMessage('بالمناسبة، عطني رقمك عشان الجهة اللي راسلت لي يبون يتواصلوا معك 📱')
              setTimeout(() => {
                addAhmadMessage('اكتب رقمك بدون + (مثال: 96890200)')
                setIsPhoneInputVisible(true)
              }, 2000)
                                        }, 2500)
                                      }, 2000)
                                    }, 1000)
                                  } catch (error) {
                                    console.error('Error parsing stored data:', error)
                                  }
                                }
                              }, 1000)
                              
                              // إيقاف المراقبة بعد 5 دقائق
                              setTimeout(() => clearInterval(checkInterval), 5 * 60 * 1000)
                            }}
                            className="mt-2 flex items-center gap-2 bg-[#1e2a32] hover:bg-[#2a3942] p-3 rounded-lg transition-colors w-full cursor-pointer"
                          >
                            <LinkIcon className="h-5 w-5 text-[#25d366]" />
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-semibold text-white truncate">{message.linkText}</p>
                              <p className="text-xs text-[#8696a0] truncate">{message.linkUrl}</p>
                            </div>
                          </button>
                        )}

                        {/* عرض الخيارات إذا كانت موجودة */}
                        {message.options && message.options.length > 0 && (
                          <div className="mt-3 flex flex-col gap-2">
                            {message.options.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleOptionClick(option.id)}
                                className="bg-[#1e2a32] hover:bg-[#2a3942] text-white text-sm py-2 px-4 rounded-lg transition-colors text-center"
                              >
                                {option.text}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[0.7rem] text-[#8696a0]">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.isOutgoing && (
                            <span className="ml-1">
                              {message.isRead ? (
                                <CheckCheck className="h-4 w-4 text-blue-400" />
                              ) : message.isDelivered ? (
                                <CheckCheck className="h-4 w-4 text-[#8696a0]" />
                              ) : (
                                <Check className="h-4 w-4 text-[#8696a0]" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* منطقة الإدخال */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center gap-2">
              <button className="p-2 hover:bg-[#2a3942] rounded-full">
                <Paperclip className="h-5 w-5 text-[#8696a0]" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="اكتب رسالة..."
                className="flex-1 bg-[#2a3942] text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25d366]"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-[#25d366] hover:bg-[#20ba5a] rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8696a0]">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-xl">اختر محادثة للبدء</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
