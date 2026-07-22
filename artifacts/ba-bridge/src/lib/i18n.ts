export type Lang = 'en' | 'ar';

const en = {
  // Language switcher
  langEn: 'EN',
  langAr: 'العربية',

  // App
  appName: 'BA Bridge',

  // Nav / AppLayout
  navLogIn: 'Log In',
  navGetStarted: 'Get Started',
  navSignOut: 'Sign Out',

  // Landing — hero
  landingBadge: 'The Command Center for Business Analysts',
  landingH1a: 'Turn messy requirements into',
  landingH1b: 'developer-ready documents.',
  landingSubtext:
    'Stop wrangling Google Docs and endless email threads. BA Bridge uses AI to structure, validate, and generate professional Business Requirements Documents in seconds.',
  landingCta1: 'Start Building Free',
  landingCta2: 'Sign In to Workspace',

  // Landing — features
  featureSectionTitle: 'Built for precision. Designed for speed.',
  featureSectionSub:
    'Everything you need to capture stakeholder needs and translate them into actionable technical specifications.',
  feature1Title: 'Structured Capture',
  feature1Desc:
    'Dedicated sections for functional requirements, business rules, and constraints. Never miss a critical detail again.',
  feature2Title: 'AI Generation',
  feature2Desc:
    'Instantly transform raw business needs into structured technical documents with proposed data models and APIs.',
  feature3Title: 'Single Source of Truth',
  feature3Desc:
    'Keep stakeholders and engineering perfectly aligned. A persistent workspace for all your project specifications.',

  // Landing — footer
  footerCopy: '© {year} BA Bridge. A premium tool for Business Analysts.',

  // Login
  welcomeBack: 'Welcome back',
  signInSubtitle: 'Sign in to your BA workspace',
  emailLabel: 'Email Address',
  passwordLabel: 'Password',
  signInBtn: 'Sign In',
  noAccount: "Don't have an account?",
  getStartedFree: 'Get started free',
  authFailed: 'Authentication failed',
  invalidCreds: 'Invalid email or password.',
  emailInvalid: 'Please enter a valid email address.',
  passwordRequired: 'Password is required.',

  // Register
  createAccountTitle: 'Create your account',
  createAccountSubtitle: 'Start managing requirements effectively',
  fullName: 'Full Name',
  workEmail: 'Work Email',
  confirmPasswordLabel: 'Confirm Password',
  createAccountBtn: 'Create Account',
  alreadyHaveAccount: 'Already have an account?',
  signInLink: 'Sign in',
  nameRequired: 'Full name is required.',
  emailRegistered: 'Email is already registered.',
  passwordMin: 'Password must be at least 6 characters.',
  passwordsNoMatch: 'Passwords do not match.',

  // Dashboard
  dashboardTitle: 'Projects Workspace',
  dashboardSubtitle: 'Manage and generate your Business Requirements Documents.',
  createNewBRD: 'Create New BRD',
  noBrdsTitle: 'No BRDs yet',
  noBrdsDesc:
    'Start structuring your requirements. Create your first BRD to seamlessly generate developer-ready specifications.',
  createFirstBRD: 'Create First BRD',
  statusGenerated: 'Generated',
  statusProcessing: 'Processing',
  statusDraft: 'Draft',
  untitledProject: 'Untitled Project',
  noDescription: 'No description provided.',
  viewOutput: 'View Output',
  editDraft: 'Edit Draft',
  confirmDelete: 'Are you sure you want to delete this BRD?',

  // BRD Form
  backToDashboard: 'Back to Dashboard',
  formTitleNew: 'Create New BRD',
  formTitleEdit: 'Edit Business Requirements',
  formSubtitle: 'Structure your raw business needs below to prepare them for AI generation.',
  saveDraft: 'Save Draft',
  generateTBRD: 'Generate Technical BRD',

  section1Title: '1. Core Information',
  projectNameLabel: 'Project Name',
  projectDescLabel: 'Project Description',

  section2Title: '2. Business Strategy',
  businessGoalsLabel: 'Business Goals',
  stakeholdersLabel: 'Key Stakeholders',

  section3Title: '3. Requirements & Rules',
  funcReqLabel: 'Functional Requirements',
  funcReqHint: 'What the system must do.',
  nonFuncReqLabel: 'Non-Functional Requirements',
  nonFuncReqHint: 'Performance, security, scalability expectations.',
  bizRulesLabel: 'Business Rules',
  bizRulesHint: 'Constraints, logic, and limitations.',

  section4Title: '4. Additional Context',
  notesLabel: 'Notes & Assumptions',

  toastProjectNameRequired: 'Project Name is required',
  toastBrdNotFound: 'BRD not found',
  toastDraftSaved: 'Draft saved successfully.',

  // BRD Result
  editSourceBRD: 'Edit Source BRD',
  downloadPDF: 'Download PDF',
  generatingPDF: 'Generating PDF…',
  badgeGenerated: 'Generated',
  badgeGenerating: 'Generating...',
  badgeFailed: 'Generation Failed',
  techReqsSubtitle: 'Technical Requirements & Architecture Specification',

  metaAuthor: 'Author',
  metaDate: 'Date',
  metaVersion: 'Version',
  metaPoweredBy: 'Powered by',

  synthesisTitle: 'Synthesizing with AI…',
  synthesisNote: 'This may take 15–30 seconds',
  synthStep1: 'Analyzing requirements...',
  synthStep2: 'Identifying gaps and missing specs...',
  synthStep3: 'Designing system architecture...',
  synthStep4: 'Generating API specifications...',
  synthStep5: 'Writing user stories and acceptance criteria...',

  genFailedTitle: 'Generation Failed',
  editAndRetry: 'Edit BRD & Retry',

  sectionGaps: 'Identified Gaps',
  sectionRecs: 'Recommendations',
  sectionOverview: '1. Technical Overview',
  sectionFuncSpec: '2. Functional Specification',
  sectionNonFunc: '3. Non-Functional Specification',
  sectionDBTables: '4. Suggested Database Tables',
  sectionAPIs: '5. Suggested APIs',
  sectionUserStories: '6. User Stories',
  sectionAcceptance: '7. Acceptance Criteria',

  colCategory: 'Category',
  colRequirement: 'Requirement',
  colMetric: 'Target Metric',
  colTable: 'Table',
  colDescription: 'Description',
  colFields: 'Key Fields',
  epicLabel: 'Epic',

  docFooterNote: 'Generated by BA Bridge powered by OpenRouter AI',
  exportFailed: 'Export failed',
  exportFailedDesc: 'Could not generate PDF.',
  versionLabel: '1.0 (AI-Generated)',
  poweredByValue: 'BA Bridge + OpenRouter AI',
};

