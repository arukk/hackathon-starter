"use client";

import { cn } from "@/lib/utils";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
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
import Link from "next/link";
import { isDemoAuthMode } from "@/lib/client-mode";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [state, formAction, isPending] = useActionState(login, { error: null });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            {isDemoAuthMode
              ? "Sign in with a demo account"
              : "Enter your email below to login to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {!isDemoAuthMode && (
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </div>
              {state.error && <p className="text-sm text-red-500">{state.error}</p>}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Logging in…" : "Login"}
              </Button>
            </div>
            {!isDemoAuthMode && (
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/auth/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {isDemoAuthMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo accounts</CardTitle>
            <CardDescription className="text-xs">
              Shown because Supabase is not configured. They disappear once you
              add NEXT_PUBLIC_SUPABASE_URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="flex flex-col gap-1">
              <li>
                <code>admin@demo.com</code> · <code>123</code> — admin
              </li>
              <li>
                <code>user@demo.com</code> · <code>456</code> — user
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
