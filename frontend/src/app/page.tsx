"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderPlus, Sparkles, MessagesSquare, ListChecks, ImageIcon, ArrowRight } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthInit } from "@/hooks/useAuth";

const FEATURES = [
  {
    icon: FolderPlus,
    title: "Add Courses",
    desc: "Upload your syllabus, notes, and previous year questions for any course in seconds.",
    href: "/dashboard",
  },
  {
    icon: Sparkles,
    title: "Generate Notes",
    desc: "Get crisp, exam-ready revision notes auto-generated from your own course material.",
    href: "/dashboard",
  },
  {
    icon: MessagesSquare,
    title: "Chat with Notes",
    desc: "Ask Notera anything about your course and get grounded, accurate answers instantly.",
    href: "/dashboard",
  },
  {
    icon: ListChecks,
    title: "Prioritize Topics",
    desc: "See exactly what to study first, based on how often it's been asked, and what's missing from your notes.",
    href: "/dashboard",
  },
  {
    icon: ImageIcon,
    title: "Diagrams, All in One Place",
    desc: "Notera automatically extracts diagrams from your notes so you never lose track of visual material.",
    href: "/dashboard",
  },
];

export default function HomePage() {
  useAuthInit();
  const router = useRouter();
  const { user } = useAuthStore();

  const handleFeatureClick = (href: string) => {
    router.push(user ? href : "/login");
  };

  return(
    <div className="min-h-screen bg-gradient-to-b from-brand-50/40 via-white to-white">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl px-6">
        <section className="flex flex-col items-center py-20 text-center animate-fadeIn">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-medium text-brand-700">
            <Sparkles size={13} /> AI-powered course companion
          </span>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-zinc-900 sm:text-6xl">
            Study smarter with <span className="text-brand-500">Notera</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-zinc-600">
            Upload your syllabus, notes, and past papers. Notera prioritizes topics, extracts
            important questions, generates revision notes, and answers your doubts — all in one place.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={user ? "/dashboard" : "/signup"}>
              <Button size="lg" className="gap-2">
                Get Started Free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href={user ? "/dashboard" : "/login"}>
              <Button size="lg" variant="secondary">
                {user ? "Go to Dashboard" : "Log in"}
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-5 pb-16 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              onClick={() => handleFeatureClick(f.href)}
              className="cursor-pointer p-7 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100"
            >
              <div className="mb-4 inline-flex rounded-xl bg-brand-50 p-3 text-brand-600">
                <f.icon size={22} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">{f.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600">{f.desc}</p>
            </Card>
          ))}
        </section>

        {/* <section className="grid gap-6 pb-24 sm:grid-cols-2">
          <Card className="flex items-start gap-4 p-6">
            <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
              <ListChecks size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Topic Priority & Coverage</h4>
              <p className="mt-1 text-sm text-zinc-600">
                See exactly what to study first, based on how often it's been asked, and what's
                missing from your notes.
              </p>
            </div>
          </Card>
          <Card className="flex items-start gap-4 p-6">
            <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
              <ImageIcon size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Diagrams, All in One Place</h4>
              <p className="mt-1 text-sm text-zinc-600">
                Notera automatically extracts diagrams from your notes so you never lose track of
                visual material.
              </p>
            </div>
          </Card>
        </section> */}
      </main>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        © {new Date().getFullYear()} Notera. Built for students with ❤️.
      </footer>
    </div>
  );
}
