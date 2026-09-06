export const DICTATION_MODES = ["TYPING", "WORD_BANK"] as const;

export type DictationMode = (typeof DICTATION_MODES)[number];
export type DictationSessionStatus = "ACTIVE" | "COMPLETED";

export type DictationUnitSummary = {
  id: string;
  title: string;
  description: string;
  topic: string;
  questionCount: number;
  estimatedMinutes: number;
};

export type DictationCollectionSummary = {
  id: string;
  title: string;
  description: string;
  hskLevel: number;
  coverImage: string;
  units: DictationUnitSummary[];
};

export type DictationCatalogResponse = {
  collections: DictationCollectionSummary[];
};

export type DictationCurrentQuestion = {
  id: string;
  promptVi: string;
  audioText: string;
  hanzi: string;
  pinyin: string;
  wordBank: string[];
  targetSeconds: number;
  hint: string;
};

export type DictationStudyPlanContext = {
  hskLevel: number;
  lessonId: string;
  lessonTitle: string;
};

export type DictationSessionResponse = {
  id: string;
  collection: Pick<DictationCollectionSummary, "id" | "title" | "hskLevel">;
  unit: Pick<DictationUnitSummary, "id" | "title">;
  mode: DictationMode;
  status: DictationSessionStatus;
  currentQuestion: DictationCurrentQuestion | null;
  currentIndex: number;
  queueLength: number;
  questionCount: number;
  completedQuestionCount: number;
  exp: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  mistakeCount: number;
  studyPlan: DictationStudyPlanContext | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  completedAt: string | Date | null;
};

export type DictationSessionListResponse = {
  sessions: DictationSessionResponse[];
};

export type CreateDictationSessionRequest = {
  collectionId: string;
  unitId: string;
  mode: DictationMode;
};

export type SubmitDictationAnswerRequest = {
  questionId: string;
  answer: string;
  elapsedMs?: number;
};

export type DictationAnswerResponse = {
  correct: boolean;
  expDelta: number;
  answer: {
    hanzi: string;
    pinyin: string;
    meaningVi: string;
  };
  session: DictationSessionResponse;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};

export const SUBSCRIPTION_PLANS = ["MONTHLY", "SIX_MONTH", "LIFETIME"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];
export type SubscriptionStatus =
  | "NONE"
  | "INCOMPLETE"
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID";

export type SubscriptionEntitlements = {
  fullCatalog: boolean;
  aiStudyPlan: boolean;
  customTopics: boolean;
  monthlyPlanReview: boolean;
};

export type BillingMode = "sepay" | "stripe" | "mock" | "unconfigured";

export type SubscriptionSummary = {
  plan: SubscriptionPlan | null;
  status: SubscriptionStatus;
  currentPeriodEnd: string | Date | null;
  cancelAtPeriodEnd: boolean;
  entitlements: SubscriptionEntitlements;
  billingConfigured: boolean;
  billingMode: BillingMode;
};

export type CheckoutResponse = {
  url: string;
  method?: "GET" | "POST";
  fields?: Record<string, string>;
  orderId?: string;
};

export type PaymentOrderStatus =
  | "PENDING"
  | "PAID"
  | "TRIALING"
  | "ACTIVATED"
  | "CANCELED"
  | "FAILED";

export type PaymentOrderResponse = {
  id: string;
  userId: string;
  userEmail: string;
  plan: SubscriptionPlan;
  status: PaymentOrderStatus;
  invoiceNumber: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  activatedAt: string | Date | null;
  activatedBy: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type PaymentOrderListResponse = {
  orders: PaymentOrderResponse[];
};

export type StudyPlanIntake = {
  hskLevel: number;
  primaryGoal: string;
  minutesPerDay: number;
  daysPerWeek: number;
  durationWeeks: number;
  lessonsPerWeek: number;
  targetDate: string;
  interests: string[];
  weaknesses: string[];
  useCase: string;
};

export type StudyPlanLessonStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETED";

export type StudyPlanWeekStatus = "LOCKED" | "ACTIVE" | "COMPLETED";

export type StudyPlanLesson = {
  id: string;
  position: number;
  title: string;
  description: string;
  topic: string;
  activities: string[];
  collectionId: string;
  unitId: string;
  mode: DictationMode;
  estimatedMinutes: number;
  status: StudyPlanLessonStatus;
  completedAt: string | Date | null;
  sessionId: string | null;
};

export type StudyPlanWeek = {
  id: string;
  week: number;
  title: string;
  objective: string;
  milestone: string;
  status: StudyPlanWeekStatus;
  lessons: StudyPlanLesson[];
};

export type StudyPlanContent = {
  title: string;
  summary: string;
  durationWeeks: number;
  weeklyMinutes: number;
  strategy: string[];
  weeks: StudyPlanWeek[];
};

export type StudyPlanResponse = {
  id: string;
  hskLevel: number;
  intake: StudyPlanIntake;
  plan: StudyPlanContent;
  model: string;
  version: number;
  completedLessons: number;
  totalLessons: number;
  currentWeek: number;
  nextLesson: StudyPlanLesson | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type StudyPlanListResponse = {
  studyPlans: StudyPlanResponse[];
};
