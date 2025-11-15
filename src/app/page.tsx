"use client";

import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowRight, BarChart3, Link2, Mail, PlayCircle, Shield, Sparkles, Target } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { usePreferences } from "@/context/preferences-context";
import type { Locale } from "@/lib/i18n/config";

type LocalizedText = Record<Locale, string>;

type LocalizedNavLink = {
  id: string;
  href: string;
  label: LocalizedText;
};

type LocalizedStat = {
  id: string;
  value: string;
  label: LocalizedText;
  detail: LocalizedText;
};

type LocalizedFeature = {
  id: string;
  icon: LucideIcon;
  meta: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  points: LocalizedText[];
};

type LocalizedLayer = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  items: LocalizedText[];
};

type LocalizedPlatformCard = {
  id: string;
  eyebrow: LocalizedText;
  value: LocalizedText;
  description: LocalizedText;
  link?: {
    href: string;
    label: LocalizedText;
  };
};

const headerCopy: Record<Locale, { badge: string; status: string }> = {
  en: {
    badge: "CyberMirror 2.0",
    status: "Ready",
  },
  ar: {
    badge: "سايبر ميرور 2.0",
    status: "جاهز",
  },
};

const heroCopy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  }
> = {
  en: {
    eyebrow: "Cyber awareness platform",
    title: "هلا والله",
    description:
      "Recreate the rigor of TryHackMe or BlackHat security teams with phishing campaigns, link scanning, and contextual coaching that keeps every employee alert without overwhelming the UI.",
    primaryCta: "Launch the dashboard",
    secondaryCta: "Watch the tour",
  },
  ar: {
    eyebrow: "منصة وعي سيبراني",
    title: "تجربة تدريب تشبه غرف العمليات لدى الكيانات الكبرى",
    description:
      "استنسخ صرامة فرق الأمن في TryHackMe أو BlackHat من خلال حملات تصيّد، فحص روابط، وتغذية راجعة سياقية تُبقي الفرق في حالة تأهب دون تعقيد واجهة الاستخدام.",
    primaryCta: "ابدأ لوحة القيادة",
    secondaryCta: "مشاهدة جولة المنصة",
  },
};

const trustCopy: LocalizedText = {
  en: "Trusted by security-first teams",
  ar: "موثوق من فرق تركّز على الأمن أولاً",
};

const navLinks = [
  { id: "platform", href: "#platform", label: { en: "Platform", ar: "المنصة" } },
  { id: "products", href: "#products", label: { en: "Features", ar: "المزايا" } },
  { id: "academy", href: "#academy", label: { en: "Learning", ar: "التعلّم" } },
] satisfies LocalizedNavLink[];

const stats = [
  {
    id: "campaigns",
    value: "12K+",
    label: { en: "Campaigns launched", ar: "حملات مُنفّذة" },
    detail: { en: "Across high-sensitivity environments", ar: "في بيئات عالية الحساسية" },
  },
  {
    id: "protected-users",
    value: "180K",
    label: { en: "Protected users", ar: "مستخدمون محميون" },
    detail: { en: "Across the globe", ar: "على مستوى العالم" },
  },
  {
    id: "click-drop",
    value: "-63%",
    label: { en: "Click reduction", ar: "انخفاض النقر" },
    detail: { en: "Average after 6 weeks", ar: "متوسط خلال 6 أسابيع" },
  },
] satisfies LocalizedStat[];

const features = [
  {
    id: "campaign-lab",
    icon: Mail,
    meta: { en: "Campaigns", ar: "حملات" },
    title: { en: "Controlled attack lab", ar: "مختبر هجمات مُسيطر عليها" },
    description: {
      en: "Design multi-stage phishing scenarios with automated tracking and localized messaging.",
      ar: "صمّم سيناريوهات تصيّد متعددة المراحل مع محاكاة التتبع التلقائية واللغات المحلية.",
    },
    points: [
      { en: "Approved scripts & copy", ar: "نصوص ورسائل مُعتمدة" },
      { en: "Risk-aware smart recurrence", ar: "تكرار ذكي قائم على المخاطر" },
    ],
  },
  {
    id: "link-engine",
    icon: Link2,
    meta: { en: "Instant scan", ar: "فحص فوري" },
    title: { en: "Link scanning engine", ar: "محرّك فحص الروابط" },
    description: {
      en: "Instant analysis of structure, reputation, and VirusTotal results with friendly explanations.",
      ar: "تحليل فوري للبنية، السمعة، ونتائج VirusTotal مع تفسير مبسّط للمستخدم النهائي.",
    },
    points: [
      { en: "VirusTotal integration", ar: "دمج VirusTotal" },
      { en: "Lookalike domain detection", ar: "كشف النطاقات الشبيهة" },
    ],
  },
  {
    id: "risk-intel",
    icon: BarChart3,
    meta: { en: "Analytics", ar: "تحليلات" },
    title: { en: "Live risk intelligence", ar: "ذكاء المخاطر المباشر" },
    description: {
      en: "Dashboards highlight risk, response, and readiness with actionable recommendations.",
      ar: "واجهات عرض تعرض المخاطر، الاستجابة، والجاهزية مع توصيات فورية قابلة للتنفيذ.",
    },
    points: [
      { en: "Interactive control center", ar: "لوحة قيادة تفاعلية" },
      { en: "Team-level KPIs", ar: "مؤشرات أداء فريقية" },
    ],
  },
] satisfies LocalizedFeature[];

