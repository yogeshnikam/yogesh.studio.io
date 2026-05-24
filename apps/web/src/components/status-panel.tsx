"use client";

import { useCallback, useEffect, useState } from "react";

import { createRoom, fetchHealth, fetchReadiness } from "@/lib/api";

type Health = { status: string; service: string } | null;

export function StatusPanel() {
  const [health, setHealth] = useState<Health>(null);
  const [ready, setReady] = useState<boolean | null>(null);
  const [mongo, setMongo] = useState<boolean | null>(null);
  const [redis, setRedis] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("studio-demo");
  const [lastRoomId, setLastRoomId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const h = await fetchHealth();
      setHealth(h);
      const r = await fetchReadiness();
      setReady(r.ready);
      setMongo(r.checks.mongodb);
      setRedis(r.checks.redis);
    } catch (e) {
      setHealth(null);
      setReady(null);
      setMongo(null);
      setRedis(null);
      setError(e instanceof Error ? e.message : "Could not reach API");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreateRoom() {
    setBusy(true);
    setError(null);
    try {
      const room = await createRoom(roomName, "web-host");
      setLastRoomId(room.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create room failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full max-w-xl space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Platform status
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Phase 2 — API, MongoDB, Redis, LiveKit (local Docker)
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <StatusRow label="API" value={health?.status ?? "offline"} ok={!!health} />
        <StatusRow label="MongoDB" value={mongo === null ? "—" : mongo ? "up" : "down"} ok={!!mongo} />
        <StatusRow label="Redis" value={redis === null ? "—" : redis ? "up" : "down"} ok={!!redis} />
        <StatusRow label="Ready" value={ready === null ? "—" : ready ? "yes" : "no"} ok={!!ready} />
      </dl>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Room name
        </label>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || !ready}
          onClick={() => void handleCreateRoom()}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create room"}
        </button>
        {lastRoomId && (
          <p className="text-xs text-zinc-500">
            Last room ID: <code className="text-violet-600">{lastRoomId}</code>
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => void refresh()}
        className="text-sm text-violet-600 hover:underline"
      >
        Refresh status
      </button>
    </section>
  );
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <>
      <dt className="text-zinc-500">{label}</dt>
      <dd className={ok ? "font-medium text-emerald-600" : "font-medium text-zinc-400"}>
        {value}
      </dd>
    </>
  );
}
