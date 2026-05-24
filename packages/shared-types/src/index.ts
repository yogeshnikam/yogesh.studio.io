export type RoomStatus = "idle" | "live" | "ended";

export interface Room {
  id: string;
  name: string;
  host_identity: string;
  status: RoomStatus;
  created_at: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ReadinessResponse {
  ready: boolean;
  checks: {
    mongodb: boolean;
    redis: boolean;
  };
}

export interface LiveKitTokenResponse {
  token: string;
  livekit_url: string;
  room_name: string;
}
