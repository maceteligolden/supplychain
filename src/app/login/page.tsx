import { LoginForm } from "@/components/auth/login-form";

export interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

/**
 * Public login page for Super Admin authentication.
 */
export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;

  return (
    <div className="bg-muted p-page flex min-h-screen flex-col items-center justify-center">
      <div className="gap-section mb-8 flex flex-col items-center text-center">
        <h1 className="text-foreground text-2xl font-bold">Traceability Platform</h1>
        <p className="text-muted-foreground text-sm">
          Supply chain traceability POC — Super Admin access
        </p>
      </div>
      <LoginForm redirectTo={params.redirect} />
    </div>
  );
}
