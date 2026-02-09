import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-[#111827]">TaskFlow</span>
            </Link>

            {/* Nav */}
            <nav className="hidden items-center gap-6 sm:flex">
              <a href="#features" className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]">
                Features
              </a>
              <a href="#about" className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]">
                About
              </a>
              <a href="#contact" className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]">
                Contact
              </a>
            </nav>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111827]"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4F46E5]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-20 text-center sm:px-6 sm:py-28">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-[#111827] sm:text-5xl">
          Manage Your Tasks{" "}
          <span className="text-[#6366F1]">with Ease</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6B7280] sm:text-lg">
          Our intelligent task management system helps you stay on top of your work with intuitive features.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-[#6366F1] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F46E5]"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-semibold text-[#111827] shadow-sm transition-colors hover:bg-gray-50"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {/* Task Management */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#EEF2FF]">
              <svg className="h-6 w-6 text-[#6366F1]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#111827]">Task Management</h3>
            <p className="text-sm leading-relaxed text-[#6B7280]">
              Create, update, and manage your tasks with our comprehensive system
            </p>
          </div>

          {/* Time Tracking */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#EEF2FF]">
              <svg className="h-6 w-6 text-[#6366F1]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#111827]">Time Tracking</h3>
            <p className="text-sm leading-relaxed text-[#6B7280]">
              Track time spent on tasks and improve your productivity
            </p>
          </div>

          {/* Secure & Private */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#EEF2FF]">
              <svg className="h-6 w-6 text-[#6366F1]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[#111827]">Secure & Private</h3>
            <p className="text-sm leading-relaxed text-[#6B7280]">
              Your data is protected with industry-standard security
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] bg-white px-4 py-8 text-center">
        <p className="text-sm text-[#6B7280]">
          Todo Evolution &mdash; AI-powered task management
        </p>
      </footer>
    </div>
  );
}
