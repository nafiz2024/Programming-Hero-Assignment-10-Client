import AuthPageShell from "@/components/auth/AuthPageShell";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthPageShell
      formIntro="Join PromptFlow and start your journey"
      formTitle="Create Your Account"
      mode="register"
    >
      <RegisterForm />
    </AuthPageShell>
  );
}
