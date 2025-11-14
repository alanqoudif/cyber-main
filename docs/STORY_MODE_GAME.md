# 🎮 Story Mode Game - تجربة القصة التفاعلية

## نظرة عامة

Story Mode Game هي تجربة سينمائية تفاعلية لتعليم الأمن السيبراني بدون أسئلة أو اختبارات. اللاعب يعيش القصة كأنه بطل الفيلم، يشاهد المشاهد، ويتابع الحوار، ويتعلم من خلال التجربة.

## المميزات الرئيسية

### 🎬 تجربة سينمائية كاملة
- **مشاهد متحركة**: كل مشهد له خلفية وإضاءة وأجواء خاصة
- **شخصيات حية**: شخصيات تتكلم وتتفاعل مع بعضها
- **حوار متدرج**: الحوار يظهر سطر بعد سطر مع تأثيرات animation
- **انتقالات سلسة**: تحولات سينمائية بين المشاهد

### 🎵 تأثيرات صوتية وموسيقية
- **موسيقى توتر**: موسيقى خلفية تتغير حسب السيناريو
- **تردد مختلف لكل قصة**: كل سيناريو له موسيقاه الخاصة
- **Web Audio API**: نظام صوتي متقدم باستخدام oscillators

### ✨ تأثيرات بصرية
- **Floating particles**: جزيئات طافية في الخلفية
- **Glowing effects**: تأثيرات توهج على العناصر المهمة
- **Gradient backgrounds**: خلفيات متدرجة متحركة
- **Backdrop blur**: تأثير طمس الخلفية

### 🎭 نظام الحوار التلقائي
- **Auto-play mode**: تشغيل تلقائي للحوار
- **تأخير زمني**: كل حوار يظهر بعد 3 ثواني من السابق
- **مؤشر التقدم**: يعرض أي حوار يتم تشغيله الآن
- **Play/Pause control**: التحكم في التشغيل التلقائي

## السيناريوهات الثلاثة

### 1️⃣ الرابط اللي غيّر حياة محمد
**الموضوع**: Phishing عبر رسائل حكومية مزيفة

**الشخصيات**:
- محمد: طالب جامعي هادئ لكن مستعجل
- سالم: الصديق الذكي الحذر
- المهاجم: صوت في الظلام

**المشاهد**:
1. **غرفة محمد**: رسالة غريبة تصل في الليل
2. **ظهور المهاجم**: صوت يهمس "اضغط بس"
3. **تحليل الرابط**: سالم يكشف الخدعة
4. **النهاية**: الدرس المستفاد

**الموسيقى**: Deep tension (62 Hz)

### 2️⃣ انستغرام المزيف
**الموضوع**: Fake login pages

**الشخصيات**:
- ريم: مؤثرة صغيرة تحب الألوان
- شهد: الصديقة الواقعية
- المحتال: مرسل WhatsApp مجهول

**المشاهد**:
1. **الإعلان الحلم**: عرض من شركة كبيرة
2. **الصدمة**: اكتشاف instgram-help.com
3. **الحساب يروح**: فقدان الحساب
4. **النهاية الهادئة**: الدرس المستفاد

**الموسيقى**: Mid tension (75 Hz) مع ألوان pastel

### 3️⃣ الوظيفة الوهمية
**الموضوع**: Job scams

**الشخصيات**:
- فهد: خريج جديد يدور وظيفة
- ليان: أخته التي تقرأ التفاصيل
- المحتال: محتال الإيميل

**المشاهد**:
1. **الحلم**: إيميل من شركة مع ختم ذهبي
2. **الفخ**: طلب بيانات حساسة
3. **الكشف**: تحذير من المتصفح
4. **النهاية**: التحقق قبل التصديق

**الموسيقى**: Calm to tense (68 Hz)

## الـ Animations المستخدمة

### 1. **Float Animation** (جزيئات طافية)
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); opacity: 0.3; }
  50% { transform: translateY(-20px); opacity: 0.6; }
}
```

### 2. **Fade In** (ظهور تدريجي)
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### 3. **Slide Up** (صعود من الأسفل)
```css
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 4. **Glow** (توهج)
```css
@keyframes glow {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.4); }
}
```

### 5. **Pulse Slow** (نبض بطيء)
```css
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

### 6. **Bounce Gentle** (ارتداد خفيف)
```css
@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

## كيفية اللعب

### 1. **الوصول للعبة**
- اذهب إلى: `/dashboard/cyber-game`
- اللعبة متاحة لجميع المستخدمين المسجلين

### 2. **اختيار السيناريو**
- اختر واحد من السيناريوهات الثلاثة
- كل سيناريو له موضوع مختلف

