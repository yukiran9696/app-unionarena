"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import type { Role } from "@/types/room";

export function RoomEntry() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [role, setRole] = useState<Role>("player");
  const [mode, setMode] = useState<"create" | "join">("create");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const targetRoomId = mode === "create" ? uuidv4().slice(0, 8).toUpperCase() : roomId.trim();
    if (!targetRoomId) return;

    router.push(`/room/${targetRoomId}?name=${encodeURIComponent(name)}&role=${role}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* タイトル */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-indigo-400 tracking-tight">
            UNION ARENA
          </h1>
          <p className="mt-2 text-sm text-gray-400">オンライン対戦ルーム</p>
        </div>

        {/* モード切り替え */}
        <div className="flex rounded-xl overflow-hidden border border-gray-800">
          {(["create", "join"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {m === "create" ? "部屋を作る" : "部屋に参加"}
            </button>
          ))}
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">
              ニックネーム
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：たろう"
              maxLength={20}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {mode === "join" && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                ルームID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="例：A1B2C3D4"
                maxLength={8}
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-600 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* 役割選択 */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              参加する役割
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["player", "spectator"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    role === r
                      ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                      : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {r === "player" ? (
                    <span>🎮 プレイヤー<br /><span className="text-xs font-normal opacity-70">カメラ使用</span></span>
                  ) : (
                    <span>👁 観戦者<br /><span className="text-xs font-normal opacity-70">視聴のみ</span></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {mode === "create" ? "部屋を作成して入室" : "入室する"}
          </button>
        </form>
      </div>
    </div>
  );
}
