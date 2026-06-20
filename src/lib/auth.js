import { z } from "zod";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

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

export function normalizeAuthUser(payload) {
  if (!payload) {
    return null;
  }

  const candidate =
    payload.user ||
    payload.data?.user ||
    payload.result?.user ||
    payload.data ||
    payload.result ||
    payload;

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  return {
    ...candidate,
    id: candidate.id || candidate._id || "",
    role: candidate.role || "user",
    subscription: candidate.subscription || "free",
  };
}

export function getPostAuthRedirect(user) {
  const role = normalizeAuthUser(user)?.role;

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
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  const callbackPath = `${pathname}?social=google`;
  const errorPath = `${pathname}?social=google-error`;

  return {
    provider: "google",
    callbackURL: buildSocialCallbackUrl(callbackPath),
    errorCallbackURL: buildSocialCallbackUrl(errorPath),
  };
}
