"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AuthShell from "@/components/AuthShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import GoogleIcon from "@/components/GoogleIcon";
import { api, API_URL, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "Enter your full name";
    if (form.password.length < 8) errs.password = "At least 8 characters";
    if (form.password !== form.confirm_password) errs.confirm_password = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post("/api/auth/signup", form);
      setAuth(res.data.user, res.data.access_token);
      toast.success("Welcome to Notera!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start organizing your study material with AI.">
      <a href={`${API_URL}/api/auth/google/login`}>
        <Button type="button" variant="secondary" className="w-full">
          <GoogleIcon /> Continue with Google
        </Button>
      </a>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs text-zinc-400">OR</span>
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" name="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} error={errors.name} />
        <Input label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} required />
        <Input label="Password" name="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={handleChange} error={errors.password} required />
        <Input label="Confirm password" name="confirm_password" type="password" placeholder="Re-enter password" value={form.confirm_password} onChange={handleChange} error={errors.confirm_password} required />
        <Button type="submit" className="w-full" loading={loading}>
          Sign up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
