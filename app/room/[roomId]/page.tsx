"use client";

import { useParams, useSearchParams } from "next/navigation";
import { BattleRoom } from "@/components/BattleRoom";
import type { Role } from "@/types/room";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = params.roomId as string;
  const name = searchParams.get("name") ?? "ゲスト";
  const role = (searchParams.get("role") ?? "spectator") as Role;

  return <BattleRoom roomId={roomId} name={name} initialRole={role} />;
}
