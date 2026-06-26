"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom, useLocalParticipant } from "@livekit/components-react";
import "@livekit/components-styles";
import { useSocket } from "@/hooks/useSocket";
import { VideoArea } from "@/components/VideoArea";
import { ParticipantList } from "@/components/ParticipantList";
import { RoleControls } from "@/components/RoleControls";
import { CoinToss } from "@/components/CoinToss";
import type { Role, CoinTossResult, RoomState } from "@/types/room";

interface Props {
  roomId: string;
  name: string;
  initialRole: Role;
}

function BattleRoomInner({
  myRole,
  onRoleSwitch,
  roomState,
  error,
  name,
  socketId,
  coinTossResult,
  onCoinToss,
  sidebarOpen,
}: {
  myRole: Role;
  onRoleSwitch: (role: Role) => void;
  roomState: RoomState | null;
  error: string | null;
  name: string;
  socketId: string | null;
  coinTossResult: CoinTossResult | null;
  onCoinToss: () => void;
  sidebarOpen: boolean;
}) {
  const { localParticipant } = useLocalParticipant();
  const [cameraEnabled, setCameraEnabled] = useState(myRole === "player");

  useEffect(() => {
    if (!localParticipant) return;
    if (myRole === "player") {
      localParticipant.setCameraEnabled(cameraEnabled);
    } else {
      localParticipant.setCameraEnabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myRole, localParticipant]);

  const handleToggleCamera = useCallback(async () => {
    if (!localParticipant || myRole !== "player") return;
    const next = !cameraEnabled;
    await localParticipant.setCameraEnabled(next);
    setCameraEnabled(next);
  }, [localParticipant, cameraEnabled, myRole]);

  const handleRoleSwitch = useCallback(
    async (targetRole: Role) => {
      if (!localParticipant) return;
      if (targetRole === "spectator") {
        await localParticipant.setCameraEnabled(false);
        setCameraEnabled(false);
      } else {
        await localParticipant.setCameraEnabled(true);
        setCameraEnabled(true);
      }
      onRoleSwitch(targetRole);
    },
    [localParticipant, onRoleSwitch]
  );

  return (
    <div className="flex flex-1 gap-4 p-4 min-h-0 overflow-hidden">
      {/* 映像エリア — サイドバー開閉に応じて伸縮 */}
      <main className="flex-1 min-h-0 h-full">
        <VideoArea />
      </main>

      {/* サイドバー — sidebarOpen が false のとき非表示 */}
      {sidebarOpen && (
        <aside className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          {roomState && (
            <>
              <RoleControls
                myRole={myRole}
                roomState={roomState}
                cameraEnabled={cameraEnabled}
                onRequestSwitch={handleRoleSwitch}
                onToggleCamera={handleToggleCamera}
                error={error}
              />
              <CoinToss
                roomState={roomState}
                socketId={socketId}
                coinTossResult={coinTossResult}
                onToss={onCoinToss}
              />
              <ParticipantList roomState={roomState} myName={name} />
            </>
          )}
        </aside>
      )}
    </div>
  );
}

export function BattleRoom({ roomId, name, initialRole }: Props) {
  const router = useRouter();
  const [myRole, setMyRole] = useState<Role>(initialRole);
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

  const {
    roomState,
    error,
    connected,
    socketId,
    coinTossResult,
    requestRoleSwitch,
    requestCoinToss,
  } = useSocket({ roomId, name, initialRole });

  const fetchToken = useCallback(
    async (role: Role) => {
      const res = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, participantName: name, role }),
      });
      const data = await res.json();
      return data.token as string;
    },
    [roomId, name]
  );

  useEffect(() => {
    fetchToken(initialRole).then(setLivekitToken);
  }, [fetchToken, initialRole]);

  const handleRoleSwitch = useCallback(
    async (targetRole: Role) => {
      requestRoleSwitch(targetRole);
      setMyRole(targetRole);
      const token = await fetchToken(targetRole);
      setLivekitToken(token);
    },
    [requestRoleSwitch, fetchToken]
  );

  if (!livekitToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">接続中…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      {/* ヘッダー */}
      <header className="border-b border-gray-800 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-indigo-400">UNION ARENA</h1>
          <span className="text-xs text-gray-500 font-mono hidden sm:inline">
            ルーム: {roomId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* 接続状態 */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
            />
            <span className="text-xs text-gray-400 hidden sm:inline">
              {connected ? "接続済み" : "切断"}
            </span>
          </div>

          {/* サイドバートグル */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "パネルを隠す" : "パネルを表示"}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <PanelCloseIcon /> : <PanelOpenIcon />}
          </button>

          {/* 退出 */}
          <button
            onClick={() => router.push("/")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-900/50 hover:bg-red-700 text-red-300 hover:text-white transition-colors border border-red-800 hover:border-red-600"
          >
            退出
          </button>
        </div>
      </header>

      {/* LiveKit コンテキスト */}
      <LiveKitRoom
        token={livekitToken}
        serverUrl={livekitUrl}
        connect={!!livekitUrl}
        video={false}
        audio={false}
        className="flex flex-col flex-1 min-h-0"
      >
        <BattleRoomInner
          myRole={myRole}
          onRoleSwitch={handleRoleSwitch}
          roomState={roomState}
          error={error}
          name={name}
          socketId={socketId}
          coinTossResult={coinTossResult}
          onCoinToss={requestCoinToss}
          sidebarOpen={sidebarOpen}
        />
      </LiveKitRoom>
    </div>
  );
}

function PanelCloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <polyline points="10 9 7 12 10 15" />
    </svg>
  );
}

function PanelOpenIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="15" y1="3" x2="15" y2="21" />
      <polyline points="12 9 15 12 12 15" />
    </svg>
  );
}
