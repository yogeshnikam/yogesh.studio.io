const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

export type ReadinessChecks = {
  ready: boolean;
  checks: {
    mongodb: boolean;
    redis: boolean;
  };
};

export async function fetchHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error("API health check failed");
  return res.json();
}

export async function fetchReadiness(): Promise<ReadinessChecks> {
  const res = await fetch(`${API_BASE}/health/ready`, { cache: "no-store" });
  if (!res.ok) throw new Error("API readiness check failed");
  return res.json();
}

export async function createRoom(name: string, hostIdentity: string) {
  const res = await fetch(`${API_BASE}/api/v1/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, host_identity: hostIdentity }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create room");
  }
  return res.json() as Promise<{
    id: string;
    name: string;
    host_identity: string;
    status: string;
  }>;
}
