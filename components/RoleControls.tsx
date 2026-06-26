"use client";

import type { Role, RoomState } from "@/types/room";

interface Props {
  myRole: Role;
  roomState: RoomState;
  cameraEnabled: boolean;
  onRequestSwitch: (role: Role) => void;
  onToggleCamera: () => void;
  error: string | null;
}

export function RoleControls({
  myRole,
  roomState,
  cameraEnabled,
  onRequestSwitch,
  onToggleCamera,
  error,
}: Props) {
  const canBecomePlayer = roomState.players.length < 2;

  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-3">
      {/* 役割表示 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          あなたの役割
        </span>
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${
            myRole === "player"
              ? "bg-indigo-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          {myRole === "player" ? "プレイヤー" : "観戦者"}
        </span>
      </div>

      {/* カメラON/OFFトグル（プレイヤーのみ） */}
      {myRole === "player" && (
        <button
          onClick={onToggleCamera}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            cameraEnabled
              ? "bg-green-800/60 hover:bg-green-700/60 text-green-300 border border-green-700"
              : "bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700"
          }`}
        >
          {cameraEnabled ? (
            <>
              <CameraOnIcon />
              カメラON
            </>
          ) : (
            <>
              <CameraOffIcon />
              カメラOFF
            </>
          )}
        </button>
      )}

      {/* 役割切り替え */}
      {myRole === "spectator" ? (
        <button
          onClick={() => onRequestSwitch("player")}
          disabled={!canBecomePlayer}
          className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          {canBecomePlayer ? "プレイヤーになる" : "プレイヤーは満員です"}
        </button>
      ) : (
        <button
          onClick={() => onRequestSwitch("spectator")}
          className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-gray-700 hover:bg-gray-600 text-white"
        >
          観戦者に切り替える
        </button>
      )}

      {error && (
        <p className="text-red-400 text-xs text-center">{error}</p>
      )}
    </div>
  );
}

function CameraOnIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    </svg>
  );
}

function CameraOffIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M10.68 6H17a2 2 0 012 2v6.34M15 13.12V14a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h.88M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.89L15 14" />
    </svg>
  );
}
