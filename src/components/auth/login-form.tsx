"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAGE_ROUTES } from "@/config/page-routes";
import { isAppError } from "@/lib/errors";
import { login } from "@/services/auth.service";

export interface LoginFormProps {
  /** Optional redirect path after successful login. */
  redirectTo?: string;
}

/**
 * LoginForm
 *
 * Email/password form for Super Admin authentication. Validates input,
 * calls the auth service (mock API route), and redirects to the dashboard
 * on success. Displays API validation and credential errors inline.
 */
export function LoginForm({ redirectTo }: LoginFormProps): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push(redirectTo ?? PAGE_ROUTES.dashboard);
      router.refresh();
    } catch (err) {
      if (isAppError(err)) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>): void {
    void handleSubmit(event);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Super Admin access to the Traceability Platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="gap-card flex flex-col">
          <div className="gap-card flex flex-col">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="john@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="gap-card flex flex-col">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
