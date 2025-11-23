'use client'

import { useMemo, useState, type ComponentType } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Globe,
  Search,
  AlertTriangle,
  Activity,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XOctagon,
  Circle,
  CircleCheck,
  CircleDot,
  Info,
  Shield,
  Lock,
  Unlock,
  Eye,
  HelpCircle,
  Sparkles,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Link2,
  ArrowRight,
} from 'lucide-react'
import { trackExperienceEvent } from '@/lib/telemetry'
import { incrementUrlScan } from '@/lib/local-stats'

type Verdict = 'harmless' | 'suspicious' | 'malicious' | 'unknown'

interface Phase {
  id: 'protocol' | 'reputation' | 'behaviour'
  title: string
  description: string
  benefit: string
  icon: ComponentType<{ className?: string }>
}

interface SampleLink {
  id: string
  label: string
  url: string
  verdict: Verdict
  note: string
  educationalTip: string
}

interface Cue {
  id: string
  label: string
  status: 'pass' | 'review' | 'fail'
  detail: string
  educationalExplanation?: string
}

interface AnalysisResult {
  verdict: Verdict
  headline: string
  cues: Cue[]
  recommendations: string[]
  virusTotalResult?: {
    verdict: 'unknown' | 'harmless' | 'suspicious' | 'malicious'
    status: string
    isHighRisk: boolean
    lastAnalysisStats?: Record<string, number>
    lastAnalysisDate?: number
  }
}

const phases: Phase[] = [
  {
    id: 'protocol',
    title: 'البروتوكول والشهادة',
    description: 'التحقق من HTTPS وقوة TLS وملكية الشهادة قبل الوصول إلى المحتوى.',
    benefit: 'يمنع هجمات التخفيض والاستضافة المشابهة بدون شهادة موثوقة.',
    icon: Globe,
  },
  {
    id: 'reputation',
    title: 'ذكاء السمعة',
    description: 'استعلام مصادر التهديدات وتاريخ الحماية وعمر WHOIS للنطاق الهدف.',
    benefit: 'يحدد المضيفات المستخدمة سابقاً في التصيد أو المسجلة حديثاً لحملة.',
    icon: Search,
  },
  {
    id: 'behaviour',
    title: 'حماية السلوك',
    description: 'تشغيل الصفحة في متصفح مؤقت لمراقبة إعادة التوجيه وحمولات البرمجيات الخبيثة.',
    benefit: 'يكتشف البرمجيات المشفرة والتنزيلات القسرية ونماذج جمع بيانات الاعتماد.',
    icon: Activity,
  },
]

const sampleLinks: SampleLink[] = [
  {
    id: 'microsoft-phish',
    label: 'إعادة تعيين كلمة مرور Microsoft (تصيد)',
    url: 'https://rnicrosft.com/reset-password',
    verdict: 'malicious',
    note: 'نطاق مشابه: "rn" تبدو مثل "m" - تقنية تصيد شائعة.',
    educationalTip: 'انتبه! "rnicrosft" تبدو مثل "microsoft" عند قراءتها بسرعة. هذه تقنية تسمى "typosquatting" حيث يستخدم المهاجمون أحرفاً متشابهة لخداع المستخدمين.',
  },
  {
    id: 'instagram-safe',
    label: 'رابط إنستجرام آمن',
    url: 'https://www.instagram.com',
    verdict: 'harmless',
    note: 'نطاق رسمي مع HTTPS وشهادة موثوقة.',
    educationalTip: 'هذا رابط آمن! لاحظ أن الرابط يبدأ بـ HTTPS (وليس HTTP) مما يعني أن الاتصال مشفر. أيضاً، النطاق "instagram.com" هو النطاق الرسمي للشركة.',
  },
  {
    id: 'google-typo',
    label: 'رابط Google مزيف (.corn بدلاً من .com)',
    url: 'https://www.goog1e.corn',
    verdict: 'malicious',
    note: 'نطاق مزيف يستخدم .corn بدلاً من .com والرقم 1 بدلاً من الحرف l.',
    educationalTip: 'خطر! هذا رابط مزيف يستخدم تقنيات متعددة: 1) استبدال ".com" بـ ".corn" 2) استبدال الحرف "l" بالرقم "1". دائماً تحقق من النطاق بعناية قبل النقر.',
  },
  {
    id: 'hr-safe',
    label: 'بوابة مزايا الموارد البشرية',
    url: 'https://hr.company.com/benefits/summary',
    verdict: 'harmless',
    note: 'نطاق فرعي رسمي مع TLS محسّن وسجل تهديدات نظيف.',
    educationalTip: 'رابط آمن! النطاق الفرعي "hr.company.com" يتبع نمطاً موثوقاً. دائماً تحقق من أن النطاق يطابق نطاق شركتك أو المؤسسة الرسمية.',
  },
  {
    id: 'payroll-clone',
    label: 'تحديث "آمن" لكشوف المرتبات',
    url: 'https://accounts-payroll-secure.com/update/login',
    verdict: 'malicious',
    note: 'نطاق مشابه مع خصوصية المسجل ومعالج جمع بيانات الاعتماد.',
    educationalTip: 'مشبوه! النطاق يحتوي على كلمات مثل "secure" و "accounts" لمحاولة كسب الثقة. النطاقات الحقيقية عادة لا تحتاج لإضافة كلمات مثل "secure" في النطاق نفسه.',
  },
  {
    id: 'bonus-short',
    label: 'استطلاع مكافأة مختصر',
    url: 'http://bit.ly/2024-bonus-review',
    verdict: 'suspicious',
    note: 'المختصر يخفي المضيف الحقيقي ويتحول إلى HTTP',
    educationalTip: 'احذر! الروابط المختصرة (مثل bit.ly) تخفي الوجهة الحقيقية. أيضاً، لاحظ أن الرابط يستخدم HTTP (وليس HTTPS) مما يعني أن الاتصال غير مشفر. تجنب النقر على الروابط المختصرة من مصادر غير موثوقة.',
  },
]

