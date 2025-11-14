# نظام الحقن الخفي للثغرات

## نظرة عامة

نظام متقدم لحقن ثغرات أمنية عشوائية تبدو طبيعية تماماً للمستخدمين لاختبار وعيهم الأمني. الثغرات تظهر كإعلانات حقيقية أو رسائل عادية بدون أن يشعر المستخدم أنها محاكاة.

## المميزات الرئيسية

### 1. إعلانات تبدو حقيقية
- **إعلانات Banner**: تظهر في أسفل الصفحة
- **إعلانات Popup**: تظهر كنوافذ منبثقة
- **إعلانات Sidebar**: تظهر في الجانب
- جميع الإعلانات تبدو طبيعية تماماً

### 2. قوالب متنوعة
- إعلانات خصم منتجات
- إعلانات توصيل مجاني
- إعلانات فوز بجائزة
- إعلانات ترقية حساب
- إعلانات تنبيه أمني
- إعلانات عرض محدود
- إعلانات استطلاع رأي
- إعلانات تحميل تطبيق

### 3. نظام الحقن التلقائي
- يحقن الثغرات تلقائياً عند زيارة المستخدم للصفحة
- يحقن الإعلانات بشكل متكرر (كل يومين)
- يحقن الرسائل بشكل أقل (كل 3 أيام)
- يفضل الإعلانات لأنها أكثر خفية

### 4. سكور "بدون ما تحس"
- يحسب كم مرة وقع المستخدم في الفخاخ
- يعرض نسبة النقر والفتح
- يعرض النشاط الأخير (7 أيام)
- يعطي تقييم عام (ممتاز/جيد/يحتاج تحسين/ضعيف)

## كيفية العمل

### 1. الحقن التلقائي
عندما يزور المستخدم Dashboard:
- ينتظر النظام 5 ثوانٍ
- يتحقق من وجود ثغرات معلقة
- إذا لم توجد، يحقن ثغرة جديدة (30% احتمال)
- ينتظر 10 ثوانٍ إضافية قبل الحقن

### 2. عرض الإعلانات
- **Banner**: يظهر في أسفل الصفحة
- **Popup**: يظهر كنافذة منبثقة في المنتصف
- **Sidebar**: يظهر في الجانب الأيمن

### 3. تتبع التفاعلات
- **CLICKED**: المستخدم نقر على الإعلان (0 نقطة)
- **OPENED**: المستخدم فتح الإعلان (40 نقطة)
- **IGNORED**: المستخدم تجاهل الإعلان (70 نقطة)
- **REPORTED**: المستخدم أبلغ عن الإعلان (100 نقطة)

### 4. حساب السكور
```
سكور "بدون ما تحس" = (عدد النقرات + عدد الفتحات) / إجمالي الثغرات × 100
```

## الاستخدام

### عرض السكور في Dashboard
السكور يظهر تلقائياً في Dashboard في قسم "سكور بدون ما تحس"

### API Endpoints

#### الحصول على سكور "بدون ما تحس"
```typescript
GET /api/vulnerability/stealth-score
```

Response:
```json
{
  "totalInjections": 10,
  "clickedCount": 2,
  "openedCount": 1,
  "ignoredCount": 3,
  "reportedCount": 4,
  "stealthScore": 30,
  "stealthPercentage": 30,
  "level": "needs_improvement",
  "message": "يحتاج تحسين. حاول أن تكون أكثر حذراً",
  "recentActivity": {
    "total": 3,
    "clicked": 1,
    "opened": 0
  }
}
```

#### حقن ثغرة يدوياً
```typescript
POST /api/vulnerability/inject
{
  "templateId": "ad-product-discount" // اختياري
}
```

#### الحصول على الثغرات المعلقة
```typescript
GET /api/vulnerability/inject?status=PENDING&type=AD
```

## التكوين

### تحديث قاعدة البيانات
قم بتشغيل SQL migration:
```sql
-- تحديث جدول vulnerability_injections لدعم أنواع الإعلانات
ALTER TABLE vulnerability_injections 
DROP CONSTRAINT IF EXISTS vulnerability_injections_injection_type_check;

ALTER TABLE vulnerability_injections
ADD CONSTRAINT vulnerability_injections_injection_type_check 
CHECK (injection_type IN ('EMAIL', 'LINK', 'SMS', 'POPUP', 'AD_BANNER', 'AD_POPUP', 'AD_SIDEBAR'));
```

### إعداد Cron Job (اختياري)
لحقن الثغرات تلقائياً للمستخدمين النشطين:
```bash
# كل 6 ساعات
curl -X POST https://your-domain.com/api/vulnerability/auto-inject \
  -H "Authorization: Bearer your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"maxInjections": 10, "probability": 0.3}'
```

## الأمان

- جميع الثغرات محلية فقط - لا توجد روابط خارجية حقيقية
- لا يتم جمع معلومات حساسة حقيقية
- المستخدمون يحصلون على تعليقات فورية بعد التفاعل
- جميع التفاعلات مسجلة للتعلم

## التخصيص

### إضافة قوالب جديدة
في `src/lib/vulnerability-templates.ts`:
```typescript
{
  id: 'ad-custom',
  name: 'إعلان مخصص',
  type: 'AD_BANNER',
  severity: 'MEDIUM',
  subject: 'عنوان الإعلان',
  content: 'محتوى الإعلان',
  url: '/phishing/custom',
  description: 'وصف الإعلان',
  redFlags: ['علامة تحذيرية 1', 'علامة تحذيرية 2']
}
```

### تغيير احتمالية الحقن
في `src/components/user/AutoInjectTrigger.tsx`:
```typescript
if (Math.random() < 0.3) { // غيّر 0.3 إلى القيمة المطلوبة
```

## الملاحظات

- النظام مصمم ليكون خفياً تماماً - المستخدم لا يشعر أنه محاكاة
- الإعلانات تبدو حقيقية جداً لاختبار الوعي الأمني الحقيقي
- السكور يساعد المستخدمين على فهم مستوى وعيهم الأمني
- النظام آمن تماماً - لا يوجد خطر حقيقي على المستخدمين

