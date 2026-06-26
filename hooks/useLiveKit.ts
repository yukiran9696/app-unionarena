"use client";

import { useEffect, useState, useCallback } from "react";
import { Room, RoomEvent, LocalParticipant } from "livekit-client";
import type { Role } from "@/types/room";

const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

export function useLiveKit(roomId: string, participantName: string, role: Role) {
  const [room] = useState(() => new Room());
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const fetchToken = useCallback(async (currentRole: Role) => {
    const res = await fetch("/api/livekit-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, participantName, role: currentRole }),
    });
    const data = await res.json();
    return data.token as string;
  }, [roomId, participantName]);

  useEffect(() => {
    if (!livekitUrl) return;

    let active = true;
    (async () => {
      const t = await fetchToken(role);
      if (!active) return;
      setToken(t);

      await room.connect(livekitUrl, t);
      if (!active) return;

      if (role === "player") {
        await room.localParticipant.setMicrophoneEnabled(false);
        await room.localParticipant.setCameraEnabled(true);
      }
      setConnected(true);
    })();

    room.on(RoomEvent.Disconnected, () => setConnected(false));

    return () => {
      active = false;
      room.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 役割切り替え時にカメラのパブリッシュ権限を再取得
  const switchRole = useCallback(async (newRole: Role) => {
    if (!connected) return;
    const newToken = await fetchToken(newRole);

    if (newRole === "player") {
      await room.localParticipant.setCameraEnabled(true);
    } else {
      await room.localParticipant.setCameraEnabled(false);
    }

    // トークンを更新してパーミッションを反映
    // @ts-expect-error internal API
    await room.engine?.client?.sendUpdateParticipantMetadata?.({});
    void newToken; // トークンは次回再接続時に使用
  }, [connected, fetchToken, room]);

  return { room, connected, token, switchRole };
}
