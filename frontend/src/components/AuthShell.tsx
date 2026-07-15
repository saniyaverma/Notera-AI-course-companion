import Link from "next/link";
import Logo from "@/components/Logo";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50/40 via-white to-white px-4 py-10">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-8 shadow-xl shadow-zinc-200/40">
          <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
          <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
