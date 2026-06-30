import { z } from "zod";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.VITE_API_URL ||
  ""
).replace(/\/$/, "");

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
  rememberMe: z.boolean().default(true),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Please enter your full name."),
    email: z.email("Please enter a valid email address."),
    photoUrl: z
      .union([z.literal(""), z.url("Please enter a valid URL.")])
      .optional()
      .default(""),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
      .regex(/[a-z]/, "Password must include at least one lowercase letter."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    termsAccepted: z.boolean().refine((value) => value, {
      message: "You must accept the terms to continue.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function getUserImageSrc(user) {
  if (!user || typeof user !== "object") {
    return "";
  }

  return (
    user.image ||
    user.picture ||
    user.photoURL ||
    user.avatar ||
    user.photo ||
    user.profileImage ||
    ""
  );
}

export function normalizeRole(role) {
  if (typeof role !== "string") {
    return "user";
  }

  const normalizedRole = role.trim().toLowerCase();

  return normalizedRole || "user";
}

function extractAuthUserCandidate(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidates = [
    payload.user,
    payload.data?.user,
    payload.data?.data?.user,
    payload.session?.user,
    payload.data?.session?.user,
    payload.data?.data?.session?.user,
    payload.result?.user,
    payload.result?.data?.user,
    payload.result?.session?.user,
    payload.data,
    payload.result,
    payload,
  ];

  return (
    candidates.find(
      (candidate) =>
        candidate &&
        typeof candidate === "object" &&
        (candidate.email || candidate.user?.email || candidate.id || candidate._id),
    ) || null
  );
}

export function extractAuthEmail(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const emailCandidates = [
    payload.user?.email,
    payload.data?.user?.email,
    payload.session?.user?.email,
    payload.data?.session?.user?.email,
    payload.email,
    payload.data?.email,
    payload.user?.user?.email,
  ];

  const email = emailCandidates.find((candidate) => typeof candidate === "string" && candidate.trim());

  return email ? email.trim() : "";
}

export function normalizeAuthUser(payload) {
  if (!payload) {
    return null;
  }

  const candidate = extractAuthUserCandidate(payload);

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  return {
    ...candidate,
    id: candidate.id || candidate._id || candidate.email || extractAuthEmail(payload) || "",
    image: getUserImageSrc(candidate),
    email: candidate.email || extractAuthEmail(payload) || "",
    picture: candidate.picture || candidate.image || "",
    photoURL: candidate.photoURL || candidate.picture || candidate.image || "",
    avatar: candidate.avatar || candidate.picture || candidate.image || "",
    photo: candidate.photo || candidate.picture || candidate.image || "",
    role: normalizeRole(candidate.role),
    subscription: candidate.subscription || "free",
  };
}

export function getPostAuthRedirect(user) {
  const role = normalizeRole(normalizeAuthUser(user)?.role);

  if (role === "admin") {
    return "/admin";
  }

  if (role === "creator") {
    return "/creator";
  }

  return "/dashboard";
}

export function buildSocialCallbackUrl(pathname) {
  if (typeof window === "undefined") {
    return pathname;
  }

  return `${window.location.origin}${pathname}`;
}

export function getGoogleSocialPayload(pathname) {
  if (!API_BASE_URL) {
    throw new Error("API URL is not configured.");
  }

  const callbackPath = `${pathname}?social=google`;
  const errorPath = `${pathname}?social=google-error`;

  return {
    provider: "google",
    callbackURL: buildSocialCallbackUrl(callbackPath),
    errorCallbackURL: buildSocialCallbackUrl(errorPath),
  };
}
