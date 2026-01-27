"use client";

import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "../AuthShell";

export default function ResetPassword() {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // UI-only for now (backend endpoint varies between environments).
      // Keep the UX consistent with legacy: always show a generic success message.
      await new Promise((r) => setTimeout(r, 400));
      setSuccess("If that email exists in our system, you will receive a password reset email shortly.");
    } catch {
      setError("Unable to send reset email right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-medium text-slate-700">Request password reset</h1>
        <p className="text-slate-600">To reset your password, please enter an email associated with your account.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">
            E-mail
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

        {/* reCAPTCHA placeholder (legacy UI shows it here) */}
        <div className="border rounded-md p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="text-sm text-red-600">ERROR for site owner: Invalid domain for site key</div>
            <div className="text-xs text-slate-500">reCAPTCHA</div>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 text-right">Privacy - Terms</div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        ) : null}

        {success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send"}
        </Button>

        <div>
          <Link href="/login" className="text-sm text-primary hover:underline" prefetch={false}>
            &lt; Back
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

