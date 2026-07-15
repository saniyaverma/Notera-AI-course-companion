"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api, getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      toast.error("Google sign-in failed");
      router.replace("/login");
      return;
    }

    localStorage.setItem("notera_token", token);
    api
      .get("/api/auth/me")
      .then((res) => {
        setAuth(res.data, token);
        router.replace("/dashboard");
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        router.replace("/login");
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-zinc-500">
      <Loader2 className="animate-spin" size={28} />
      <p className="text-sm">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackHandler />
    </Suspense>
  );
}