const platformCopy: Record<Locale, { eyebrow: string; title: string; description: string }> = {
  en: {
    eyebrow: "Command center",
    title: "Each layer wired to real-time tracking",
    description: "Plan, launch, and measure awareness impact in a cohesive interface inspired by enterprise SOC tooling.",
  },
  ar: {
    eyebrow: "مركز القيادة",
    title: "كل طبقة متصلة بتتبع فوري",
    description: "تخطيط، تنفيذ، وقياس تأثير التدريب في واجهة واحدة متناسقة مستوحاة من منصات الأمن المؤسسية.",
  },
};

const alwaysOnLabel: LocalizedText = {
  en: "Always on",
  ar: "متاح دائماً",
};

const platformLayers = [
  {
    id: "campaign",
    title: { en: "Campaign Lab", ar: "مختبر الحملات" },
    description: {
      en: "Visual workflow to craft realistic content and arrange targeting & approvals.",
      ar: "سير عمل بصري لصياغة محتوى واقعي وترتيب مسارات الاستهداف والاعتماد.",
    },
    items: [
      { en: "Drag-and-drop builder", ar: "محرر سحب وإفلات" },
      { en: "Signed template library", ar: "مكتبة قوالب موقّعة" },
      { en: "Realistic mail simulation", ar: "محاكاة بريد واقعية" },
    ],
  },
  {
    id: "response",
    title: { en: "Response Cloud", ar: "سحابة الاستجابة" },
    description: {
      en: "Live interactions stream into the dashboard with contextual alerts and nudges.",
      ar: "يتم بث التفاعلات في الوقت الفعلي إلى لوحة القيادة مع تنبيهات سياقية ومهام للتوعية.",
    },
    items: [
      { en: "Slack & Teams alerts", ar: "تنبيهات Slack وTeams" },
      { en: "Auto tickets", ar: "تذاكر تلقائية" },
      { en: "Contextual training cards", ar: "بطاقات تدريب سياقية" },
    ],
  },
  {
    id: "learning",
    title: { en: "Learning Stream", ar: "مسار التعلّم" },
    description: {
      en: "Micro lessons adapt to behavior and threat level across multiple languages.",
      ar: "مقاطع دقيقة متعددة اللغات وممرات تدريبية تتكيف مع سلوك المستخدم ومستوى التهديد.",
    },
    items: [
      { en: "Video library", ar: "مكتبة فيديو" },
      { en: "Comprehension metrics", ar: "مقاييس فهم" },
      { en: "Instant translation", ar: "ترجمة آنية" },
    ],
  },
] satisfies LocalizedLayer[];

const platformCards: LocalizedPlatformCard[] = [
  {
    id: "live-risk",
    eyebrow: { en: "Live risk", ar: "المخاطر المباشرة" },
    value: { en: "+92", ar: "+92" },
    description: {
      en: "Progress points captured across the last 30-day campaign.",
      ar: "نقاط تقدم خلال آخر حملة مدتها 30 يوماً.",
    },
  },
  {
    id: "scanner",
    eyebrow: { en: "Instant scanner", ar: "الفحص الفوري" },
    value: { en: "Automation ready", ar: "جاهز للأتمتة" },
    description: {
      en: "Build link-scanning protocols and ship them to Slack or email in under a minute.",
      ar: "بناء بروتوكولات فحص الروابط وربطها مع Slack أو البريد في أقل من دقيقة.",
    },
    link: {
      href: "/dashboard/url-scan",
      label: { en: "Open the scanner", ar: "افتح أداة الفحص" },
    },
  },
  {
    id: "pulse",
    eyebrow: { en: "Pulse", ar: "نبض" },
    value: { en: "96% readiness", ar: "96% جاهزية" },
    description: {
      en: "Employees completed the required weekly interaction.",
      ar: "الموظفون أكملوا التفاعل المطلوب الأسبوعي.",
    },
  },
] satisfies LocalizedPlatformCard[];

