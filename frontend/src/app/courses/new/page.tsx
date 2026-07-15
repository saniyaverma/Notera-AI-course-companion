"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import AppNavbar from "@/components/AppNavbar";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FileDropzone from "@/components/FileDropzone";
import { useRequireAuth } from "@/hooks/useAuth";
import { api, getErrorMessage } from "@/lib/api";

export default function NewCoursePage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [syllabus, setSyllabus] = useState<File | null>(null);
  const [notes, setNotes] = useState<File | null>(null);
  const [pyqs, setPyqs] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (authLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-zinc-400">Loading…</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Course name is required");
    if (!syllabus || !notes || !pyqs) return toast.error("Please upload syllabus, notes, and PYQs");

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (courseCode) formData.append("course_code", courseCode);
      if (description) formData.append("description", description);
      formData.append("syllabus", syllabus);
      formData.append("notes", notes);
      formData.append("pyqs", pyqs);

      const res = await api.post("/api/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Course added! Notera is analyzing your material…");
      router.push(`/courses/${res.data.id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNavbar />

      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800">
          <ArrowLeft size={15} /> Back to courses
        </Link>

        <Card className="p-7">
          <h1 className="text-xl font-bold text-zinc-900">Add a new course</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload your syllabus, notes, and previous year questions. Notera will extract topics,
            prioritize them, and build your study dashboard automatically.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Input label="Course name" placeholder="e.g. Data Structures & Algorithms" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Course ID (optional)" placeholder="e.g. CS301" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">Description (optional)</label>
              <textarea
                className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                rows={2}
                placeholder="A short note about this course"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <FileDropzone
              label="Syllabus"
              helpText="Used for topic extraction and topic matching"
              file={syllabus}
              onChange={setSyllabus}
              required
            />
            <FileDropzone
              label="Notes"
              helpText="Used to generate short notes, extract diagrams, and power the chat feature"
              file={notes}
              onChange={setNotes}
              required
            />
            <FileDropzone
              label="Previous Year Questions (PYQs)"
              helpText="Used for topic prioritization and to build the important questions list"
              file={pyqs}
              onChange={setPyqs}
              required
            />

            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Add Course
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
