"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, BookOpen, Trash2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import AppNavbar from "@/components/AppNavbar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CourseStatusBadge from "@/components/CourseStatusBadge";
import { useRequireAuth } from "@/hooks/useAuth";
import { api, getErrorMessage } from "@/lib/api";
import type { Course } from "@/types";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get<Course[]>("/api/courses");
      setCourses(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchCourses();
  }, [user, fetchCourses]);

  useEffect(() => {
    const hasProcessing = courses.some((c) => c.status === "pending" || c.status === "processing");
    if (!hasProcessing) return;
    const interval = setInterval(fetchCourses, 4000);
    return () => clearInterval(interval);
  }, [courses, fetchCourses]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this course and all its data? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success("Course deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-zinc-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNavbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Hey {user.name.split(" ")[0]} 👋</h1>
          <p className="mt-1.5 text-zinc-600">
            Add a course to get a prioritized study plan, revision notes, and an AI tutor built from
            your own syllabus, notes, and past papers.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">My Courses</h2>
          <Link href="/courses/new">
            <Button className="gap-1.5">
              <Plus size={16} /> Add Course
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-zinc-100" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-brand-50 p-4 text-brand-500">
              <BookOpen size={28} />
            </div>
            <p className="font-medium text-zinc-900">No courses added yet</p>
            <p className="max-w-sm text-sm text-zinc-500">
              Click &ldquo;Add Course&rdquo; to upload your syllabus, notes, and PYQs — Notera will build your
              dashboard automatically.
            </p>
            <Link href="/courses/new">
              <Button className="mt-2 gap-1.5">
                <Plus size={16} /> Add your first course
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="group flex h-full flex-col justify-between p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-200/60">
                  <div>
                    <div className="mb-3 flex items-start justify-between">
                      <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
                        <BookOpen size={18} />
                      </div>
                      <button
                        onClick={(e) => handleDelete(course.id, e)}
                        disabled={deletingId === course.id}
                        className="rounded-lg p-1.5 text-zinc-300 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <h3 className="font-semibold text-zinc-900">{course.name}</h3>
                    {course.course_code && (
                      <p className="mt-0.5 text-xs text-zinc-400">{course.course_code}</p>
                    )}
                    {course.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{course.description}</p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <CourseStatusBadge status={course.status} />
                    <ArrowRight size={16} className="text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
