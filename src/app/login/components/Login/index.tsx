"use client";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/api/client";
import AuthShell from "../AuthShell";

type LoginResponse = {
  token?: string;
  accessToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
  };
  success?: boolean;
  message?: string;
};

function extractToken(payload: LoginResponse | unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const p = payload as LoginResponse;
  const direct = (p as { token?: string }).token || (p as { accessToken?: string }).accessToken;
  if (typeof direct === "string" && direct.length > 0) return direct;

  const nested = p.data?.token || p.data?.accessToken;
  if (typeof nested === "string" && nested.length > 0) return nested;

  return null;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const loginEndpoints = ["/admin/v2/sign-in/login", "/admin/v2/login"];
      let responseData: LoginResponse | null = null;

      for (const endpoint of loginEndpoints) {
        try {
          const response = await apiClient.post<LoginResponse>(endpoint, {
            email,
            password,
            rememberMe,
          });
          responseData = response.data;
          break;
        } catch (endpointErr) {
          const status = (endpointErr as { response?: { status?: number } })?.response?.status;
          // If the endpoint doesn't exist, try the fallback; otherwise surface the error.
          if (status === 404) continue;
          throw endpointErr;
        }
      }

      if (!responseData) {
        throw new Error("Login endpoint not found (tried /admin/v2/sign-in/login and /admin/v2/login).");
      }

      const token = extractToken(responseData);
      if (!token) {
        throw new Error("Login succeeded but no token was returned.");
      }

      // This app currently expects token in localStorage (TokenGuard + API calls)
      localStorage.setItem("token", token);

      // Redirect to default location dashboard
      router.replace("/training-location/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please check your credentials and try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell title="Office Login">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(v) => setRememberMe(Boolean(v))}
          />
          <Label htmlFor="rememberMe" className="text-slate-700">
            Remember Me
          </Label>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign me in"}
        </Button>

        <div className="text-center">
          <Link href="/password-reset" className="text-sm text-primary hover:underline" prefetch={false}>
            Forgot your password?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

