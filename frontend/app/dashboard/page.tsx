"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/types";
import { getTasks } from "@/lib/api";
import Header from "@/components/Header";
import AddTaskForm from "@/components/AddTaskForm";
import TaskList from "@/components/TaskList";
import EditTaskModal from "@/components/EditTaskModal";

type StatusFilter = "all" | "pending" | "completed";
type SortBy = "default" | "title" | "date";
type SortOrder = "asc" | "desc";

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    const storedName = localStorage.getItem("user_name");

    if (!storedUserId) {
      router.push("/signin");
      return;
    }

    setUserId(storedUserId);
    setUserName(storedName);

    async function loadTasks() {
      try {
        const result = await getTasks(storedUserId!);
        if (result.success && result.data) {
          setTasks((result.data as { tasks: Task[] }).tasks);
        } else {
          setError(result.error?.message || "Failed to load tasks");
        }
      } catch {
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [router]);

  // Filtered & sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by status
    if (statusFilter === "pending") result = result.filter((t) => !t.completed);
    if (statusFilter === "completed") result = result.filter((t) => t.completed);

    // Sort
    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "date") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    // Order
    if (sortOrder === "desc") result.reverse();

    return result;
  }, [tasks, statusFilter, sortBy, sortOrder]);

  // Stats
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  function handleTaskCreated(task: Task) {
    setTasks((prev) => [task, ...prev]);
    showToast("Task created!");
  }

  function handleToggle(updatedTask: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    showToast(updatedTask.completed ? "Task completed!" : "Task reopened!");
  }

  function handleDelete(taskId: number) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast("Task deleted!");
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
  }

  function handleSave(updatedTask: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    showToast("Task updated!");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header userName={userName} />
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-[#6B7280]">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading your tasks...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header userName={userName} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111827]">My Tasks</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Manage your daily tasks and boost your productivity
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3">
            <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Left: Task List */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#111827]">Task List</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4F46E5]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Task
              </button>
            </div>

            <TaskList
              tasks={filteredTasks}
              userId={userId}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>

          {/* Right: Filters */}
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-semibold text-[#111827]">Filters</h3>

              {/* Status */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-[#111827]">Status</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="block w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 pr-10 text-sm text-[#111827] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                  >
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {/* Sort By */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-[#111827]">Sort By</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    className="block w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 pr-10 text-sm text-[#111827] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                  >
                    <option value="default">Default</option>
                    <option value="title">Title</option>
                    <option value="date">Date</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {/* Order */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111827]">Order</label>
                <div className="relative">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="block w-full appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 pr-10 text-sm text-[#111827] focus:border-[#6366F1] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Total</span>
                  <span className="text-sm font-semibold text-[#111827]">{totalCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Pending</span>
                  <span className="text-sm font-semibold text-[#6366F1]">{pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Completed</span>
                  <span className="text-sm font-semibold text-green-600">{totalCount - pendingCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskForm
          userId={userId}
          onTaskCreated={handleTaskCreated}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          userId={userId}
          onSave={handleSave}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
