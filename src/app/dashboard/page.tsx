import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { InteractionHistory, type InteractionEntry } from '@/components/user/InteractionHistory'
import { RiskScoreDisplay, type RiskScoreEntry } from '@/components/user/RiskScoreDisplay'
import { VulnerabilityInjection } from '@/components/user/VulnerabilityInjection'
import { StealthAdInjection } from '@/components/user/StealthAdInjection'
import { StealthScoreDisplay } from '@/components/user/StealthScoreDisplay'
import { AutoInjectTrigger } from '@/components/user/AutoInjectTrigger'
import { EducationalVideos } from '@/components/user/EducationalVideos'
import { LocaleText } from '@/components/common/LocaleText'
import { UserActivityStats } from '@/components/dashboard/UserActivityStats'
import { LocalInteractionStats } from '@/components/dashboard/LocalInteractionStats'
import { LocalGameStats } from '@/components/dashboard/LocalGameStats'
import { LocalAllStats } from '@/components/dashboard/LocalAllStats'
import { 
  History, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Award,
  BarChart3,
  Clock,
  Zap,
  Search,
  Link2,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getRiskLevel, getRiskColor } from '@/lib/risk-score'

export default async function DashboardPage() {
  const user = await requireAuth()

  if (user.role === 'ADMIN') {
    redirect('/dashboard/admin')
  }

  const supabase = await createClient()

  // Fetch ALL events for accurate statistics calculation
  const { data: allEventsRaw } = await supabase
    .from('events')
    .select(`
      id, 
      type, 
      created_at, 
      campaign_id,
      meta,
      campaigns(title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch limited events for display (last 20)
  const { data: eventsRaw } = await supabase
    .from('events')
    .select(`
      id, 
      type, 
      created_at, 
      campaign_id,
      meta,
      campaigns(title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch ALL risk scores for accurate statistics calculation
  const { data: allRiskScoresRaw } = await supabase
    .from('risk_scores')
    .select(`
      id, 
      score, 
      updated_at, 
      campaign_id,
      campaigns(title)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  // Fetch limited risk scores for display (last 10)
  const { data: riskScoresRaw } = await supabase
    .from('risk_scores')
    .select(`
      id, 
      score, 
      updated_at, 
      campaign_id,
      campaigns(title)
    `)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(10)

  // Fetch experience events for game and URL scan statistics
  const { data: experienceEventsRaw } = await supabase
    .from('experience_events')
    .select('id, event, payload, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch link scans from user's campaigns
  const { data: userCampaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('created_by', user.id)

  const campaignIds = (userCampaigns ?? []).map(c => c.id)
  
  let linkScansRaw: any[] = []
  if (campaignIds.length > 0) {
    const { data } = await supabase
      .from('link_scans')
      .select('id, url, status, risk_label, created_at')
      .in('campaign_id', campaignIds)
      .order('created_at', { ascending: false })
    linkScansRaw = data ?? []
  }

  // Fetch phishing links created by user
  const { data: phishingLinksRaw } = await supabase
    .from('phishing_links')
    .select('id, slug, name, template_type, visits, submissions_count, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  // Fetch phishing submissions for user's links
  const phishingLinkIds = (phishingLinksRaw ?? []).map(link => link.id)
  let phishingSubmissionsRaw: any[] = []
  if (phishingLinkIds.length > 0) {
    const { data } = await supabase
      .from('phishing_submissions')
      .select('id, phishing_link_id, created_at')
      .in('phishing_link_id', phishingLinkIds)
      .order('created_at', { ascending: false })
    phishingSubmissionsRaw = data ?? []
  }

  // Map all events for statistics
  const allEvents: InteractionEntry[] = (allEventsRaw ?? []).map((event: any) => {
    const campaign = event.campaigns as { title?: string | null } | null | undefined
    return {
      id: event.id,
      type: event.type,
      created_at: event.created_at,
      campaign: campaign?.title ?? null,
      meta: event.meta ?? null,
    }
  })

  // Map limited events for display
  const events: InteractionEntry[] = (eventsRaw ?? []).map((event: any) => {
    const campaign = event.campaigns as { title?: string | null } | null | undefined
    return {
      id: event.id,
      type: event.type,
      created_at: event.created_at,
      campaign: campaign?.title ?? null,
      meta: event.meta ?? null,
    }
  })

  // Map all risk scores for statistics
  const allRiskScores: RiskScoreEntry[] = (allRiskScoresRaw ?? []).map((score: any) => {
    const campaign = score.campaigns as { title?: string | null } | null | undefined
    return {
      id: score.id,
      score: score.score,
      updated_at: score.updated_at,
      campaign: campaign?.title ?? null,
    }
  })

  // Map limited risk scores for display
  const riskScores: RiskScoreEntry[] = (riskScoresRaw ?? []).map((score: any) => {
    const campaign = score.campaigns as { title?: string | null } | null | undefined
    return {
      id: score.id,
      score: score.score,
      updated_at: score.updated_at,
      campaign: campaign?.title ?? null,
    }
  })

  // Calculate statistics using ALL data
  const totalEvents = allEvents.length
  const reportedCount = allEvents.filter(e => e.type === 'REPORT').length
  const clickedCount = allEvents.filter(e => e.type === 'CLICK').length
  const openedCount = allEvents.filter(e => e.type === 'OPEN').length
  // Calculate percentages
  const reportRate = totalEvents > 0 ? Math.round((reportedCount / totalEvents) * 100) : 0
  const clickRate = totalEvents > 0 ? Math.round((clickedCount / totalEvents) * 100) : 0

  // Calculate URL scan statistics from experience events
  const urlScanEvents = (experienceEventsRaw ?? []).filter(
    e => e.event === 'link_scan_started' || e.event === 'link_scan_completed'
  )
  const urlScansStarted = (experienceEventsRaw ?? []).filter(e => e.event === 'link_scan_started').length
  const urlScansCompleted = (experienceEventsRaw ?? []).filter(e => e.event === 'link_scan_completed').length
  const totalUrlScans = urlScansStarted // Total scans initiated
  const completedUrlScans = urlScansCompleted
  const urlScansFromCampaigns = (linkScansRaw ?? []).length
  const totalUrlScansCount = totalUrlScans + urlScansFromCampaigns

  // Calculate game statistics from experience events
  const gameEvents = (experienceEventsRaw ?? []).filter(
    e => e.event === 'phishing_clue_revealed' || 
         e.event === 'phishing_decision_made' || 
         e.event === 'phishing_drill_reset'
  )
  const gameCluesRevealed = (experienceEventsRaw ?? []).filter(e => e.event === 'phishing_clue_revealed').length
  const gameDecisionsMade = (experienceEventsRaw ?? []).filter(e => e.event === 'phishing_decision_made').length
  const gameDrillsReset = (experienceEventsRaw ?? []).filter(e => e.event === 'phishing_drill_reset').length
  const totalGameInteractions = gameEvents.length

  // Calculate risky URL scans (from link_scans with high risk labels)
  const riskyUrlScans = (linkScansRaw ?? []).filter(
    scan => scan.risk_label === 'malicious' || scan.risk_label === 'suspicious'
  ).length

  // Calculate phishing statistics
  const totalPhishingLinks = (phishingLinksRaw ?? []).length
  const totalPhishingVisits = (phishingLinksRaw ?? []).reduce((sum, link) => sum + (link.visits || 0), 0)
  const totalPhishingSubmissions = phishingSubmissionsRaw.length
  const activePhishingLinks = (phishingLinksRaw ?? []).filter(link => (link.submissions_count || 0) > 0).length
  const phishingLinksByTemplate = (phishingLinksRaw ?? []).reduce((acc, link) => {
    const template = link.template_type || 'unknown'
    acc[template] = (acc[template] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Risk calculations using ALL risk scores
  const totalRisk = allRiskScores.reduce((sum, score) => sum + score.score, 0)
  const averageRisk = allRiskScores.length > 0 ? Math.round(totalRisk / allRiskScores.length) : 0
  const riskLevel = getRiskLevel(averageRisk)
  const riskColorClass = getRiskColor(averageRisk)
  
  // Calculate improvement trend (compare last 5 vs previous 5) using all scores
  const sortedAllScores = [...allRiskScores].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )
  const recentScores = sortedAllScores.slice(0, 5)
  const olderScores = sortedAllScores.slice(5, 10)
  const recentAvg = recentScores.length > 0 
    ? Math.round(recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length)
    : 0
  const olderAvg = olderScores.length > 0
    ? Math.round(olderScores.reduce((sum, s) => sum + s.score, 0) / olderScores.length)
    : 0
  const riskTrend = recentAvg > 0 && olderAvg > 0 ? recentAvg - olderAvg : 0
  
  // Calculate response time (average time between OPEN and REPORT/CLICK) using all events
  const responseTimes: number[] = []
  allEvents.forEach((event) => {
    if (event.type === 'OPEN') {
      // Find the next REPORT or CLICK event for the same campaign
      const nextAction = allEvents.find(e => 
        e.campaign === event.campaign && 
        (e.type === 'REPORT' || e.type === 'CLICK') &&
        new Date(e.created_at).getTime() > new Date(event.created_at).getTime()
      )
      if (nextAction) {
        const timeDiff = new Date(nextAction.created_at).getTime() - new Date(event.created_at).getTime()
        if (timeDiff > 0) {
          responseTimes.push(timeDiff / 1000 / 60) // Convert to minutes
        }
      }
    }
  })
  const avgResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length)
    : 0
  const displayName = user.name || user.email?.split('@')[0] || 'User'
  const reportPerformance = reportRate >= 70 ? { en: 'Excellent', ar: 'ممتاز' } : reportRate >= 50 ? { en: 'Good', ar: 'جيد' } : { en: 'Needs improvement', ar: 'يحتاج تحسين' }
  const clickPerformance = clickRate < 20 ? { en: 'Excellent', ar: 'ممتاز' } : clickRate < 40 ? { en: 'Good', ar: 'جيد' } : { en: 'Needs improvement', ar: 'يحتاج تحسين' }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <AutoInjectTrigger />
      <Navbar userRole={user.role} />
      <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-surface/80 p-8 shadow-2xl">
          <div className="lab-gradient" />
          <div className="lab-constellation" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="eyebrow">
                <LocaleText en="Command center" ar="مركز القيادة" />
              </div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                <LocaleText en={`Welcome ${displayName}`} ar={`مرحباً ${displayName}`} />
              </h1>
              <p className="text-sm text-muted">
                <LocaleText
                  en="Monitor every simulation and suspect link from a single view inspired by advanced threat platforms."
                  ar="راقب كل محاكاة وروابط مشبوهة في لوحة واحدة مستوحاة من منصات التهديدات المتقدمة."
                />
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="stat-pill">
                  <LocaleText en={`Report rate ${reportRate}%`} ar={`معدل الإبلاغ ${reportRate}%`} />
                </span>
                <span className="stat-pill">
                  <LocaleText
                    en={`Response time ${avgResponseTime > 0 ? `${avgResponseTime}m` : '<5m'}`}
                    ar={`وقت الاستجابة ${avgResponseTime > 0 ? `${avgResponseTime}m` : '<5m'}`}
                  />
                </span>
              </div>
            </div>
            <LocalInteractionStats />
          </div>
          <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-2">
            <Link href="/dashboard/url-scan" className="rounded-2xl border border-border/50 bg-surface/70 p-5 transition hover:border-accent/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted">
                    <LocaleText en="Quick scan" ar="الفحص السريع" />
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    <LocaleText en="Instant link scan" ar="فحص الروابط المباشر" />
                  </p>
                </div>
                <Search className="h-5 w-5 text-accent" />
              </div>
              <p className="mt-2 text-sm text-muted">
                <LocaleText
                  en="Provide fast protection for any email or unknown link."
                  ar="حماية فورية لأي رسالة بريد أو رابط مجهول المصدر."
                />
              </p>
            </Link>
            <Link href="/dashboard/threat-map" className="rounded-2xl border border-border/50 bg-surface/70 p-5 transition hover:border-accent/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted">
                    <LocaleText en="Live intel" ar="استخبارات مباشرة" />
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    <LocaleText en="Threat map" ar="خريطة التهديدات" />
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <p className="mt-2 text-sm text-muted">
                <LocaleText
                  en="See exactly where the next campaign is spreading worldwide."
                  ar="اعرف بالضبط أين تنتشر الحملة التالية حول العالم."
                />
              </p>
            </Link>
          </div>
        </section>

        <div className="mt-10">
          <UserActivityStats />
        </div>

        <LocalAllStats />

        <div className="mt-10">
          <VulnerabilityInjection />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-8 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-purple-500/15 p-3 text-purple-300">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  <LocaleText en="Link scanner" ar="فحص الروابط" />
                </h2>
                <p className="text-sm text-muted">
                  <LocaleText en="Deep analysis for the suspicious link" ar="تحليل معمّق للرابط المشبوه" />
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">
              <LocaleText
                en="Run any URL through protocol, reputation, and behavior phases with a human-friendly explanation."
                ar="قم بتمرير أي رابط عبر مراحل البروتوكول، السمعة، والسلوك مع تفسير مبسط للمستخدم النهائي."
              />
            </p>
            <Link href="/dashboard/url-scan">
              <Button variant="outline" className="mt-6 w-full justify-center rounded-full border-border/60 text-base">
                <LocaleText en="Launch scanner" ar="تشغيل أداة الفحص" />
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-8 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  <LocaleText en="Threat map" ar="خريطة التهديدات" />
                </h2>
                <p className="text-sm text-muted">
                  <LocaleText en="Live global snapshot" ar="صورة عالمية حية" />
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">
              <LocaleText
                en="Track campaigns aiming at your region and time them with upcoming awareness pushes."
                ar="تتبع الحملات التي تستهدف منطقتك وقم بتوقيتها مع برامجك التدريبية القادمة."
              />
            </p>
            <Link href="/dashboard/threat-map">
              <Button variant="outline" className="mt-6 w-full justify-center rounded-full border-border/60 text-base">
                <LocaleText en="Explore the map" ar="استكشف الخريطة" />
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-8 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-red-500/15 p-3 text-red-300">
                <Link2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  <LocaleText en="Phishing Pages" ar="صفحات التصيد" />
                </h2>
                <p className="text-sm text-muted">
                  <LocaleText en="Create and manage phishing pages" ar="إنشاء وإدارة صفحات التصيد" />
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">
              <LocaleText
                en="Create educational phishing pages with templates (Instagram, Google, Facebook, etc.) and track submissions."
                ar="أنشئ صفحات تصيد تعليمية باستخدام قوالب جاهزة (إنستغرام، جوجل، فيسبوك، إلخ) وتتبع البيانات المدخلة."
              />
            </p>
            <Link href="/dashboard/phishing">
              <Button variant="outline" className="mt-6 w-full justify-center rounded-full border-border/60 text-base">
                <LocaleText en="Create pages" ar="إنشاء صفحات" />
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-8 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 text-purple-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  <LocaleText en="AI Security Assistant" ar="مساعد الأمن الذكي" />
                </h2>
                <p className="text-sm text-muted">
                  <LocaleText en="Interactive AI-powered training" ar="تدريب تفاعلي مدعوم بالذكاء الاصطناعي" />
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted">
              <LocaleText
                en="Practice security scenarios, ask questions, and get personalized guidance on cybersecurity best practices."
                ar="تدرب على سيناريوهات الأمن، اطرح الأسئلة واحصل على إرشادات مخصصة حول أفضل ممارسات الأمن السيبراني."
              />
            </p>
            <Link href="/dashboard/ai-chat">
              <Button variant="outline" className="mt-6 w-full justify-center rounded-full border-border/60 text-base">
                <LocaleText en="Start chatting" ar="ابدأ المحادثة" />
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <EducationalVideos />
        </div>

        {totalEvents > 0 && (
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-blue-500/15 p-2 text-blue-300">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">
                  <LocaleText en="Performance analysis" ar="تحليل الأداء" />
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-surface/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/15 p-2 text-green-300">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        <LocaleText en="Report rate" ar="معدل الإبلاغ" />
                      </p>
                      <p className="text-xs text-muted">
                        <LocaleText en="Percentage of reports during the recent window" ar="نسبة البلاغات خلال الفترة الأخيرة" />
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{reportRate}%</p>
                    <p className="text-xs text-muted">
                      <LocaleText en={reportPerformance.en} ar={reportPerformance.ar} />
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-surface/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-yellow-500/15 p-2 text-yellow-300">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        <LocaleText en="Click rate" ar="معدل النقر" />
                      </p>
                      <p className="text-xs text-muted">
                        <LocaleText en="Links that were clicked" ar="روابط تم النقر عليها" />
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{clickRate}%</p>
                    <p className="text-xs text-muted">
                      <LocaleText en={clickPerformance.en} ar={clickPerformance.ar} />
                    </p>
                  </div>
                </div>
                {avgResponseTime > 0 && (
                  <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-surface/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-blue-500/15 p-2 text-blue-300">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          <LocaleText en="Average response time" ar="متوسط وقت الاستجابة" />
                        </p>
                        <p className="text-xs text-muted">
                          <LocaleText en="Time between open and report" ar="الوقت بين الفتح والإبلاغ" />
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold">{avgResponseTime}</p>
                      <p className="text-xs text-muted">
                        <LocaleText en="Minutes" ar="دقيقة" />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-accent/20 p-2 text-accent">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">نصائح سريعة</h3>
              </div>
              <div className="space-y-3 text-sm text-muted">
                {reportRate < 70 && (
                  <p className="rounded-2xl border border-border/30 bg-surface/70 p-3">
                    <LocaleText en="💡 Increase how quickly you report any suspicious message." ar="💡 زد من سرعة الإبلاغ عن أي رسالة مريبة." />
                  </p>
                )}
                {clickRate > 20 && (
                  <p className="rounded-2xl border border-border/30 bg-surface/70 p-3">
                    <LocaleText en="⚠️ Remind the team to inspect links before opening." ar="⚠️ أعِد تذكير الفريق بفحص الروابط قبل فتحها." />
                  </p>
                )}
                {averageRisk > 10 && (
                  <p className="rounded-2xl border border-border/30 bg-surface/70 p-3">
                    <LocaleText en="🛡️ Review password policies and enforce MFA." ar="🛡️ قم بمراجعة سياسات كلمات المرور وتفعيل المصادقة." />
                  </p>
                )}
                {reportRate >= 70 && clickRate < 20 && averageRisk <= 10 && (
                  <p className="rounded-2xl border border-green-500/40 bg-green-500/10 p-3 text-green-100">
                    <LocaleText en="🎉 Stellar performance—keep the cadence." ar="🎉 أداء مثالي – استمر بنفس الإيقاع." />
                  </p>
                )}
                <Link href="/dashboard/phishing">
                  <Button className="mt-4 w-full rounded-full">
                    <LocaleText en="Start new training" ar="ابدأ تدريب جديد" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-accent/20 p-2 text-accent">
                  <History className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">
                  <LocaleText en="Recent interactions" ar="آخر التفاعلات" />
                </h3>
              </div>
              {events.length > 0 && <span className="rounded-full border border-border/50 px-2 py-1 text-xs text-muted">{events.length}</span>}
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <InteractionHistory events={events} />
            </div>
          </div>
          <div className="rounded-3xl border border-border/50 bg-surface/80 p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-accent/20 p-2 text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">
                  <LocaleText en="Risk tracking" ar="تتبع المخاطر" />
                </h3>
              </div>
              {riskScores.length > 0 && <span className="rounded-full border border-border/50 px-2 py-1 text-xs text-muted">{riskScores.length}</span>}
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-2">
              <RiskScoreDisplay scores={riskScores} />
            </div>
          </div>
          <div>
            <StealthScoreDisplay />
          </div>
        </div>
      </main>
      <StealthAdInjection position="bottom" />
      <StealthAdInjection position="popup" />
    </div>
  )
}