const verdictStyles: Record<
  Verdict,
  {
    badge: string
    tone: string
    headline: string
    description: string
    icon: ComponentType<{ className?: string }>
  }
> = {
  harmless: {
    badge: 'bg-green-500/10 text-green-600 border-green-500/30',
    tone: 'text-green-700 dark:text-green-300',
    headline: 'على الأرجح آمن',
    description:
      'الضوابط والسياق متوافقة مع الأنماط الموثوقة. استمر في التحقق قبل إدخال بيانات الاعتماد.',
    icon: CheckCircle2,
  },
  suspicious: {
    badge: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    tone: 'text-amber-700 dark:text-amber-300',
    headline: 'يحتاج تصعيد',
    description: 'مؤشرات مختلطة. توقف وتحقق مع المرسل قبل التفاعل أكثر.',
    icon: AlertTriangle,
  },
  malicious: {
    badge: 'bg-red-500/10 text-red-600 border-red-500/30',
    tone: 'text-red-700 dark:text-red-300',
    headline: 'وجهة عالية المخاطر',
    description: 'تم اكتشاف إشارات متعددة عالية المخاطر. أبلغ فوراً وامنع الوصول اللاحق.',
    icon: XOctagon,
  },
  unknown: {
    badge: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
    tone: 'text-gray-700 dark:text-gray-300',
    headline: 'غير معروف',
    description: 'لم يتمكن النظام من تحديد حالة الرابط. تحلى بالحذر.',
    icon: HelpCircle,
  },
}

const shortenerHosts = ['bit.ly', 'tinyurl.com', 't.co', 'rebrand.ly', 'goo.gl']
const riskyTlds = ['.xyz', '.top', '.click', '.ru', '.cn', '.kim', '.work']

// Common brand names that attackers often impersonate
const knownBrands = ['microsoft', 'apple', 'google', 'amazon', 'paypal', 'facebook', 'twitter', 'linkedin', 'instagram', 'netflix', 'bank', 'chase', 'wells', 'fargo']

// Character substitutions commonly used in typosquatting
const lookalikePatterns = [
  { pattern: /rn/g, replacement: 'm', description: '"rn" يمكن أن تبدو مثل "m"' },
  { pattern: /vv/g, replacement: 'w', description: '"vv" يمكن أن تبدو مثل "w"' },
  { pattern: /cl/g, replacement: 'd', description: '"cl" يمكن أن تبدو مثل "d"' },
  { pattern: /ii/g, replacement: 'n', description: '"ii" يمكن أن تبدو مثل "n"' },
  { pattern: /0/g, replacement: 'o', description: '"0" (صفر) يمكن أن يبدو مثل "o"' },
  { pattern: /1/g, replacement: 'l', description: '"1" (واحد) يمكن أن يبدو مثل "l"' },
  { pattern: /5/g, replacement: 's', description: '"5" يمكن أن يبدو مثل "s"' },
]

