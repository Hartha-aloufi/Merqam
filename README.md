
# مِرْقَم - تفريغات علمية نافعة


## نظرة عامة

مِرْقَم هو منصة تقدم تفريغات نصية لبعض السلاسل العلمية، مما يجعل التعلم أكثر سهولة لمن يفضلون القراءة على مشاهدة المرئيات. تتميز المنصة بواجهة حديثة ومتجاوبة مع ميزة متابعة القراءة وتكامل التفريغات مع اصلها المرئي.

** اغلب هذه المشروع هو من كتابة الذكاء الاصطناعي **

## الموقع (تجريبي ومؤقت)
[http://eduo-temp.vercel.app/](http://eduo-temp.vercel.app/)


## 🚀 المميزات

- 📱 تصميم متجاوب يدعم جميع الأجهزة
- 🌓 دعم متعدد للمظهر (فاتح، داكن، وبني فاتح)
- 📖 عارض دروس تفاعلي مع تتبع القراءة
- 🎥 تزامن تشغيل الفيديو مع المحتوى النصي
- 🔍 عرض متقدم لمحتوى MDX
- ⌨️ دعم التنقل باستخدام لوحة المفاتيح
- 🎯 اختبارات

## 🛠️ التقنيات المستخدمة

- **إطار العمل**: Next.js 15 مع App Router
- **لغة البرمجة**: TypeScript
- **التنسيق**:
  - Tailwind CSS
- **إدارة الحالة**:
  - React Query (TanStack Query)
  - Zustand للحالة المحلية
- **المصادقة**: Supabase Auth
- **قاعدة البيانات**: Supabase
- **المحتوى**: MDX
- **مكونات واجهة المستخدم**:
  - Radix UI primitives
  - Shadcn/UI components
- **الاختبارات**: React Testing Library

## 📁 هيكل المشروع

```
src/
├── app/                    # صفحات Next.js
├── components/
│   ├── admin/             # مكونات لوحة الإدارة
│   ├── auth/              # مكونات المصادقة
│   ├── lessons/           # مكونات عرض الدروس
│   ├── providers/         # موفرو السياق
│   ├── reading/           # مكونات متابعة القراءة
│   ├── settings/          # مكونات إعدادات المستخدم
│   └── ui/                # مكونات واجهة المستخدم القابلة لإعادة الاستخدام
├── contexts/              # سياقات React
├── hooks/                 # Hooks مخصصة
├── lib/                   # دوال مساعدة
├── providers/             # موفرو المستوى الأعلى
├── services/              # طبقات خدمات API
├── styles/                # الأنماط العامة
└── types/                 # تعريفات TypeScript
```

## 🚀 البدء

### المتطلبات المسبقة

- Node.js 18+
- npm أو yarn
- حساب Supabase (ليس ضروريا)

### إعداد البيئة

قم بإنشاء ملف `.env.local` مع المتغيرات التالية:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### التثبيت

1. استنساخ المستودع:

```bash
git clone https://github.com/Hartha-aloufi/eduo-temp.git
cd eduo-temp
```

2. تثبيت المكتبات:

```bash
npm install
# أو
yarn install
```

3. تشغيل بيئة التطوير:

```bash
npm run dev
# أو
yarn dev
```

4. افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 📦 استخدام المكونات

### موفر المظهر

يستخدم التطبيق موفر مظهر مخصص يدعم الأوضاع الفاتح والداكن والبني:

```tsx
import { ThemeProvider } from "@/components/providers/theme-provider";

<ThemeProvider defaultTheme="light" attribute="data-theme">
  {children}
</ThemeProvider>;
```

### تتبع تقدم القراءة

تتبع تقدم القراءة باستخدام hook مخصص:

```tsx
const progress = useReadingProgress();
```

### تكامل الفيديو

مزامنة تشغيل الفيديو مع المحتوى النصي باستخدام مكون `VideoTimeAt`:

```tsx
<VideoTimeAt startTime={60} endTime={120}>
  المحتوى المراد إبرازه خلال هذا النطاق الزمني
</VideoTimeAt>
```

## 🔒 المصادقة

تستخدم المنصة مصادقة Supabase مع Google OAuth. تتم إدارة حالة المصادقة من خلال React Query:

```tsx
const { data: session } = useSession();
const { mutate: login } = useGoogleLogin();
```

## 📚 إدارة المحتوى

تتم كتابة الدروس بتنسيق MDX وتخزينها في مجلد `src/data`. كل موضوع له مجلد خاص يحتوي على:

- `meta.json`: البيانات الوصفية للموضوع ومعلومات الدروس
- ملفات `.mdx` فردية لكل درس
- مجلد `exercises` يحتوي على تمارين الدروس

## 🙏 شكر وتقدير

- [Shadcn/UI](https://ui.shadcn.com/) لمكتبة المكونات الجميلة
- [Tailwind CSS](https://tailwindcss.com/) لإطار عمل CSS
- [Supabase](https://supabase.com/) للبنية التحتية للخادم الخلفي
- [Next.js](https://nextjs.org/) لإطار عمل React
