"use client";

import { useState } from "react";
import { useTracks, VideoTrack, useParticipants } from "@livekit/components-react";
import { Track } from "livekit-client";

export function VideoArea() {
  const [focusedIdentity, setFocusedIdentity] = useState<string | null>(null);

  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false }).filter(
    (track) => track.participant.isCameraEnabled
  );
  const participants = useParticipants();

  if (tracks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 rounded-xl text-gray-400 text-sm">
        カメラ映像を待っています…
      </div>
    );
  }

  const playerTracks = tracks.slice(0, 2);
  const spectatorCount = Math.max(0, participants.length - playerTracks.length);

  // フォーカス対象が存在しない場合（退出など）はリセット
  const validFocus =
    focusedIdentity &&
    playerTracks.some((t) => t.participant.identity === focusedIdentity)
      ? focusedIdentity
      : null;

  const focusedTrack = validFocus
    ? playerTracks.find((t) => t.participant.identity === validFocus)
    : null;
  const otherTracks = playerTracks.filter(
    (t) => t.participant.identity !== validFocus
  );

  const handleClick = (identity: string) => {
    setFocusedIdentity((prev) => (prev === identity ? null : identity));
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {focusedTrack ? (
        // フォーカスモード: メイン大画面 + サムネイル
        <div className="relative flex-1 min-h-0">
          {/* メイン映像 */}
          <div
            className="relative h-full bg-gray-900 rounded-xl overflow-hidden border-2 border-indigo-500 cursor-pointer"
            onClick={() => handleClick(focusedTrack.participant.identity)}
            title="クリックで通常表示に戻す"
          >
            <VideoTrack trackRef={focusedTrack} className="w-full h-full" />
            <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2">
              {focusedTrack.participant.identity}
              <span className="text-xs text-indigo-300">（フォーカス中）</span>
            </div>
            {/* 閉じるヒント */}
            <div className="absolute top-3 right-3 bg-black/50 text-gray-300 text-xs px-2 py-1 rounded-full">
              クリックで縮小
            </div>
          </div>

          {/* サムネイル（右下に重ねて表示） */}
          {otherTracks.length > 0 && (
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              {otherTracks.map((track) => (
                <div
                  key={track.participant.identity}
                  className="relative w-40 aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-600 hover:border-indigo-400 cursor-pointer shadow-xl transition-colors"
                  onClick={() => handleClick(track.participant.identity)}
                  title="クリックで大きく表示"
                >
                  <VideoTrack trackRef={track} className="w-full h-full" />
                  <div className="absolute bottom-1 left-1.5 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {track.participant.identity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // グリッドモード: 横並び2分割
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0" style={{ gridTemplateRows: "1fr" }}>
          {playerTracks.map((track) => (
            <div
              key={track.participant.identity}
              className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-indigo-600 cursor-pointer hover:border-indigo-400 transition-colors group min-h-0"
              onClick={() => handleClick(track.participant.identity)}
              title="クリックで大きく表示"
            >
              <VideoTrack trackRef={track} className="w-full h-full" />
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                {track.participant.identity}
              </div>
              <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                  クリックで拡大
                </span>
              </div>
            </div>
          ))}
          {playerTracks.length < 2 && (
            <div className="flex items-center justify-center bg-gray-900/60 rounded-xl border-2 border-dashed border-gray-700 text-gray-500 text-sm min-h-0">
              プレイヤー待機中…
            </div>
          )}
        </div>
      )}

      {/* 観戦者数 */}
      {spectatorCount > 0 && (
        <div className="text-xs text-gray-400 text-right flex-shrink-0">
          👁 観戦者 {spectatorCount}人
        </div>
      )}
    </div>
  );
}
