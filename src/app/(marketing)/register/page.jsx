import AuthPageShell from "@/components/auth/AuthPageShell";
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;

  return (
    <AuthPageShell
      formIntro="Join PromptFlow and start your journey"
      formTitle="Create Your Account"
      mode="register"
    >
      <RegisterForm socialStatus={params?.social} />
    </AuthPageShell>
  );
}
