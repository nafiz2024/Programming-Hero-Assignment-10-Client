import AuthPageShell from "@/components/auth/AuthPageShell";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthPageShell
      formIntro="Login to your account to continue"
      formTitle="Welcome Back"
      mode="login"
    >
      <LoginForm />
    </AuthPageShell>
  );
}
