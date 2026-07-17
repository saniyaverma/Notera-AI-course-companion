"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, BookOpen, Trophy } from "lucide-react";
import toast from "react-hot-toast";

import Card from "@/components/ui/Card";
import { updateTopicCompletion } from "@/lib/api";
import type { Topic } from "@/types";

interface Props {
  topics: Topic[];
  totalTopics: number;
  completedTopics: number;
  syllabusProgress: number;

  onTopicsChange?: (topics: Topic[]) => void;
}

export default function SyllabusChecklist({
  topics,
  totalTopics,
  completedTopics,
  syllabusProgress,
  onTopicsChange,
}: Props) {
  const [localTopics, setLocalTopics] = useState(topics);
  const [savingTopicId, setSavingTopicId] = useState<string | null>(null);

  useEffect(() => {
    setLocalTopics(topics);
  }, [topics]);

  const completedCount = useMemo(
    () => localTopics.filter((t) => t.completed).length,
    [localTopics]
  );

  const progress = useMemo(() => {
    if (localTopics.length === 0) return 0;

    return Math.round((completedCount / localTopics.length) * 100);
  }, [completedCount, localTopics]);

  const courseCompleted =
    localTopics.length > 0 &&
    completedCount === localTopics.length;

  async function toggleTopic(topicId: string) {
    const previousTopics = [...localTopics];

    const updatedTopics = localTopics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            completed: !topic.completed,
          }
        : topic
    );

    // Optimistic UI
    setLocalTopics(updatedTopics);
    onTopicsChange?.(updatedTopics);

    const changedTopic = updatedTopics.find(
      (t) => t.id === topicId
    );

    if (!changedTopic) return;

    try {
      setSavingTopicId(topicId);

      await updateTopicCompletion(
        topicId,
        changedTopic.completed
      );
    } catch (error) {
      // Rollback on failure
      setLocalTopics(previousTopics);
      onTopicsChange?.(previousTopics);

      toast.error("Couldn't update checklist");
    } finally {
      setSavingTopicId(null);
    }
  }

  return (
    <Card className="overflow-hidden border border-emerald-200 bg-white shadow-sm">

      <div className="border-b border-zinc-100 p-6">

        <div className="flex items-center gap-2">

          <BookOpen className="h-5 w-5 text-emerald-600" />

          <h2 className="text-lg font-semibold text-zinc-900">
            Syllabus Checklist
          </h2>

        </div>

        <p className="mt-1 text-sm text-zinc-500">
          Track your learning progress across the course.
        </p>

        <div className="mt-6">

          <div className="mb-2 flex items-center justify-between">

            <span className="text-sm font-medium text-zinc-700">
              Course Progress
            </span>

            <span className="text-sm font-semibold text-emerald-700">
              {completedCount} / {localTopics.length}
            </span>

          </div>

          {/* Progress bar starts here */}
          
          <div className="h-3 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>{progress}% Complete</span>

            <span>
              {completedCount} of {localTopics.length} topics finished
            </span>
          </div>
        </div>

        {courseCompleted && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-emerald-600" />

              <div>
                <h3 className="font-semibold text-emerald-800">
                  🎉 Course Completed!
                </h3>

                <p className="mt-1 text-sm text-emerald-700">
                  Amazing work! You've completed every topic in this course.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="divide-y divide-zinc-100">

        {localTopics.map((topic) => (

          <button
            key={topic.id}
            onClick={() => toggleTopic(topic.id)}
            disabled={savingTopicId === topic.id}
            className="flex w-full items-center gap-3 px-6 py-4 text-left transition-all duration-200 hover:bg-emerald-50 disabled:opacity-70"
          >
            {topic.completed ? (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600 transition-transform duration-200" />
            ) : (
              <Circle className="h-6 w-6 shrink-0 text-zinc-400 transition-transform duration-200" />
            )}

            <div className="flex-1">
              <p
                className={`font-medium transition-all ${
                  topic.completed
                    ? "text-emerald-700 line-through"
                    : "text-zinc-800"
                }`}
              >
                {topic.title}
              </p>

              {/* <p className="mt-1 text-xs text-zinc-500">
                Priority:{" "}
                <span className="capitalize">
                  {topic.priority}
                </span>
              </p> */}
            </div>

            {savingTopicId === topic.id && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            )}
          </button>

        ))}

        {localTopics.length === 0 && (
          <div className="p-8 text-center text-sm text-zinc-500">
            No syllabus topics found.
          </div>
        )}
      </div>
    </Card>
  );
}