const ar: typeof en = {
  langEn: 'EN',
  langAr: 'العربية',

  appName: 'BA Bridge',

  navLogIn: 'تسجيل الدخول',
  navGetStarted: 'ابدأ الآن',
  navSignOut: 'تسجيل الخروج',

  landingBadge: 'المركز القيادي لمحللي الأعمال',
  landingH1a: 'حوّل المتطلبات الفوضوية إلى',
  landingH1b: 'وثائق جاهزة للتطوير.',
  landingSubtext:
    'توقف عن الجدل حول مستندات Google والرسائل البريدية اللانهائية. يستخدم BA Bridge الذكاء الاصطناعي لهيكلة وثائق متطلبات الأعمال والتحقق منها وإنشائها باحترافية في ثوانٍ.',
  landingCta1: 'ابدأ البناء مجاناً',
  landingCta2: 'الدخول إلى مساحة العمل',

  featureSectionTitle: 'مبني للدقة. مصمم للسرعة.',
  featureSectionSub:
    'كل ما تحتاجه لالتقاط احتياجات أصحاب المصلحة وترجمتها إلى مواصفات تقنية قابلة للتنفيذ.',
  feature1Title: 'توثيق منظم',
  feature1Desc:
    'أقسام مخصصة للمتطلبات الوظيفية وقواعد العمل والقيود. لن تفوتك أي تفصيلة حرجة بعد الآن.',
  feature2Title: 'توليد بالذكاء الاصطناعي',
  feature2Desc:
    'حوّل احتياجات الأعمال الخام فوراً إلى وثائق تقنية منظمة مع نماذج البيانات المقترحة وواجهات برمجة التطبيقات.',
  feature3Title: 'مصدر واحد للحقيقة',
  feature3Desc:
    'حافظ على توافق تام بين أصحاب المصلحة والفريق الهندسي. مساحة عمل دائمة لجميع مواصفات مشروعك.',

  footerCopy: '© {year} BA Bridge. أداة متميزة لمحللي الأعمال.',

  welcomeBack: 'مرحباً بعودتك',
  signInSubtitle: 'سجّل الدخول إلى مساحة عمل BA',
  emailLabel: 'البريد الإلكتروني',
  passwordLabel: 'كلمة المرور',
  signInBtn: 'تسجيل الدخول',
  noAccount: 'ليس لديك حساب؟',
  getStartedFree: 'ابدأ مجاناً',
  authFailed: 'فشل المصادقة',
  invalidCreds: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  emailInvalid: 'يرجى إدخال بريد إلكتروني صالح.',
  passwordRequired: 'كلمة المرور مطلوبة.',

  createAccountTitle: 'إنشاء حسابك',
  createAccountSubtitle: 'ابدأ إدارة المتطلبات بفعالية',
  fullName: 'الاسم الكامل',
  workEmail: 'البريد الإلكتروني للعمل',
  confirmPasswordLabel: 'تأكيد كلمة المرور',
  createAccountBtn: 'إنشاء حساب',
  alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
  signInLink: 'تسجيل الدخول',
  nameRequired: 'الاسم الكامل مطلوب.',
  emailRegistered: 'البريد الإلكتروني مسجّل مسبقاً.',
  passwordMin: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
  passwordsNoMatch: 'كلمتا المرور غير متطابقتين.',

  dashboardTitle: 'مساحة المشاريع',
  dashboardSubtitle: 'إدارة وإنشاء وثائق متطلبات أعمالك.',
  createNewBRD: 'إنشاء وثيقة متطلبات جديدة',
  noBrdsTitle: 'لا توجد وثائق متطلبات بعد',
  noBrdsDesc:
    'ابدأ بهيكلة متطلباتك. أنشئ أول وثيقة متطلبات لك لإنشاء مواصفات جاهزة للتطوير بسلاسة.',
  createFirstBRD: 'إنشاء أول وثيقة متطلبات',
  statusGenerated: 'تم الإنشاء',
  statusProcessing: 'جارٍ المعالجة',
  statusDraft: 'مسودة',
  untitledProject: 'مشروع بدون عنوان',
  noDescription: 'لا يوجد وصف.',
  viewOutput: 'عرض النتيجة',
  editDraft: 'تعديل المسودة',
  confirmDelete: 'هل أنت متأكد من حذف وثيقة المتطلبات هذه؟',

  backToDashboard: 'العودة إلى لوحة التحكم',
  formTitleNew: 'إنشاء وثيقة متطلبات جديدة',
  formTitleEdit: 'تعديل متطلبات الأعمال',
  formSubtitle: 'قم بهيكلة احتياجات أعمالك الخام أدناه للتحضير لإنشاء الذكاء الاصطناعي.',
  saveDraft: 'حفظ كمسودة',
  generateTBRD: 'إنشاء وثيقة المتطلبات التقنية',

  section1Title: '١. المعلومات الأساسية',
  projectNameLabel: 'اسم المشروع',
  projectDescLabel: 'وصف المشروع',

  section2Title: '٢. استراتيجية الأعمال',
  businessGoalsLabel: 'أهداف الأعمال',
  stakeholdersLabel: 'أصحاب المصلحة الرئيسيون',

  section3Title: '٣. المتطلبات والقواعد',
  funcReqLabel: 'المتطلبات الوظيفية',
  funcReqHint: 'ما يجب أن يقوم به النظام.',
  nonFuncReqLabel: 'المتطلبات غير الوظيفية',
  nonFuncReqHint: 'توقعات الأداء والأمان وقابلية التوسع.',
  bizRulesLabel: 'قواعد الأعمال',
  bizRulesHint: 'القيود والمنطق والمحدودية.',

  section4Title: '٤. السياق الإضافي',
  notesLabel: 'ملاحظات وافتراضات',

  toastProjectNameRequired: 'اسم المشروع مطلوب',
  toastBrdNotFound: 'وثيقة المتطلبات غير موجودة',
  toastDraftSaved: 'تم حفظ المسودة بنجاح.',

  editSourceBRD: 'تعديل وثيقة المتطلبات',
  downloadPDF: 'تحميل PDF',
  generatingPDF: 'جارٍ إنشاء PDF...',
  badgeGenerated: 'تم الإنشاء',
  badgeGenerating: 'جارٍ الإنشاء...',
  badgeFailed: 'فشل الإنشاء',
  techReqsSubtitle: 'متطلبات تقنية ومواصفات هندسية',

  metaAuthor: 'المؤلف',
  metaDate: 'التاريخ',
  metaVersion: 'الإصدار',
  metaPoweredBy: 'مشغّل بواسطة',

  synthesisTitle: 'جارٍ التوليف بالذكاء الاصطناعي…',
  synthesisNote: 'قد يستغرق هذا ١٥–٣٠ ثانية',
  synthStep1: 'جارٍ تحليل المتطلبات...',
  synthStep2: 'تحديد الفجوات والمواصفات الناقصة...',
  synthStep3: 'تصميم هندسة النظام...',
  synthStep4: 'إنشاء مواصفات واجهة برمجة التطبيقات...',
  synthStep5: 'كتابة قصص المستخدمين ومعايير القبول...',

  genFailedTitle: 'فشل الإنشاء',
  editAndRetry: 'تعديل وثيقة المتطلبات وإعادة المحاولة',

  sectionGaps: 'الفجوات المحددة',
  sectionRecs: 'التوصيات',
  sectionOverview: '١. نظرة تقنية عامة',
  sectionFuncSpec: '٢. المواصفات الوظيفية',
  sectionNonFunc: '٣. المواصفات غير الوظيفية',
  sectionDBTables: '٤. جداول قاعدة البيانات المقترحة',
  sectionAPIs: '٥. واجهات البرمجة المقترحة',
  sectionUserStories: '٦. قصص المستخدمين',
  sectionAcceptance: '٧. معايير القبول',

  colCategory: 'الفئة',
  colRequirement: 'المتطلب',
  colMetric: 'المقياس المستهدف',
  colTable: 'الجدول',
  colDescription: 'الوصف',
  colFields: 'الحقول الرئيسية',
  epicLabel: 'الملحمة',

  docFooterNote: 'تم الإنشاء بواسطة BA Bridge مع OpenRouter AI',
  exportFailed: 'فشل التصدير',
  exportFailedDesc: 'تعذّر إنشاء ملف PDF.',
  versionLabel: '١.٠ (منشأ بالذكاء الاصطناعي)',
  poweredByValue: 'BA Bridge + OpenRouter AI',
};

export const translations: Record<Lang, typeof en> = { en, ar };
export type TranslationKey = keyof typeof en;
