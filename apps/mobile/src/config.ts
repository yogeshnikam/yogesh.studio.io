import Constants from "expo-constants";

type Extra = {
  apiUrl?: string;
  livekitUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const config = {
  apiUrl: extra.apiUrl ?? "http://localhost:8000",
  livekitUrl: extra.livekitUrl ?? "ws://localhost:7880",
};
