"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { toggleComplete, deleteTask } from "@/lib/api";

interface TaskItemProps {
  task: Task;
  userId: string;
  onToggle: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onEdit: (task: Task) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

export default function TaskItem({ task, userId, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      const result = await toggleComplete(userId, task.id);
      if (result.success && result.data) {
        onToggle((result.data as { task: Task }).task);
      }
    } catch {
      // silently fail
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    setDeleting(true);
    try {
      const result = await deleteTask(userId, task.id);
      if (result.success) {
        onDelete(task.id);
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
          task.completed
            ? "border-[#6366F1] bg-[#6366F1]"
            : "border-[#D1D5DB] hover:border-[#6366F1]"
        }`}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${
          task.completed
            ? "text-[#9CA3AF] line-through"
            : "text-[#111827]"
        }`}>
          {task.title}
        </p>
        {task.description && (
          <p className={`mt-0.5 text-xs ${
            task.completed ? "text-[#D1D5DB]" : "text-[#6B7280]"
          }`}>
            {task.description}
          </p>
        )}
      </div>

      {/* Date */}
      <div className="hidden items-center gap-1 text-xs text-[#6B7280] sm:flex">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        {formatDate(task.created_at)}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-1">
        <button
          onClick={() => onEdit(task)}
          className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#111827]"
          aria-label="Edit task"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          aria-label="Delete task"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