const modulesCopy: Record<Locale, { eyebrow: string; title: string; description: string }> = {
  en: {
    eyebrow: "Modules",
    title: "A consistent platform across every touchpoint",
    description: "Every section mirrors elite training environments yet stays simple enough for lean security teams.",
  },
  ar: {
    eyebrow: "الوحدات",
    title: "منصة متسقة عبر كل لمسة",
    description: "كل قسم من CyberMirror مصمم ليحاكي بيئات التدريب المتقدمة لكنه يظل بسيطاً بما يكفي للفِرق الصغيرة.",
  },
};

const academyCopy: Record<Locale, { eyebrow: string; title: string; description: string }> = {
  en: {
    eyebrow: "Cyber Academy",
    title: "A three-phase applied curriculum",
    description: "From modeling to reinforcement, each stage gives practical feedback the moment someone interacts.",
  },
  ar: {
    eyebrow: "أكاديمية السايبر",
    title: "منهج عملي من ثلاث مراحل",
    description: "من البناء وحتى التقييم، المنهج مصمم ليحصل المستخدم على تغذية راجعة عملية في كل خطوة.",
  },
};

const academyTimeline = [
  {
    step: "01",
    title: { en: "Modeling", ar: "النمذجة" },
    description: {
      en: "Assess your current risk posture, surface the impactful gaps, and link them to business goals.",
      ar: "قياس الوضع الحالي للمخاطر، تحديد أكثر الثغرات تأثيراً، وربطها بأهداف العمل.",
    },
  },
  {
    step: "02",
    title: { en: "Activation", ar: "التفعيل" },
    description: {
      en: "Run phishing campaigns, micro-lessons, and risky links directly in daily work channels.",
      ar: "تشغيل حملات تصيد، دروس دقيقة، وروابط محفوفة بالمخاطر داخل قنوات العمل اليومية.",
    },
  },
  {
    step: "03",
    title: { en: "Reinforcement", ar: "التعزيز" },
    description: {
      en: "Feed awareness through ongoing touchpoints, clear analytics, and internal success stories.",
      ar: "تغذية الوعي بنقاط اتصال مستمرة، تحليلات واضحة، وقصص نجاح داخلية.",
    },
  },
] satisfies { step: string; title: LocalizedText; description: LocalizedText }[];

const finalCtaCopy: Record<Locale, { title: string; description: string; primary: string; secondary: string }> = {
  en: {
    title: "Take your security culture further",
    description: "One platform that balances technical depth with a friendly experience for every employee.",
    primary: "Create an account now",
    secondary: "Sign in",
  },
  ar: {
    title: "انقل ثقافة الأمن إلى مستوى جديد",
    description: "منصة واحدة تحافظ على توازن مثالي بين العمق التقني والتجربة المُبسّطة للموظفين.",
    primary: "إنشاء حساب الآن",
    secondary: "تسجيل الدخول",
  },
};