### 3. **تشغيل الموسيقى**
- اضغط على زر "تشغيل الموسيقى"
- الموسيقى تضيف جو توتر للقصة

### 4. **مشاهدة المشاهد**
- اضغط "ابدأ القصة" لبدء المشهد الأول
- استخدم "التشغيل التلقائي للحوار" لمشاهدة الحوار يتدرج
- أو اضغط "المشهد التالي" للانتقال يدوياً

### 5. **التنقل**
- **المشهد التالي**: للانتقال للمشهد اللاحق
- **المشهد السابق**: للرجوع للمشهد السابق
- **إعادة**: للرجوع لبداية السيناريو
- يمكنك النقر على أي مشهد من القائمة الجانبية

### 6. **الدرس المستفاد**
- في نهاية كل سيناريو، ستجد الدرس والنصائح
- لا توجد أسئلة أو اختبارات - فقط تجربة وتعلم

## التقنيات المستخدمة

### Frontend
- **React**: مع hooks (useState, useEffect, useRef, useMemo)
- **TypeScript**: لتعريف الأنواع
- **Tailwind CSS**: للتصميم
- **Custom Animations**: CSS animations متقدمة

### Audio
- **Web Audio API**: لإنشاء موسيقى ديناميكية
- **Oscillator Nodes**: لتوليد الترددات
- **Gain Nodes**: للتحكم بالصوت

### State Management
- **Local State**: useState للمشاهد والحوار
- **Auto-play System**: useEffect لتشغيل الحوار تلقائياً
- **Music Control**: useRef للتحكم بـ AudioContext

### Internationalization
- **Dual Language**: دعم العربية والإنجليزية
- **PreferencesContext**: للتبديل بين اللغات
- **LocaleValue type**: لتخزين النصوص بلغتين

## البنية التقنية

```typescript
type StoryScene = {
  id: string
  order: number
  title: LocaleValue
  subtitle: LocaleValue
  background: string          // CSS gradient
  overlay: string             // CSS gradient overlay
  ambiance: LocaleValue       // وصف الموسيقى
  description: LocaleValue    // وصف المشهد
  dialogues: StoryDialogue[]  // الحوارات
  cues: LocaleValue[]         // التلميحات البصرية
  caution: LocaleValue        // التحذير الأمني
}

type StoryCharacter = {
  id: string
  name: LocaleValue
  role: LocaleValue
  trait: LocaleValue
  theme: string               // CSS gradient للشخصية
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
```

## الأفكار المستقبلية

### 🎯 تحسينات محتملة

1. **Sound Effects**
   - إضافة مؤثرات صوتية للأحداث
   - أصوات characters مختلفة
   - Background ambiance sounds

2. **More Interactions**
   - اختيارات تؤثر على مسار القصة
   - Mini-games داخل المشاهد
   - Clickable elements في المشهد

3. **Progress Tracking**
   - حفظ تقدم اللاعب
   - شارات وإنجازات
   - نظام نقاط

4. **More Scenarios**
   - سيناريوهات إضافية (ransomware, social engineering, etc.)
   - مستويات صعوبة مختلفة
   - قصص قصيرة يومية

5. **Character Avatars**
   - رسومات للشخصيات
   - Animated sprites
   - Expressions تتغير حسب الحوار

6. **Better Visuals**
   - 3D backgrounds
   - Particle systems أكثر تقدماً
   - Cinematic camera movements

## النصائح للمطورين

### إضافة سيناريو جديد

1. أضف السيناريو في `storyScenarios` array
2. تأكد من وجود 4 مشاهد على الأقل
3. أضف تردد جديد في `frequencies` object (في دالة startMusic)
4. اختبر جميع المشاهد
5. تأكد من أن الـ LocaleValue موجودة بالعربي والإنجليزي

### تعديل Animations

1. أضف keyframe جديد في `globals.css`
2. أضف utility class (مثل `.animate-new`)
3. استخدمه في component

### تحسين الأداء

- استخدم `useMemo` للبيانات الثقيلة
- استخدم `useCallback` للـ handlers
- تجنب re-renders غير ضرورية
- cleanup في useEffect

## الخلاصة

Story Mode Game هي تجربة فريدة تجمع بين:
- ✅ التعليم بدون أسئلة
- ✅ القصة السينمائية
- ✅ التفاعل البسيط
- ✅ التأثيرات البصرية والصوتية
- ✅ الدعم الكامل للغة العربية

الهدف: **تعليم الأمن السيبراني من خلال تجربة ممتعة وسينمائية بدون مصطلحات تقنية معقدة.**

