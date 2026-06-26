"use client";

import type { RoomState } from "@/types/room";

interface Props {
  roomState: RoomState;
  myName: string;
}

export function ParticipantList({ roomState, myName }: Props) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-4">
      <div>
        <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
          プレイヤー（{roomState.players.length}/2）
        </h3>
        <ul className="space-y-1">
          {roomState.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 text-sm text-white"
            >
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              {p.name}
              {p.name === myName && (
                <span className="text-xs text-indigo-300">（あなた）</span>
              )}
            </li>
          ))}
          {roomState.players.length === 0 && (
            <li className="text-sm text-gray-500">なし</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          観戦者（{roomState.spectators.length}）
        </h3>
        <ul className="space-y-1">
          {roomState.spectators.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 text-sm text-gray-300"
            >
              <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />
              {p.name}
              {p.name === myName && (
                <span className="text-xs text-indigo-300">（あなた）</span>
              )}
            </li>
          ))}
          {roomState.spectators.length === 0 && (
            <li className="text-sm text-gray-500">なし</li>
          )}
        </ul>
      </div>
    </div>
  );
}