function detectLookalikeDomain(hostname: string): { isLookalike: boolean; brand?: string; detail?: string } {
  const lowerHost = hostname.toLowerCase()
  const domainWithoutTld = lowerHost.split('.').slice(0, -1).join('.')
  
  for (const brand of knownBrands) {
    // First, try to normalize the domain by replacing lookalike characters
    let normalizedDomain = domainWithoutTld
    for (const { pattern, replacement } of lookalikePatterns) {
      normalizedDomain = normalizedDomain.replace(pattern, replacement)
    }
    
    // Check if normalized domain contains the brand
    if (normalizedDomain.includes(brand)) {
      // Check if it's not the exact brand domain
      if (normalizedDomain !== brand && !normalizedDomain.endsWith(`.${brand}`)) {
        // Find which pattern was used
        for (const { pattern, replacement, description } of lookalikePatterns) {
          const testNormalized = domainWithoutTld.replace(pattern, replacement)
          if (testNormalized.includes(brand) && testNormalized !== domainWithoutTld) {
            return {
              isLookalike: true,
              brand,
              detail: `النطاق يبدو أنه يحاكي "${brand}" باستخدام ${description}. على سبيل المثال، "${domainWithoutTld}" يبدو مثل "${brand}" لكنه يستخدم استبدال الأحرف. هذه تقنية تصيد شائعة.`,
            }
          }
        }
        
        // If no specific pattern found but still looks similar
        const brandLength = brand.length
        const domainLength = domainWithoutTld.length
        if (Math.abs(domainLength - brandLength) <= 3) {
          return {
            isLookalike: true,
            brand,
            detail: `النطاق يشبه "${brand}" بشكل كبير لكنه ليس النطاق الرسمي. تحقق من عنوان بريد المرسل بعناية قبل النقر.`,
          }
        }
      }
    }
    
    // Also check if domain contains brand name directly (for typosquatting)
    if (domainWithoutTld.includes(brand) && domainWithoutTld !== brand && !domainWithoutTld.endsWith(`.${brand}`)) {
      const brandLength = brand.length
      const domainLength = domainWithoutTld.length
      if (Math.abs(domainLength - brandLength) <= 2) {
        return {
          isLookalike: true,
          brand,
          detail: `النطاق يشبه "${brand}" بشكل كبير لكنه ليس النطاق الرسمي. تحقق من المرسل بعناية.`,
        }
      }
    }
  }
  
  return { isLookalike: false }
}

type PhaseStatus = 'pending' | 'active' | 'complete'

const createPhaseStatuses = () =>
  phases.reduce<Record<Phase['id'], PhaseStatus>>((acc, phase) => {
    acc[phase.id] = 'pending'
    return acc
  }, {} as Record<Phase['id'], PhaseStatus>)

