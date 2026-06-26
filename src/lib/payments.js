export const PREMIUM_PLAN = {
  id: "premium-once",
  name: "Premium Plan",
  price: 5,
  billingLabel: "One-time payment",
  ctaLabel: "Upgrade Now - $5",
  features: [
    "Access all premium prompts",
    "Copy premium prompts without limits",
    "Priority prompt support",
    "Premium account badge",
    "Private creator prompt access",
  ],
};

export const FREE_PLAN = {
  id: "free",
  name: "Free Plan",
  price: 0,
  billingLabel: "Starter access",
  features: [
    "Browse public prompts",
    "Save prompts for later",
    "Submit reviews",
    "Create prompts with free tier limits",
  ],
};

function parseNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function isPremiumSubscription(subscription) {
  const normalized = String(subscription || "").toLowerCase();
  return normalized.includes("premium") || normalized.includes("pro") || normalized.includes("paid");
}

export function getPremiumRedirectTarget(returnTo) {
  if (!returnTo || typeof returnTo !== "string") {
    return "/premium";
  }

  if (!returnTo.startsWith("/")) {
    return "/premium";
  }

  return returnTo;
}

function buildClientUrl(pathname) {
  if (typeof window === "undefined") {
    return pathname;
  }

  return `${window.location.origin}${pathname}`;
}

export function buildCheckoutReturnUrls(returnTo = "") {
  const safeReturnTo = getPremiumRedirectTarget(returnTo);
  const successParams = new URLSearchParams({
    payment: "success",
    session_id: "{CHECKOUT_SESSION_ID}",
  });
  const cancelParams = new URLSearchParams({
    payment: "cancelled",
  });

  return {
    successUrl: buildClientUrl(`/premium?${successParams.toString()}`),
    cancelUrl: buildClientUrl(`/premium?${cancelParams.toString()}`),
    returnTo: safeReturnTo,
  };
}

export function normalizePayments(payload) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.payments)
    ? payload.payments
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.result)
    ? payload.result
    : [];

  return items.map((item, index) => {
    const amount = parseNumber(item?.amount || item?.price || item?.total, PREMIUM_PLAN.price);
    const createdAt = item?.createdAt || item?.date || item?.paidAt || new Date(Date.now() - index * 86400000).toISOString();
    const status = String(item?.status || item?.paymentStatus || "completed")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    const userName = item?.userName || item?.customerName || item?.name || "";
    const userEmail = item?.userEmail || item?.email || item?.customerEmail || "";
    const currency = String(item?.currency || "usd").toUpperCase();
    const planName = item?.planName || item?.plan || PREMIUM_PLAN.name;

    return {
      id: item?._id || item?.id || `payment-${index}`,
      transactionId:
        item?.transactionId ||
        item?.paymentIntentId ||
        item?.intentId ||
        item?.clientSecret ||
        `PF-${100000 + index}`,
      amount,
      status,
      statusValue: String(item?.status || item?.paymentStatus || "completed").toLowerCase(),
      currency,
      userName,
      userEmail,
      plan: item?.plan || planName,
      planName,
      createdAt,
      createdLabel: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(createdAt)),
      expiryDate:
        item?.expiryDate ||
        item?.expiresAt ||
        new Date(new Date(createdAt).getTime() + 31536000000).toISOString(),
    };
  });
}

export function buildPaymentPayload(values, user, options = {}) {
  return {
    amount: PREMIUM_PLAN.price,
    plan: PREMIUM_PLAN.id,
    planName: PREMIUM_PLAN.name,
    billingEmail: values.billingEmail.trim() || user?.email || "",
    billingName: values.nameOnCard.trim() || user?.name || "",
    currency: "usd",
    successUrl: options.successUrl || undefined,
    cancelUrl: options.cancelUrl || undefined,
    returnTo: options.returnTo || undefined,
  };
}
