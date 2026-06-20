"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Image as ImageIcon, Globe, CheckCircle2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import MotionReveal from "@/components/shared/MotionReveal";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { getPostAuthRedirect, registerSchema } from "@/lib/auth";
import { toastError, toastSuccess, toastWarning } from "@/lib/toast";
import AuthField from "@/components/auth/AuthField";

const passwordChecks = [
  {
    id: "length",
    label: "Minimum 6 characters",
    test: (value) => value.length >= 6,
  },
  {
    id: "uppercase",
    label: "One uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter",
    test: (value) => /[a-z]/.test(value),
  },
];

export default function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated, loading, signUp, user } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      photoUrl: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    resolver: zodResolver(registerSchema),
  });
  const passwordValue = useWatch({
    control,
    name: "password",
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(getPostAuthRedirect(user));
    }
  }, [isAuthenticated, loading, router, user]);

  async function onSubmit(values) {
    setSubmitError("");

    try {
      const nextUser = await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
        image: values.photoUrl || undefined,
      });
      toastSuccess("Account created successfully");
      router.replace(getPostAuthRedirect(nextUser));
    } catch (error) {
      const message = error.message || "Unable to create your account right now.";
      setSubmitError(message);
      toastError(message);
    }
  }

  return (
    <MotionReveal preset="viewportReveal">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <AuthField
          autoComplete="name"
          error={errors.name?.message}
          icon={User}
          label="Full Name"
          placeholder="Enter your full name"
          {...register("name")}
        />

        <AuthField
          autoComplete="email"
          error={errors.email?.message}
          icon={Mail}
          label="Email Address"
          placeholder="Enter your email"
          {...register("email")}
        />

        <AuthField
          autoComplete="url"
          error={errors.photoUrl?.message}
          icon={ImageIcon}
          label="Photo URL (Optional)"
          placeholder="https://example.com/photo.jpg"
          {...register("photoUrl")}
        />

        <AuthField
          autoComplete="new-password"
          error={errors.password?.message}
          icon={Lock}
          label="Password"
          onToggleVisibility={() => setIsPasswordVisible((visible) => !visible)}
          placeholder="Create a password"
          showVisibilityToggle
          visible={isPasswordVisible}
          {...register("password")}
        />

        <AuthField
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          icon={Lock}
          label="Confirm Password"
          onToggleVisibility={() => setIsConfirmPasswordVisible((visible) => !visible)}
          placeholder="Confirm your password"
          showVisibilityToggle
          visible={isConfirmPasswordVisible}
          {...register("confirmPassword")}
        />

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-medium text-slate-700">Password must contain:</p>
          <div className="space-y-2">
            {passwordChecks.map((check) => {
              const isComplete = check.test(passwordValue || "");

              return (
                <div key={check.id} className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2
                    className={isComplete ? "h-4 w-4 text-emerald-500" : "h-4 w-4 text-slate-300"}
                  />
                  <span>{check.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <label className="inline-flex items-start gap-3 text-sm text-slate-700">
          <input
            className="mt-0.5 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
            type="checkbox"
            {...register("termsAccepted")}
          />
          <span>
            I agree to the{" "}
            <button
              className="font-semibold text-primary transition hover:text-secondary"
              onClick={() => toastWarning("Terms content is not available yet.")}
              type="button"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              className="font-semibold text-primary transition hover:text-secondary"
              onClick={() => toastWarning("Privacy policy content is not available yet.")}
              type="button"
            >
              Privacy Policy
            </button>
          </span>
        </label>
        {errors.termsAccepted?.message ? (
          <p className="text-sm font-medium text-rose-500">{errors.termsAccepted.message}</p>
        ) : null}

        {submitError ? <p className="text-sm font-medium text-rose-500">{submitError}</p> : null}

        <Button className="w-full" isLoading={isSubmitting} size="lg" type="submit">
          Create Account
        </Button>

        <div className="flex items-center gap-4 py-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-sm text-slate-400">or continue with</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-base font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:bg-slate-50"
          onClick={() => toastWarning("Google sign up UI is ready for a future integration.")}
          type="button"
        >
          <Globe className="h-5 w-5 text-primary" />
          Sign up with Google
        </button>

        <p className="text-center text-base text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-primary transition hover:text-secondary" href="/login">
            Login
          </Link>
        </p>
      </form>
    </MotionReveal>
  );
}
