const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return API_BASE_URL;
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();

    if (!text) {
      return null;
    }

    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildHeaders(headers = {}, body) {
  const nextHeaders = new Headers(headers);

  if (body && !(body instanceof FormData) && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", "application/json");
  }

  return nextHeaders;
}

export async function apiRequest(endpoint, options = {}) {
  const { headers, body, ...restOptions } = options;
  const url = `${getApiBaseUrl()}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const requestHeaders = buildHeaders(headers, body);
  const requestBody =
    body && !(body instanceof FormData) && typeof body !== "string"
      ? JSON.stringify(body)
      : body;

  const response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
    body: requestBody,
    credentials: "include",
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.details ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  signUp(payload) {
    return apiRequest("/api/auth/sign-up/email", {
      method: "POST",
      body: payload,
    });
  },

  signIn(payload) {
    return apiRequest("/api/auth/sign-in/email", {
      method: "POST",
      body: payload,
    });
  },

  signInSocial(payload) {
    return apiRequest("/api/auth/sign-in/social", {
      method: "POST",
      body: payload,
    });
  },

  signOut() {
    return apiRequest("/api/auth/sign-out", {
      method: "POST",
    });
  },

  getSession() {
    return apiRequest("/api/users/me");
  },
};

export const userApi = {
  getMe() {
    return apiRequest("/api/users/me");
  },
};

export const promptApi = {
  getAll(queryString = "") {
    return apiRequest(`/api/prompts${queryString}`);
  },

  getById(id) {
    return apiRequest(`/api/prompts/${id}`);
  },

  create(payload) {
    return apiRequest("/api/prompts", {
      method: "POST",
      body: payload,
    });
  },

  update(id, payload) {
    return apiRequest(`/api/prompts/${id}`, {
      method: "PATCH",
      body: payload,
    });
  },

  remove(id) {
    return apiRequest(`/api/prompts/${id}`, {
      method: "DELETE",
    });
  },

  copy(id, payload = {}) {
    return apiRequest(`/api/prompts/${id}/copy`, {
      method: "PATCH",
      body: payload,
    });
  },

  copyPublic(id, payload = {}) {
    return apiRequest(`/api/prompts/${id}/copy`, {
      method: "POST",
      body: payload,
    });
  },

  bookmark(id) {
    return apiRequest(`/api/prompts/${id}/bookmark`, {
      method: "POST",
    });
  },

  unbookmark(id) {
    return apiRequest(`/api/prompts/${id}/bookmark`, {
      method: "DELETE",
    });
  },
};

export const bookmarkApi = {
  toggle(promptId, isBookmarked) {
    return apiRequest(`/api/bookmarks/${promptId}`, {
      method: isBookmarked ? "DELETE" : "POST",
    });
  },

  create(promptId) {
    return apiRequest(`/api/bookmarks/${promptId}`, {
      method: "POST",
    });
  },

  getAll() {
    return apiRequest("/api/bookmarks");
  },

  remove(promptId) {
    return apiRequest(`/api/bookmarks/${promptId}`, {
      method: "DELETE",
    });
  },
};

export const reviewApi = {
  create(payload) {
    return apiRequest("/api/reviews", {
      method: "POST",
      body: payload,
    });
  },

  createOrUpdate(promptId, payload) {
    return apiRequest(`/api/reviews/${promptId}`, {
      method: "POST",
      body: payload,
    });
  },

  getByPrompt(promptId) {
    return apiRequest(`/api/reviews/${promptId}`);
  },

  remove(promptId) {
    return apiRequest(`/api/reviews/${promptId}`, {
      method: "DELETE",
    });
  },

  removeForPrompt(promptId, payload = {}) {
    return apiRequest(`/api/reviews/${promptId}`, {
      method: "DELETE",
      body: payload,
    });
  },
};

export const paymentApi = {
  createCheckoutSession(payload) {
    return apiRequest("/api/payments/checkout-session", {
      method: "POST",
      body: payload,
    });
  },

  finalizeCheckoutSession(payload) {
    return apiRequest("/api/payments/finalize-checkout", {
      method: "POST",
      body: payload,
    });
  },

  getMyPayments() {
    return apiRequest("/api/payments/my-payments");
  },
};

export const reportApi = {
  create(promptId, payload) {
    return apiRequest(`/api/reports/${promptId}`, {
      method: "POST",
      body: {
        promptId,
        ...payload,
      },
    });
  },
};

export const adminApi = {
  getStats() {
    return apiRequest("/api/admin/stats");
  },

  getRevenue() {
    return apiRequest("/api/admin/revenue");
  },

  getRecentActivity() {
    return apiRequest("/api/admin/recent-activity");
  },

  getUsers(queryString = "") {
    return apiRequest(`/api/users${queryString}`);
  },

  updateUserRole(id, payload) {
    return apiRequest(`/api/users/${id}/role`, {
      method: "PATCH",
      body: payload,
    });
  },

  deleteUser(id) {
    return apiRequest(`/api/users/${id}`, {
      method: "DELETE",
    });
  },

  getReports(queryString = "") {
    return apiRequest(`/api/reports${queryString}`);
  },

  warnCreator(id, payload = {}) {
    return apiRequest(`/api/reports/${id}/warn-creator`, {
      method: "PATCH",
      body: payload,
    });
  },

  removePrompt(id, payload = {}) {
    return apiRequest(`/api/reports/${id}/remove-prompt`, {
      method: "PATCH",
      body: payload,
    });
  },

  dismissReport(id, payload = {}) {
    return apiRequest(`/api/reports/${id}/dismiss`, {
      method: "PATCH",
      body: payload,
    });
  },
};