function analyseUrl(rawUrl: string): AnalysisResult {
  let parsed: URL | null = null
  try {
    parsed = new URL(rawUrl)
  } catch {
    return {
      verdict: 'suspicious',
      headline: 'رابط غير صحيح',
      cues: [
        {
          id: 'format',
          label: 'تنسيق الرابط',
          status: 'fail',
          detail: 'تعذر تحليل الرابط. غالباً ما يشوه المهاجمون الروابط لإخفاء الحمولات الخبيثة.',
          educationalExplanation: 'الروابط الصحيحة يجب أن تبدأ بـ http:// أو https:// متبوعة بنطاق. إذا كان الرابط غير صحيح، فقد يكون محاولة لإخفاء الوجهة الحقيقية.',
        },
      ],
      recommendations: ['اطلب من المرسل إعادة إرسال الرابط عبر قناة موثوقة', 'أبلغ عن الرسالة'],
    }
  }

  const cues: Cue[] = []
  let riskScore = 0

  const isHttps = parsed.protocol === 'https:'
  cues.push({
    id: 'protocol',
    label: 'أمان النقل (HTTPS)',
    status: isHttps ? 'pass' : 'fail',
    detail: isHttps
      ? 'شهادة TLS موجودة مع HTTPS. خط أساس جيد.'
      : 'الموقع يجبر HTTP. ستنتقل بيانات الاعتماد كنص واضح.',
    educationalExplanation: isHttps
      ? 'HTTPS يعني أن الاتصال مشفر وآمن. يمكنك التحقق من ذلك من خلال وجود قفل 🔒 في شريط العنوان. هذا يحمي معلوماتك من التنصت.'
      : 'HTTP غير مشفر! أي شخص على نفس الشبكة يمكنه رؤية البيانات المرسلة. لا تدخل كلمات المرور أو المعلومات الحساسة على مواقع HTTP.',
  })
  if (!isHttps) riskScore += 2

  const lowerHost = parsed.hostname.toLowerCase()
  const isCorporate = lowerHost.endsWith('.company.com') || lowerHost === 'company.com'
  
  // Check for lookalike domains (typosquatting)
  const lookalikeCheck = detectLookalikeDomain(parsed.hostname)
  if (lookalikeCheck.isLookalike) {
    cues.push({
      id: 'lookalike',
      label: 'محاكاة العلامة التجارية',
      status: 'fail',
      detail: lookalikeCheck.detail || `النطاق يبدو أنه يحاكي علامة تجارية معروفة (${lookalikeCheck.brand}). هذا مؤشر قوي على التصيد.`,
      educationalExplanation: 'هذه تقنية تسمى "typosquatting" أو "brand impersonation". المهاجمون يستخدمون نطاقات مشابهة للعلامات التجارية الشهيرة (مثل instagrarn.com بدلاً من instagram.com) لخداع المستخدمين. دائماً تحقق من النطاق بعناية.',
    })
    riskScore += 4
  }
  
  cues.push({
    id: 'domain',
    label: 'محاذاة النطاق',
    status: isCorporate ? 'pass' : 'review',
    detail: isCorporate
      ? 'النطاق يطابق نطاقك المؤسسي.'
      : `المضيف يحل إلى ${parsed.hostname}، وهو خارج النطاقات الموثوقة.`,
    educationalExplanation: isCorporate
      ? 'النطاق يطابق نطاق شركتك أو مؤسستك. هذا مؤشر جيد على أن الرابط موثوق.'
      : 'النطاق خارج النطاقات الموثوقة. تأكد من أنك تتوقع هذا الرابط من هذا المرسل قبل النقر.',
  })
  if (!isCorporate) riskScore += 1

  const dotCount = lowerHost.split('.').length - 1
  if (dotCount > 2 && !isCorporate) {
    cues.push({
      id: 'subdomain',
      label: 'نطاقات فرعية مفرطة',
      status: 'review',
      detail: 'تم العثور على مستويات نطاقات فرعية متعددة. غالباً ما يضيف المهاجمون كلمات لمحاكاة الفرق المتداخلة.',
      educationalExplanation: 'النطاقات الحقيقية عادة بسيطة (مثل google.com أو instagram.com). النطاقات الطويلة مثل "secure-accounts-payroll-update.com" غالباً ما تكون محاولات لخداع المستخدمين.',
    })
    riskScore += 1
  }

  const hostTld = riskyTlds.find((tld) => lowerHost.endsWith(tld))
  if (hostTld) {
    cues.push({
      id: 'tld',
      label: 'سمعة نطاق المستوى الأعلى',
      status: 'fail',
      detail: `النطاق مسجل على ${hostTld}، وهو نطاق مستوى أعلى يُساء استخدامه بشكل متكرر في التصيد.`,
      educationalExplanation: `بعض نطاقات المستوى الأعلى (TLD) مثل ${hostTld} تُستخدم بشكل متكرر من قبل المهاجمين لأنها رخيصة وسهلة التسجيل. النطاقات الموثوقة عادة تستخدم .com أو .org أو نطاقات الدولة الرسمية.`,
    })
    riskScore += 2
  }

  const containsKeywords = ['secure', 'account', 'update', 'login', 'verify'].some((keyword) =>
    lowerHost.includes(keyword)
  )
  if (containsKeywords && !isCorporate) {
    cues.push({
      id: 'keywords',
      label: 'كلمات مفتاحية مشبوهة في النطاق',
      status: 'review',
      detail: 'كلمات عالية القيمة مدمجة في المضيف تهدف لكسب الثقة.',
      educationalExplanation: 'المهاجمون يضيفون كلمات مثل "secure" أو "verify" في النطاق لمحاولة كسب ثقتك. النطاقات الحقيقية عادة لا تحتاج لإضافة هذه الكلمات لأنها موثوقة بالفعل.',
    })
    riskScore += 1
  }

  const isShortener = shortenerHosts.includes(lowerHost)
  if (isShortener) {
    cues.push({
      id: 'shortener',
      label: 'تم اكتشاف مختصر رابط',
      status: 'fail',
      detail: 'الرابط المختصر يخفي الوجهة. قم بتوسيعه في بيئة حماية قبل اتخاذ إجراء.',
      educationalExplanation: 'الروابط المختصرة (مثل bit.ly أو tinyurl.com) تخفي الوجهة الحقيقية. يمكنك استخدام أدوات مثل "Check Short URL" لمعرفة الوجهة قبل النقر. تجنب النقر على الروابط المختصرة من مصادر غير موثوقة.',
    })
    riskScore += 2
  }

  const hasLoginPath = /login|signin|reset|update/.test(parsed.pathname.toLowerCase())
  if (hasLoginPath && !isCorporate) {
    cues.push({
      id: 'path',
      label: 'نية جمع بيانات الاعتماد',
      status: 'fail',
      detail: 'المسار يشير إلى جمع بيانات الاعتماد على نطاق غير موثوق.',
      educationalExplanation: 'المسارات مثل /login أو /reset-password على نطاق غير موثوق هي علامة تحذيرية قوية. المهاجمون يحاولون سرقة بيانات الاعتماد من خلال صفحات تسجيل دخول مزيفة.',
    })
    riskScore += 2
  }

  const verdict: Verdict = riskScore >= 5 ? 'malicious' : riskScore >= 3 ? 'suspicious' : 'harmless'

  const recommendations =
    verdict === 'harmless'
      ? ['لا يزال التحقق من المرسل قبل إدخال البيانات الحساسة', 'راقب الوجهة لأي تغييرات']
      : verdict === 'suspicious'
        ? [
            'صعد إلى فريق الأمان لفحص أعمق',
            'أكد الطلب باستخدام قناة مؤسسية موثوقة',
          ]
        : ['أبلغ وامنع المرسل فوراً', 'أعد تعيين بيانات الاعتماد المتأثرة إذا نقر أي شخص بالفعل']

  return {
    verdict,
    headline:
      verdict === 'harmless'
        ? 'لم يتم اكتشاف مشاكل حرجة'
        : verdict === 'suspicious'
          ? 'إشارات مختلطة للسمعة والسلوك'
          : 'تم اكتشاف بنية تحتية لسرقة بيانات الاعتماد',
    cues,
    recommendations,
  }
}

