"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Globe } from "lucide-react";
import { useForm } from "react-hook-form";

import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getPostAuthRedirect, loginSchema } from "@/lib/auth";
import { toastError, toastSuccess, toastWarning } from "@/lib/toast";
import AuthField from "@/components/auth/AuthField";

export default function LoginForm() {
  const router = useRouter();
  const { isAuthenticated, loading, signIn, user } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(getPostAuthRedirect(user));
    }
  }, [isAuthenticated, loading, router, user]);

  async function onSubmit(values) {
    setSubmitError("");

    try {
      const nextUser = await signIn(values.email, values.password);
      toastSuccess("Login successful");
      router.replace(getPostAuthRedirect(nextUser));
    } catch (error) {
      const message = error.message || "Unable to log in with those credentials.";
      setSubmitError(message);
      toastError(message);
    }
  }

  return (
    <MotionReveal preset="viewportReveal">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <AuthField
          autoComplete="email"
          error={errors.email?.message}
          icon={Mail}
          label="Email address"
          placeholder="Enter your email"
          {...register("email")}
        />

        <AuthField
          autoComplete="current-password"
          error={errors.password?.message}
          icon={Lock}
          label="Password"
          onToggleVisibility={() => setIsPasswordVisible((visible) => !visible)}
          placeholder="Enter your password"
          showVisibilityToggle
          visible={isPasswordVisible}
          {...register("password")}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
              type="checkbox"
              {...register("rememberMe")}
            />
            <span>Remember me</span>
          </label>
          <button
            className="text-sm font-semibold text-primary transition hover:text-secondary"
            onClick={() => toastWarning("Forgot password flow is not available yet.")}
            type="button"
          >
            Forgot password?
          </button>
        </div>

        {submitError ? <p className="text-sm font-medium text-rose-500">{submitError}</p> : null}

        <Button className="w-full" isLoading={isSubmitting} size="lg" type="submit">
          Login
        </Button>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-sm text-slate-400">or continue with</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:bg-slate-50"
          onClick={() => toastWarning("Google login UI is ready for a future integration.")}
          type="button"
        >
          <Globe className="h-5 w-5 text-primary" />
          Continue with Google
        </button>

        <p className="text-center text-base text-slate-500">
          Don&apos;t have an account?{" "}
          <Link className="font-semibold text-primary transition hover:text-secondary" href="/register">
            Register now
          </Link>
        </p>
      </form>
    </MotionReveal>
  );
}
