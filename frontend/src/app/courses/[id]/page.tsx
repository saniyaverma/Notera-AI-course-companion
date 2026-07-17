"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ListChecks,
  HelpCircle,
  Sparkles,
  ImageIcon,
  MessagesSquare,
} from "lucide-react";
import toast from "react-hot-toast";

import AppNavbar from "@/components/AppNavbar";
import CourseStatusBadge from "@/components/CourseStatusBadge";
import ProcessingState from "@/components/ProcessingState";
import DashboardTabs, {
  TabDef,
} from "@/components/dashboard/DashboardTabs";
import SyllabusChecklist from "@/components/dashboard/SyllabusChecklist";
import ImportantQuestionsList from "@/components/dashboard/ImportantQuestionsList";
import ShortNotesPanel from "@/components/dashboard/ShortNotesPanel";
import DiagramsGallery from "@/components/dashboard/DiagramsGallery";
import ChatPanel from "@/components/dashboard/ChatPanel";

import { useRequireAuth } from "@/hooks/useAuth";
import { api, getErrorMessage } from "@/lib/api";

import type { Course, DashboardData } from "@/types";

const TABS: TabDef[] = [
  {
    key: "syllabus",
    label: "Syllabus",
    icon: ListChecks,
  },
  {
    key: "questions",
    label: "Questions",
    icon: HelpCircle,
  },
  {
    key: "notes",
    label: "Notes",
    icon: Sparkles,
  },
  {
    key: "diagrams",
    label: "Diagrams",
    icon: ImageIcon,
  },
  {
    key: "chat",
    label: "Chat",
    icon: MessagesSquare,
  },
];

export default function CourseDetailPage() {
  const { user, isLoading: authLoading } = useRequireAuth();

  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [activeTab, setActiveTab] = useState("syllabus");

  const [loading, setLoading] = useState(true);
  const [generatingNotes, setGeneratingNotes] = useState(false);

  const updateTopics = (topics: DashboardData["topics"]) => {
    setDashboard((prev) => {
      if (!prev) return prev;

      const completed = topics.filter((topic) => topic.completed).length;

      return {
        ...prev,
        topics,
        completed_topics: completed,
        syllabus_progress:
          topics.length === 0
            ? 0
            : Math.round((completed / topics.length) * 100),
      };
    });
  };

  const fetchCourse = useCallback(async () => {
    try {
      const response = await api.get<Course>(
        `/api/courses/${courseId}`
      );

      setCourse(response.data);

      return response.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      router.push("/dashboard");
      return null;
    }
  }, [courseId, router]);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await api.get<DashboardData>(
        `/api/courses/${courseId}/dashboard`
      );

      setDashboard(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }, [courseId]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      setLoading(true);

      const course = await fetchCourse();

      if (course?.status === "completed") {
        await fetchDashboard();
      }

      setLoading(false);
    })();
  }, [user, fetchCourse, fetchDashboard]);

  useEffect(() => {
    if (
      !course ||
      (course.status !== "pending" &&
        course.status !== "processing")
    ) {
      return;
    }

    const interval = setInterval(async () => {
      const updatedCourse = await fetchCourse();

      if (updatedCourse?.status === "completed") {
        await fetchDashboard();
        clearInterval(interval);
      } else if (updatedCourse?.status === "failed") {
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
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleGenerateNotes = async () => {
    setGeneratingNotes(true);

    try {
      await api.post(`/api/courses/${courseId}/generate-notes`);

      toast.success(
        "Generating your revision notes… this may take a minute"
      );

      setTimeout(async () => {
        await fetchDashboard();
        setGeneratingNotes(false);
      }, 15000);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setGeneratingNotes(false);
    }
  };

    if (authLoading || !user || loading || !course) {
      return (
        <div className="flex min-h-screen items-center justify-center text-zinc-400">
          Loading…
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-zinc-50">
        <AppNavbar />

        <main className="mx-auto max-w-6xl px-6 py-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
          >
            <ArrowLeft size={15} />
            Back to courses
          </Link>

          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                  {course.name}
                </h1>

                <CourseStatusBadge status={course.status} />
              </div>

              {course.course_code && (
                <p className="mt-1 text-sm text-zinc-400">
                  {course.course_code}
                </p>
              )}

              {course.description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                  {course.description}
                </p>
              )}
            </div>
          </div>

          {course.status !== "completed" ? (
            <ProcessingState
              status={course.status}
              error={course.processing_error}
              onRetry={handleRetry}
            />
          ) : dashboard ? (
            <>
              <DashboardTabs
                tabs={TABS.map((tab) => ({
                  ...tab,
                  count:
                    tab.key === "syllabus"
                      ? dashboard.topics.length
                      : tab.key === "questions"
                      ? dashboard.questions.length
                      : tab.key === "notes"
                      ? dashboard.short_notes.length
                      : tab.key === "diagrams"
                      ? dashboard.diagrams.length
                      : undefined,
                }))}
                active={activeTab}
                onChange={setActiveTab}
              />

              <div className="mt-6">
                {activeTab === "syllabus" && (
                  <SyllabusChecklist
                    topics={dashboard.topics}
                    totalTopics={dashboard.total_topics}
                    completedTopics={dashboard.completed_topics}
                    syllabusProgress={dashboard.syllabus_progress}
                    onTopicsChange={updateTopics}
                  />
                )}

                {activeTab === "questions" && (
                  <ImportantQuestionsList
                    questions={dashboard.questions}
                  />
                )}

                {activeTab === "notes" && (
                  <ShortNotesPanel
                    notes={dashboard.short_notes}
                    onGenerate={handleGenerateNotes}
                    generating={generatingNotes}
                  />
                )}

                {activeTab === "diagrams" && (
                  <DiagramsGallery
                    diagrams={dashboard.diagrams}
                  />
                )}

                {activeTab === "chat" && (
                  <ChatPanel
                    courseId={courseId}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
              Dashboard data is not available yet.
            </div>
          )}
        </main>
      </div>
    );
  }