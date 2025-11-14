'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, Shield, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/context/preferences-context'

interface EducationalWarningProps {
  submissionData: {
    username?: string
    password?: string
    email?: string
    phone?: string
  }
  link: {
    id: string
    name: string
    template_type: string
  }
}

export function EducationalWarning({ submissionData, link }: EducationalWarningProps) {
  const router = useRouter()
  const { locale } = usePreferences()

  const copy = {
    en: {
      title: '⚠️ Training warning: simulated phishing',
      intro: 'This phishing page is part of a security awareness drill. You entered credentials into a simulation form.',
      alertTitle: 'What happened here?',
      alertBody:
        'In a real attack, an adversary could have captured your credentials. Phishing is a deceptive attempt to obtain sensitive information such as usernames and passwords.',
      protectTitle: 'How do you stay safe from phishing?',
      tips: [
        'Check the URL before submitting any data. Look for typos or suspicious domains.',
        'Be wary of messages asking for immediate action or threatening to disable your account.',
        'Validate the sender address. Phishing messages often use questionable email names.',
        'Enable multi-factor authentication whenever possible to protect your accounts.',
        'When unsure, contact the company directly through a trusted channel to verify the request.',
      ],
      dataTitle: 'Information you entered (training only):',
      labels: {
        username: 'Username',
        email: 'Email',
        password: 'Password',
        phone: 'Phone number',
      },
      note: 'Note: This information is stored for educational purposes only. In a real scenario, an attacker could use it to access your account.',
      backPhishing: 'Back to phishing simulations',
      backDashboard: 'Return to dashboard',
      footer: 'This educational page is part of the CyberMirror awareness platform.',
    },
    ar: {
      title: '⚠️ تحذير تعليمي: عملية Phishing محاكاة',
      intro: 'هذه صفحة phishing تعليمية تم إنشاؤها للتدريب على الوعي الأمني. لقد أدخلت بيانات اعتماد في نموذج محاكاة.',
      alertTitle: 'ما حدث هنا؟',
      alertBody:
        'في سيناريو حقيقي، كان بإمكان المهاجم سرقة بيانات اعتمادك. هذه العملية تسمى "Phishing" وهي محاولة خادعة للحصول على معلومات حساسة مثل أسماء المستخدمين وكلمات المرور.',
      protectTitle: 'كيف تحمي نفسك من Phishing؟',
      tips: [
        'تحقق من عنوان URL قبل إدخال أي بيانات. ابحث عن أخطاء إملائية أو نطاقات مشبوهة.',
        'انتبه للرسائل التي تطلب منك اتخاذ إجراء فوري أو تهدد بإغلاق حسابك.',
        'تحقق من عنوان بريد المرسل. غالبًا ما تستخدم رسائل Phishing عناوين بريد إلكتروني مشبوهة.',
        'استخدم المصادقة الثنائية (2FA) كلما أمكن ذلك لحماية حساباتك.',
        'عندما تكون غير متأكدًا، اتصل بالشركة مباشرة عبر قناة موثوقة للتحقق من الطلب.',
      ],
      dataTitle: 'البيانات التي أدخلتها (لأغراض تعليمية فقط):',
      labels: {
        username: 'اسم المستخدم',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        phone: 'رقم الهاتف',
      },
      note: 'ملاحظة: هذه البيانات تم تسجيلها لأغراض تعليمية فقط. في سيناريو حقيقي، كان بإمكان المهاجم استخدام هذه المعلومات للوصول إلى حسابك.',
      backPhishing: 'العودة إلى محاكاة Phishing',
      backDashboard: 'العودة إلى الداشبورد',
      footer: 'هذه صفحة تعليمية جزء من منصة CyberMirror للتدريب على الوعي الأمني',
    },
  }[locale]

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-yellow-100 text-yellow-600 mx-auto mb-6">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{copy.title}</h1>
            <p className="text-lg text-gray-700 leading-relaxed">{copy.intro}</p>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">{copy.alertTitle}</h3>
                <p className="text-sm text-red-800 leading-relaxed">{copy.alertBody}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">{copy.protectTitle}</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  {copy.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">{copy.dataTitle}</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {submissionData.username && (
                <div>
                  <span className="font-medium">{copy.labels.username}:</span> {submissionData.username}
                </div>
              )}
              {submissionData.email && (
                <div>
                  <span className="font-medium">{copy.labels.email}:</span> {submissionData.email}
                </div>
              )}
              {submissionData.password && (
                <div>
                  <span className="font-medium">{copy.labels.password}:</span> {'*'.repeat(submissionData.password.length)}
                </div>
              )}
              {submissionData.phone && (
                <div>
                  <span className="font-medium">{copy.labels.phone}:</span> {submissionData.phone}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4">{copy.note}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={() => router.push('/dashboard/phishing')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {copy.backPhishing}
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              {copy.backDashboard}
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">{copy.footer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
