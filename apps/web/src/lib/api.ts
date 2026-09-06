import type {
  CheckoutResponse,
  CreateDictationSessionRequest,
  DictationAnswerResponse,
  DictationCatalogResponse,
  DictationSessionListResponse,
  DictationSessionResponse,
  PaymentOrderListResponse,
  PaymentOrderResponse,
  StudyPlanIntake,
  StudyPlanListResponse,
  StudyPlanResponse,
  SubscriptionPlan,
  SubscriptionSummary,
  SubmitDictationAnswerRequest,
} from "@dictation/contracts";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? "API request failed.");
  }

  return payload as T;
}

let catalogCache: DictationCatalogResponse | null = null;

function getStoredCatalog(): DictationCatalogResponse | null {
  if (catalogCache) return catalogCache;
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("dictation:catalog:v1");
      if (stored) {
        catalogCache = JSON.parse(stored) as DictationCatalogResponse;
        return catalogCache;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

function setStoredCatalog(data: DictationCatalogResponse): void {
  catalogCache = data;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem("dictation:catalog:v1", JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

export const dictationApi = {
  getCachedCatalog: () => getStoredCatalog(),
  setCachedCatalog: (catalog: DictationCatalogResponse) => setStoredCatalog(catalog),
  catalog: async () => {
    const cached = getStoredCatalog();
    if (cached) return cached;
    const data = await request<DictationCatalogResponse>("/dictation/catalog");
    setStoredCatalog(data);
    return data;
  },
  sessions: (token: string) =>
    request<DictationSessionListResponse>("/dictation/sessions", {}, token),
  createSession: (payload: CreateDictationSessionRequest, token: string) =>
    request<DictationSessionResponse>(
      "/dictation/sessions",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  session: (id: string, token: string) =>
    request<DictationSessionResponse>(`/dictation/sessions/${id}`, {}, token),
  answer: (id: string, payload: SubmitDictationAnswerRequest, token: string) =>
    request<DictationAnswerResponse>(
      `/dictation/sessions/${id}/answers`,
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
};

export const subscriptionApi = {
  summary: (token: string) =>
    request<SubscriptionSummary>("/subscription", {}, token),
  checkout: (plan: SubscriptionPlan, token: string) =>
    request<CheckoutResponse>(
      "/subscription/checkout",
      { method: "POST", body: JSON.stringify({ plan }) },
      token,
    ),
  portal: (token: string) =>
    request<{ url: string }>("/subscription/portal", { method: "POST" }, token),
};

export const accountApi = {
  learning: (token: string) =>
    request<{
      subscription: SubscriptionSummary;
      studyPlans: StudyPlanResponse[];
    }>("/account/learning", {}, token),
};

export const paymentApi = {
  order: (invoice: string) =>
    request<PaymentOrderResponse>(`/payment/orders/${invoice}`),
};

export const adminApi = {
  orders: (token: string) =>
    request<PaymentOrderListResponse>("/admin/orders", {}, token),
  activateOrder: (id: string, token: string) =>
    request<PaymentOrderResponse>(
      `/admin/orders/${id}/activate`,
      { method: "POST" },
      token,
    ),
};

export const studyPlanApi = {
  list: (token: string) =>
    request<StudyPlanListResponse>("/study-plan", {}, token),
  generate: (intake: StudyPlanIntake, token: string) =>
    request<StudyPlanResponse>(
      "/study-plan",
      { method: "POST", body: JSON.stringify(intake) },
      token,
    ),
  startLesson: (hskLevel: number, lessonId: string, token: string) =>
    request<DictationSessionResponse>(
      `/study-plan/${hskLevel}/lessons/${lessonId}/start`,
      { method: "POST" },
      token,
    ),
};
