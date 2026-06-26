"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  Role,
  RoomState,
  CoinTossResult,
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/types/room";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  roomId: string;
  name: string;
  initialRole: Role;
}

export function useSocket({ roomId, name, initialRole }: UseSocketOptions) {
  const socketRef = useRef<AppSocket | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [coinTossResult, setCoinTossResult] = useState<CoinTossResult | null>(null);

  useEffect(() => {
    const socket: AppSocket = io({ path: "/socket.io" });

    socket.on("connect", () => {
      setConnected(true);
      setSocketId(socket.id ?? null);
      socket.emit("room:join", { roomId, name, role: initialRole });
    });

    socket.on("room:state", (state) => {
      setRoomState(state);
    });

    socket.on("room:error", (msg) => {
      setError(msg);
      setTimeout(() => setError(null), 3000);
    });

    socket.on("cointoss:result", (result) => {
      setCoinTossResult(result);
    });

    socket.on("disconnect", () => setConnected(false));

    socketRef.current = socket;
    return () => { socket.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const requestRoleSwitch = (targetRole: Role) => {
    socketRef.current?.emit("role:request-switch", { targetRole });
  };

  const requestCoinToss = () => {
    socketRef.current?.emit("cointoss:request");
  };

  return { roomState, error, connected, socketId, coinTossResult, requestRoleSwitch, requestCoinToss };
}
