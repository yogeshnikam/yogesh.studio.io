import { StatusPanel } from "@/components/status-panel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 px-6 py-16 font-sans dark:from-black dark:to-zinc-950">
      <main className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-widest text-violet-600">
            yogesh.studio.io
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Live streaming dashboard
          </h1>
          <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
            Cross-device streaming platform — Phase 2 scaffold with Next.js, Expo,
            FastAPI, MongoDB, Redis, and LiveKit.
          </p>
        </header>

        <StatusPanel />

        <footer className="text-sm text-zinc-500">
          Start infrastructure:{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
            npm run infra:up
          </code>{" "}
          · API:{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">
            npm run dev:api
          </code>
        </footer>
      </main>
    </div>
  );
}
