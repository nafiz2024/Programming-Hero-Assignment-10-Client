import AuthPageShell from "@/components/auth/AuthPageShell";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <AuthPageShell
      formIntro="Login to your account to continue"
      formTitle="Welcome Back"
      mode="login"
    >
      <LoginForm socialStatus={params?.social} />
    </AuthPageShell>
  );
}
