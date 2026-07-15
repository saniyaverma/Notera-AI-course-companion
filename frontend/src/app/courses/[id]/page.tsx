"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ListChecks, HelpCircle, Sparkles, ImageIcon, MessagesSquare } from "lucide-react";
import toast from "react-hot-toast";
import AppNavbar from "@/components/AppNavbar";
import CourseStatusBadge from "@/components/CourseStatusBadge";
import ProcessingState from "@/components/ProcessingState";
import DashboardTabs, { TabDef } from "@/components/dashboard/DashboardTabs";
import TopicPriorityList from "@/components/dashboard/TopicPriorityList";
import MissingTopicsCard from "@/components/dashboard/MissingTopicsCard";
import ImportantQuestionsList from "@/components/dashboard/ImportantQuestionsList";
import ShortNotesPanel from "@/components/dashboard/ShortNotesPanel";
import DiagramsGallery from "@/components/dashboard/DiagramsGallery";
import ChatPanel from "@/components/dashboard/ChatPanel";
import { useRequireAuth } from "@/hooks/useAuth";
import { api, getErrorMessage } from "@/lib/api";
import type { Course, DashboardData } from "@/types";

const TABS: TabDef[] = [
  { key: "topics", label: "Topic Priority", icon: ListChecks },
  { key: "questions", label: "Important Questions", icon: HelpCircle },
  { key: "notes", label: "Short Notes", icon: Sparkles },
  { key: "diagrams", label: "Diagrams", icon: ImageIcon },
  { key: "chat", label: "Chat with Notera", icon: MessagesSquare },
];

export default function CourseDetailPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState("topics");
  const [loading, setLoading] = useState(true);
  const [generatingNotes, setGeneratingNotes] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await api.get<Course>(`/api/courses/${courseId}`);
      setCourse(res.data);
      return res.data;
    } catch (err) {
      toast.error(getErrorMessage(err));
      router.push("/dashboard");
      return null;
    }
  }, [courseId, router]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get<DashboardData>(`/api/courses/${courseId}/dashboard`);
      setDashboard(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }, [courseId]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const c = await fetchCourse();
      if (c?.status === "completed") {
        await fetchDashboard();
      }
      setLoading(false);
    })();
  }, [user, fetchCourse, fetchDashboard]);

  useEffect(() => {
    if (!course || (course.status !== "pending" && course.status !== "processing")) return;
    const interval = setInterval(async () => {
      const c = await fetchCourse();
      if (c?.status === "completed") {
        await fetchDashboard();
        clearInterval(interval);
      } else if (c?.status === "failed") {
        clearInterval(interval);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [course, fetchCourse, fetchDashboard]);

  const handleRetry = async () => {
    try {
      await api.post(`/api/courses/${courseId}/reprocess`);
      toast.success("Reprocessing started");
      fetchCourse();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleGenerateNotes = async () => {
    setGeneratingNotes(true);
    try {
      await api.post(`/api/courses/${courseId}/generate-notes`);
      toast.success("Generating your revision notes… this may take a minute");
      setTimeout(async () => {
        await fetchDashboard();
        setGeneratingNotes(false);
      }, 15000);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setGeneratingNotes(false);
    }
  };

  if (authLoading || !user || loading || !course) {
    return <div className="flex min-h-screen items-center justify-center text-zinc-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800">
          <ArrowLeft size={15} /> Back to courses
        </Link>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900">{course.name}</h1>
              <CourseStatusBadge status={course.status} />
            </div>
            {course.course_code && <p className="mt-1 text-sm text-zinc-400">{course.course_code}</p>}
            {course.description && <p className="mt-2 max-w-2xl text-sm text-zinc-600">{course.description}</p>}
          </div>
        </div>

        {course.status !== "completed" ? (
          <ProcessingState status={course.status} error={course.processing_error} onRetry={handleRetry} />
        ) : dashboard ? (
          <>
            <DashboardTabs
              tabs={TABS.map((t) => ({
                ...t,
                count:
                  t.key === "topics"
                    ? dashboard.topics.length
                    : t.key === "questions"
                    ? dashboard.questions.length
                    : t.key === "notes"
                    ? dashboard.short_notes.length
                    : t.key === "diagrams"
                    ? dashboard.diagrams.length
                    : undefined,
              }))}
              active={activeTab}
              onChange={setActiveTab}
            />

            <div className="mt-6">
              {activeTab === "topics" && (
                <div className="space-y-5">
                  <MissingTopicsCard missingTopics={dashboard.missing_topics} />
                  <TopicPriorityList topics={dashboard.topics} coveragePercent={dashboard.coverage_percent} />
                </div>
              )}
              {activeTab === "questions" && <ImportantQuestionsList questions={dashboard.questions} />}
              {activeTab === "notes" && (
                <ShortNotesPanel notes={dashboard.short_notes} onGenerate={handleGenerateNotes} generating={generatingNotes} />
              )}
              {activeTab === "diagrams" && <DiagramsGallery diagrams={dashboard.diagrams} />}
              {activeTab === "chat" && <ChatPanel courseId={courseId} />}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
