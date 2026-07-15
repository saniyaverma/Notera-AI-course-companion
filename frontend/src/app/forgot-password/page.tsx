"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api, getErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell title="Check your inbox" subtitle="">
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
          <p className="text-sm text-zinc-600">
            If an account exists for <span className="font-medium text-zinc-900">{email}</span>, we&apos;ve
            sent a password reset link to it. The link expires in 30 minutes.
          </p>
          <Link href="/login" className="mt-6 text-sm font-medium text-brand-600 hover:underline">
            Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Remembered your password?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
