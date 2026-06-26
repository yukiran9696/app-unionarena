"use client";

import { useState, useEffect } from "react";
import type { CoinTossResult, RoomState } from "@/types/room";

interface Props {
  roomState: RoomState;
  socketId: string | null;
  coinTossResult: CoinTossResult | null;
  onToss: () => void;
}

export function CoinToss({ roomState, socketId, coinTossResult, onToss }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  // アニメーション中に結果を隠し、終了後に表示する
  const [showResult, setShowResult] = useState(false);

  const canToss = roomState.players.length === 2 && !isAnimating;

  // コイントス結果が届いたらアニメーション開始
  useEffect(() => {
    if (!coinTossResult) return;
    setIsAnimating(true);
    setShowResult(false);
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setShowResult(true);
    }, 2200);
    return () => clearTimeout(timer);
  }, [coinTossResult]);

  // 自分の結果を判定
  const myResult = (() => {
    if (!coinTossResult || !socketId) return null;
    if (coinTossResult.firstPlayer.id === socketId) return "先行" as const;
    if (coinTossResult.secondPlayer.id === socketId) return "後行" as const;
    return "spectator" as const;
  })();

  const handleToss = () => {
    if (!canToss) return;
    onToss();
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-3">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        コイントス
      </span>

      {/* アニメーション中 */}
      {isAnimating && (
        <div className="flex flex-col items-center gap-3 py-2">
          <div
            className="coin-spin w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", perspective: 600 }}
          >
            🪙
          </div>
          <p className="text-xs text-gray-400 animate-pulse">決定中…</p>
        </div>
      )}

      {/* 結果表示 */}
      {showResult && coinTossResult && (
        <div className="space-y-2">
          {/* 自分の結果（プレイヤーのみ） */}
          {myResult && myResult !== "spectator" && (
            <div
              className={`result-pop text-center py-3 rounded-xl font-extrabold text-2xl tracking-widest ${
                myResult === "先行"
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500"
                  : "bg-gray-700/50 text-gray-300 border border-gray-600"
              }`}
            >
              {myResult}
            </div>
          )}

          {/* 全員向けの結果 */}
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                先行
              </span>
              <span className="text-white truncate">
                {coinTossResult.firstPlayer.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-600 text-gray-300">
                後行
              </span>
              <span className="text-gray-300 truncate">
                {coinTossResult.secondPlayer.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* トスボタン */}
      <button
        onClick={handleToss}
        disabled={!canToss}
        className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-amber-700/60 hover:bg-amber-600/60 text-amber-200 border border-amber-700 hover:border-amber-500 flex items-center justify-center gap-2"
      >
        <span>🪙</span>
        {isAnimating
          ? "決定中…"
          : showResult
          ? "もう一度トス"
          : roomState.players.length < 2
          ? "プレイヤーが2人必要"
          : "コイントス"}
      </button>
    </div>
  );
}