export default function Home() {
  const { locale, direction } = usePreferences();
  const isRTL = direction === "rtl";
  const header = headerCopy[locale];
  const hero = heroCopy[locale];
  const modules = modulesCopy[locale];
  const platform = platformCopy[locale];
  const academy = academyCopy[locale];
  const cta = finalCtaCopy[locale];

  return (
    <main className="relative isolate overflow-hidden bg-background text-foreground">
      <div className="hero-glow" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <header className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/60 px-4 py-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-accent" />
              {header.badge}
            </div>
            <span className="text-xs uppercase tracking-[0.4em] text-muted">{header.status}</span>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
            {navLinks.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-full border border-transparent px-4 py-2 transition-colors hover:border-border hover:text-foreground"
              >
                {item.label[locale]}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <LanguageToggle size="compact" />
            <ThemeToggle />
          </div>
        </header>

        <section className="glass-panel relative overflow-hidden px-6 py-10 sm:px-10" id="hero">
          <div className="absolute inset-0">
            <div className="command-grid h-full w-full" />
            <div className="scan-sweep" />
          </div>
          <div className="relative z-10 space-y-8">
            <div className={`space-y-4 text-center ${isRTL ? "lg:text-right" : "lg:text-left"}`}>
              <div className={`eyebrow mx-auto ${isRTL ? "lg:ml-auto lg:mr-0" : "lg:mr-auto lg:ml-0"}`}>{hero.eyebrow}</div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">{hero.title}</h1>
              <p className="mx-auto max-w-2xl text-base text-muted lg:mx-0">{hero.description}</p>
              <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/auth/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-accent-soft sm:w-auto"
                >
                  {hero.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/lp"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-muted sm:w-auto"
                >
                  <PlayCircle className="h-4 w-4" />
                  {hero.secondaryCta}
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.id} className="rounded-2xl border border-border/40 bg-surface/70 p-4 text-center">
                  <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="text-xs uppercase tracking-[0.5em] text-muted">{stat.label[locale]}</p>
                  <p className="mt-1 text-xs text-muted">{stat.detail[locale]}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 text-center lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-muted">{trustCopy[locale]}</p>
              <div className="flex flex-wrap items-center justify-center gap-6 opacity-80">
                {[
                  { src: "/google_logo.png", alt: "Google" },
                  { src: "/linkdin_logo.png", alt: "LinkedIn" },
                  { src: "/snap_logo.png", alt: "Snap" },
                  { src: "/insta_logo.png", alt: "Instagram" },
                ].map((logo) => (
                  <Image key={logo.alt} src={logo.src} alt={logo.alt} width={90} height={28} className="h-7 w-auto" />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="mt-16 space-y-10">
          <div className="text-center">
            <div className="eyebrow mx-auto">{modules.eyebrow}</div>
            <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">{modules.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">{modules.description}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.id} className="surface-card flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/50 px-3 py-1 text-xs uppercase tracking-[0.3em]">
                      {feature.meta[locale]}
                    </div>
                    <div className="rounded-2xl bg-accent/10 p-3 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{feature.title[locale]}</h3>
                    <p className="mt-2 text-sm text-muted">{feature.description[locale]}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-muted">
                    {feature.points.map((point, index) => (
                      <li key={`${feature.id}-point-${index}`} className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        {point[locale]}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section id="platform" className="mt-20 grid gap-8 lg:grid-cols-2">
          <div className="surface-card p-8">
            <div className="eyebrow">{platform.eyebrow}</div>
            <h2 className="mt-4 text-2xl font-semibold">{platform.title}</h2>
            <p className="mt-3 text-sm text-muted">{platform.description}</p>
            <div className="mt-8 space-y-6">
              {platformLayers.map((layer) => (
                <div key={layer.id} className="rounded-2xl border border-border/40 bg-surface/60 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{layer.title[locale]}</h3>
                    <span className="text-xs text-muted">{alwaysOnLabel[locale]}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{layer.description[locale]}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                    {layer.items.map((item, index) => (
                      <span key={`${layer.id}-item-${index}`} className="rounded-full border border-border/40 px-3 py-1">
                        {item[locale]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-card flex flex-col gap-6 p-8">
            {platformCards.map((card) => (
              <div
                key={card.id}
                className={`rounded-2xl border border-border/40 bg-surface/70 p-6 ${
                  card.id === "live-risk" ? "bg-gradient-to-br from-accent/10 via-transparent to-transparent" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.5em] text-muted">{card.eyebrow[locale]}</p>
                  {card.id === "live-risk" && <Target className="h-5 w-5 text-accent" />}
                </div>
                <p className={`mt-4 font-semibold ${card.id === "scanner" ? "text-2xl" : card.id === "pulse" ? "text-3xl" : "text-4xl"}`}>
                  {card.value[locale]}
                </p>
                <p className="text-sm text-muted">{card.description[locale]}</p>
                {card.link && (
                  <Link href={card.link.href} className="mt-4 inline-flex items-center gap-2 text-sm text-accent">
                    {card.link.label[locale]}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        <section id="academy" className="mt-20 space-y-8">
          <div className="text-center">
            <div className="eyebrow mx-auto">{academy.eyebrow}</div>
            <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">{academy.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted">{academy.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {academyTimeline.map((item) => (
              <div key={item.step} className="rounded-2xl border border-border/40 bg-surface/70 p-6">
                <span className="text-sm font-semibold text-muted">{item.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{item.title[locale]}</h3>
                <p className="mt-2 text-sm text-muted">{item.description[locale]}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-border/50 bg-gradient-to-br from-accent/15 via-surface/80 to-surface/80 px-6 py-12 text-center sm:px-10">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="inline-flex size-16 items-center justify-center rounded-full border border-border/50 bg-surface/60">
              <Activity className="h-7 w-7 text-accent" />
            </div>
            <h2 className="text-2xl font-semibold sm:text-3xl">{cta.title}</h2>
            <p className="text-sm text-muted">{cta.description}</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 sm:w-auto"
              >
                {cta.primary}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-full border border-border/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted sm:w-auto"
              >
                {cta.secondary}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
