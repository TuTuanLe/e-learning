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

export const dictationApi = {
  catalog: () => request<DictationCatalogResponse>("/dictation/catalog"),
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