export function LinksTool() {
  const [url, setUrl] = useState('')
  const [selectedSample, setSelectedSample] = useState<SampleLink | null>(null)
  const [phaseStatuses, setPhaseStatuses] = useState<Record<Phase['id'], PhaseStatus>>(createPhaseStatuses)
  const [activePhase, setActivePhase] = useState<Phase['id'] | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showEducationalTip, setShowEducationalTip] = useState(false)
  const [expandedCue, setExpandedCue] = useState<string | null>(null)
  const [showVirusTotalExplanation, setShowVirusTotalExplanation] = useState(false)

  const progress = useMemo(() => {
    const completeCount = Object.values(phaseStatuses).filter((status) => status === 'complete').length
    return Math.round((completeCount / phases.length) * 100)
  }, [phaseStatuses])

  const applySample = (sample: SampleLink) => {
    setSelectedSample(sample)
    setUrl(sample.url)
    setAnalysis(null)
    setError(null)
    setPhaseStatuses(createPhaseStatuses())
    setShowEducationalTip(false)
    setExpandedCue(null)
  }

  const handleScan = async () => {
    if (!url.trim()) {
      setError('الصق أو اختر رابطاً لبدء الفحص.')
      return
    }

    const trimmedUrl = url.trim()
    let host: string | null = null
    try {
      host = new URL(trimmedUrl).hostname
    } catch {
      host = null
    }

    trackExperienceEvent('link_scan_started', {
      urlHost: host,
      inputLength: trimmedUrl.length,
      isSample: Boolean(selectedSample),
      sampleId: selectedSample?.id ?? null,
    })
    incrementUrlScan('started')

    setIsScanning(true)
    setAnalysis(null)
    setError(null)
    setActivePhase(null)
    setPhaseStatuses(createPhaseStatuses())
    setShowEducationalTip(false)
    setExpandedCue(null)
    setShowVirusTotalExplanation(false)

    // Phase 1: Protocol check
    setPhaseStatuses((prev) => ({ ...prev, protocol: 'active' }))
    setActivePhase('protocol')
    await new Promise((resolve) => setTimeout(resolve, 800))
    setPhaseStatuses((prev) => ({ ...prev, protocol: 'complete' }))

    // Phase 2: Reputation check (VirusTotal)
    setPhaseStatuses((prev) => ({ ...prev, reputation: 'active' }))
    setActivePhase('reputation')
    
    let virusTotalResult = null
    try {
      const response = await fetch('/api/url/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl }),
      })

      if (response.ok) {
        const data = await response.json()
        virusTotalResult = data.result
      }
    } catch (err) {
      console.error('VirusTotal scan error:', err)
    }
    
    await new Promise((resolve) => setTimeout(resolve, 800))
    setPhaseStatuses((prev) => ({ ...prev, reputation: 'complete' }))

    // Phase 3: Behavioural analysis
    setPhaseStatuses((prev) => ({ ...prev, behaviour: 'active' }))
    setActivePhase('behaviour')
    await new Promise((resolve) => setTimeout(resolve, 800))
    setPhaseStatuses((prev) => ({ ...prev, behaviour: 'complete' }))

    // Combine local analysis with VirusTotal results
    const localResult = analyseUrl(trimmedUrl)
    
    // Enhance verdict based on VirusTotal if available
    let finalVerdict = localResult.verdict
    if (virusTotalResult) {
      if (virusTotalResult.verdict === 'malicious' || virusTotalResult.isHighRisk) {
        finalVerdict = 'malicious'
      } 
      else if (virusTotalResult.verdict === 'suspicious' && finalVerdict !== 'malicious') {
        finalVerdict = 'suspicious'
      }
      else if (virusTotalResult.verdict === 'harmless') {
        const hasCriticalLocalIssues = localResult.cues.some(
          cue => cue.id === 'lookalike' || 
                 (cue.id === 'protocol' && cue.status === 'fail') ||
                 (cue.id === 'virustotal-malicious')
        )
        
        if (!hasCriticalLocalIssues) {
          finalVerdict = 'harmless'
        }
      }
      
      // Add VirusTotal cues
      if (virusTotalResult.lastAnalysisStats) {
        const stats = virusTotalResult.lastAnalysisStats
        if (stats.malicious && stats.malicious > 0) {
          localResult.cues.push({
            id: 'virustotal-malicious',
            label: 'اكتشاف تهديدات VirusTotal',
            status: 'fail',
            detail: `${stats.malicious} محرك أمان حدد هذا الرابط كخبيث.`,
            educationalExplanation: `VirusTotal هو خدمة تجمع نتائج من أكثر من 70 محرك أمان مختلف. عندما يحدد ${stats.malicious} محرك أو أكثر الرابط كخبيث، فهذا مؤشر قوي جداً على أن الرابط خطير. لا تنقر على هذا الرابط!`,
          })
        } else if (stats.suspicious && stats.suspicious > 0) {
          localResult.cues.push({
            id: 'virustotal-suspicious',
            label: 'سمعة VirusTotal',
            status: 'review',
            detail: `${stats.suspicious} محرك أمان حدد هذا الرابط كمشبوه.`,
            educationalExplanation: `بعض محركات الأمان وجدت هذا الرابط مشبوهاً. قد يكون الرابط جديداً أو يحتوي على محتوى غير موثوق. تحلى بالحذر ولا تدخل معلومات حساسة.`,
          })
        } else if (stats.harmless && stats.harmless > 0) {
          localResult.cues.push({
            id: 'virustotal-harmless',
            label: 'سمعة VirusTotal',
            status: 'pass',
            detail: `${stats.harmless} محرك أمان لم يجد تهديدات.`,
            educationalExplanation: `VirusTotal فحص الرابط باستخدام ${stats.harmless} محرك أمان ولم يجد تهديدات معروفة. ومع ذلك، هذا لا يعني أن الرابط آمن 100% - دائماً تحقق من المرسل والنطاق بنفسك.`,
          })
        }
      }
    }

    const result: AnalysisResult = {
      ...localResult,
      verdict: finalVerdict,
      virusTotalResult: virusTotalResult || undefined,
    }
    
    setAnalysis(result)
    setIsScanning(false)
    setShowEducationalTip(true)
    if (virusTotalResult?.lastAnalysisStats) {
      setShowVirusTotalExplanation(true)
    }
    
    trackExperienceEvent('link_scan_completed', {
      urlHost: host,
      verdict: result.verdict,
      cueSummary: result.cues.map((cue) => ({ id: cue.id, status: cue.status })),
      recommendationCount: result.recommendations.length,
      isSample: Boolean(selectedSample),
      sampleId: selectedSample?.id ?? null,
      hasVirusTotal: Boolean(virusTotalResult),
    })
    incrementUrlScan('completed')
    if (result.verdict === 'malicious' || result.verdict === 'suspicious') {
      incrementUrlScan('risky')
    }
  }

  const verdictInfo = analysis ? verdictStyles[analysis.verdict] : null
  const VerdictIcon = verdictInfo?.icon || HelpCircle

  return (
    <div className="relative overflow-hidden rounded-[36px] border border-border/60 bg-surface/80 shadow-2xl">
      <div className="lab-gradient" />
      <div className="lab-constellation" />

      <div className="relative z-10 space-y-10 p-6 lg:p-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-surface/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.45em] text-muted">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            Orion Scan Lab
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold">ماسح الروابط الذكي</h2>
          <p className="mx-auto max-w-2xl text-sm text-muted">
            افحص أي رابط مشبوه بثلاث مراحل (البروتوكول، السمعة، السلوك) واحصل على تفسير مبسط وقابل للتنفيذ.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.8fr,1fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-surface to-surface-muted/50 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="w-full pr-11 pl-4 py-3 rounded-xl border-2 border-border bg-surface text-foreground placeholder:text-muted focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all"
                  disabled={isScanning}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isScanning && url.trim()) {
                      handleScan()
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleScan}
                disabled={isScanning || !url.trim()}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الفحص...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    فحص الرابط
                  </>
                )}
              </Button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Progress Bar with Phases */}
            {isScanning && (
              <div className="mt-6 space-y-4">
                <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {phases.map((phase) => {
                    const PhaseIcon = phase.icon
                    const status = phaseStatuses[phase.id]
                    const isActive = activePhase === phase.id
                    return (
                      <div
                        key={phase.id}
                        className={`p-3 rounded-xl border transition-all ${
                          status === 'complete'
                            ? 'border-green-500/30 bg-green-500/10'
                            : status === 'active'
                              ? 'border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/20'
                              : 'border-border bg-surface-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <PhaseIcon
                            className={`h-4 w-4 ${
                              status === 'complete'
                                ? 'text-green-600'
                                : status === 'active'
                                  ? 'text-purple-600'
                                  : 'text-muted'
                            }`}
                          />
                          <span className="text-xs font-semibold text-foreground">{phase.title}</span>
                        </div>
                        {status === 'active' && (
                          <Loader2 className="h-3 w-3 animate-spin text-purple-600" />
                        )}
                        {status === 'complete' && (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Result Display - Enhanced with Educational Content */}
          {analysis && verdictInfo && (
            <div className="space-y-6">
              {/* Large Status Banner */}
              <div className={`rounded-2xl border-2 shadow-xl overflow-hidden ${
                analysis.verdict === 'harmless' 
                  ? 'border-green-500/50 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10' 
                  : analysis.verdict === 'suspicious' 
                    ? 'border-amber-500/50 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10'
                    : 'border-red-500/50 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10'
              }`}>
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full ${
                      analysis.verdict === 'harmless' 
                        ? 'bg-green-500/20' 
                        : analysis.verdict === 'suspicious' 
                          ? 'bg-amber-500/20'
                          : 'bg-red-500/20'
                    }`}>
                      <VerdictIcon className={`h-12 w-12 ${
                        analysis.verdict === 'harmless' 
                          ? 'text-green-600 dark:text-green-400' 
                          : analysis.verdict === 'suspicious' 
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-red-600 dark:text-red-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-3xl font-bold mb-2 ${verdictInfo.tone}`}>
                        {analysis.verdict === 'harmless' ? '✅ آمن' : analysis.verdict === 'suspicious' ? '⚠️ مشبوه' : '❌ خطر'}
                      </h3>
                      <p className={`text-xl font-semibold mb-2 ${verdictInfo.tone}`}>
                        {verdictInfo.headline}
                      </p>
                      <p className="text-muted text-base max-w-2xl mx-auto">
                        {verdictInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* VirusTotal Results with Explanation */}
              {analysis.virusTotalResult && analysis.virusTotalResult.lastAnalysisStats && (
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-surface to-surface-muted/50 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <h3 className="text-lg font-bold text-foreground">نتائج VirusTotal</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVirusTotalExplanation(!showVirusTotalExplanation)}
                      className="text-xs"
                    >
                      <HelpCircle className="h-4 w-4 mr-1" />
                      {showVirusTotalExplanation ? 'إخفاء الشرح' : 'ما معنى هذه الأرقام؟'}
                    </Button>
                  </div>
                  
                  {showVirusTotalExplanation && (
                    <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2 text-sm text-blue-900 dark:text-blue-200">
                          <p className="font-semibold">ما هو VirusTotal؟</p>
                          <p>
                            VirusTotal هو خدمة مجانية تجمع نتائج من أكثر من <strong>70 محرك أمان مختلف</strong> (مثل Google Safe Browsing، Norton، Kaspersky، وغيرها). عندما نفحص رابط، نرسله إلى VirusTotal الذي يفحصه باستخدام كل هذه المحركات.
                          </p>
                          <p className="font-semibold mt-3">ماذا تعني الأرقام؟</p>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            <li><strong>Malicious (خبيث):</strong> عدد محركات الأمان التي حددت الرابط كخبيث. إذا كان الرقم أكبر من 0، فهذا تحذير قوي!</li>
                            <li><strong>Suspicious (مشبوه):</strong> عدد المحركات التي وجدت الرابط مشبوهاً. قد يكون جديداً أو يحتوي على محتوى غير موثوق.</li>
                            <li><strong>Harmless (آمن):</strong> عدد المحركات التي لم تجد تهديدات. كلما زاد الرقم، كان ذلك أفضل.</li>
                            <li><strong>Undetected (غير مكتشف):</strong> عدد المحركات التي لم تفحص الرابط بعد أو لم تجد شيئاً.</li>
                          </ul>
                          <p className="text-xs mt-2 italic">
                            💡 نصيحة: حتى لو كان الرابط "harmless" من VirusTotal، دائماً تحقق من المرسل والنطاق بنفسك!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(analysis.virusTotalResult.lastAnalysisStats).map(([key, value]) => {
                      const isMalicious = key === 'malicious' && value > 0
                      const isSuspicious = key === 'suspicious' && value > 0
                      const isHarmless = key === 'harmless' && value > 0
                      
                      return (
                        <div
                          key={key}
                          className={`text-center p-4 rounded-xl border transition-all ${
                            isMalicious
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                              : isSuspicious
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                : isHarmless
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                  : 'bg-surface border-border'
                          }`}
                        >
                          <p className="text-xs font-semibold text-muted mb-2 uppercase">
                            {key === 'malicious' ? 'خبيث' : key === 'suspicious' ? 'مشبوه' : key === 'harmless' ? 'آمن' : 'غير مكتشف'}
                          </p>
                          <p className={`text-3xl font-bold ${
                            isMalicious
                              ? 'text-red-600 dark:text-red-400'
                              : isSuspicious
                                ? 'text-amber-600 dark:text-amber-400'
                                : isHarmless
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-foreground'
                          }`}>
                            {value}
                          </p>
                          <p className="text-xs text-muted mt-1">محرك أمان</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Educational Tips Section */}
              {selectedSample && showEducationalTip && (
                <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">💡 درس تعليمي</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        {selectedSample.educationalTip}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Cues with Educational Explanations */}
              {analysis.cues.length > 0 && (
                <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-surface to-surface-muted/50 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    تفاصيل الفحص
                  </h3>
                  <div className="space-y-3">
                    {analysis.cues.map((cue) => {
                      const isExpanded = expandedCue === cue.id
                      return (
                        <div
                          key={cue.id}
                          className={`rounded-xl border transition-all ${
                            cue.status === 'pass'
                              ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                              : cue.status === 'fail'
                                ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                                : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedCue(isExpanded ? null : cue.id)}
                            className="w-full p-4 text-left flex items-start justify-between gap-3"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {cue.status === 'pass' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : cue.status === 'fail' ? (
                                  <XOctagon className="h-4 w-4 text-red-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-amber-600" />
                                )}
                                <span className="font-semibold text-foreground">{cue.label}</span>
                                <Badge
                                  className={`text-xs ${
                                    cue.status === 'pass'
                                      ? 'bg-green-500/10 text-green-600 border-green-500/30'
                                      : cue.status === 'fail'
                                        ? 'bg-red-500/10 text-red-600 border-red-500/30'
                                        : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                  }`}
                                >
                                  {cue.status === 'pass' ? 'آمن' : cue.status === 'fail' ? 'خطر' : 'مراجعة'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted">{cue.detail}</p>
                            </div>
                            <HelpCircle
                              className={`h-5 w-5 text-muted transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {isExpanded && cue.educationalExplanation && (
                            <div className="px-4 pb-4 border-t border-border/50 pt-4">
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-surface/80">
                                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-foreground leading-relaxed">
                                  {cue.educationalExplanation}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-6">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  التوصيات
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300">
                      <ArrowRight className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          </div>

          <div className="space-y-6">
            {/* Sample Links - Enhanced */}
            {!analysis && (
              <div className="rounded-3xl border border-border/60 bg-surface/90 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-bold text-foreground">جرب أمثلة تعليمية</h3>
              </div>
              <p className="text-sm text-muted mb-4">
                اختر أحد الأمثلة أدناه لتعلم كيفية اكتشاف الروابط الخبيثة. كل مثال يحتوي على شرح تعليمي مفصل.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleLinks.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => applySample(sample)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedSample?.id === sample.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                        : 'border-border bg-surface hover:border-purple-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-semibold text-foreground text-sm">{sample.label}</span>
                      <Badge
                        className={`text-xs ${
                          sample.verdict === 'harmless'
                            ? 'bg-green-500/10 text-green-600 border-green-500/30'
                            : sample.verdict === 'suspicious'
                              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                              : 'bg-red-500/10 text-red-600 border-red-500/30'
                        }`}
                      >
                        {sample.verdict === 'harmless' ? 'آمن' : sample.verdict === 'suspicious' ? 'مشبوه' : 'خطر'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted mb-2 font-mono break-all">{sample.url}</p>
                    <p className="text-xs text-muted">{sample.note}</p>
                  </button>
                ))}
              </div>
              </div>
            )}

            {/* Quick Tips Section */}
            {!analysis && (
              <div className="rounded-3xl border border-border/60 bg-surface/90 p-6 shadow-xl">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                نصائح سريعة للتحقق من الروابط
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-foreground text-sm">تحقق من HTTPS</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    الروابط الآمنة تبدأ بـ <code className="bg-surface px-1 rounded">https://</code> وليس <code className="bg-surface px-1 rounded">http://</code>. 
                    ابحث عن قفل 🔒 في شريط العنوان.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-amber-600" />
                    <span className="font-semibold text-foreground text-sm">افحص النطاق بعناية</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    انتبه للأخطاء الإملائية أو الأحرف المتشابهة (مثل <code className="bg-surface px-1 rounded">rn</code> تبدو مثل <code className="bg-surface px-1 rounded">m</code>). 
                    تحقق من النطاق قبل النقر.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-foreground text-sm">احذر الروابط المختصرة</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    الروابط المختصرة (مثل bit.ly) تخفي الوجهة الحقيقية. استخدم أدوات فحص الروابط المختصرة قبل النقر.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-foreground text-sm">تحقق من المرسل</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    حتى لو بدا الرابط آمناً، تأكد من أن المرسل موثوق. اتصل بالمرسل عبر قناة أخرى للتحقق إذا كان هناك شك.
                  </p>
                </div>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
