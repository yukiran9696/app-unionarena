import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import type {
  Participant,
  RoomState,
  Role,
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/types/room";

const rooms = new Map<string, Map<string, Participant>>();

function getRoomState(roomId: string): RoomState {
  const participants = Array.from(rooms.get(roomId)?.values() ?? []);
  return {
    roomId,
    participants,
    players: participants.filter((p) => p.role === "player"),
    spectators: participants.filter((p) => p.role === "spectator"),
  };
}

export function initSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(
    httpServer,
    {
      cors: { origin: "*", methods: ["GET", "POST"] },
    }
  );

  io.on("connection", (socket) => {
    let currentRoomId: string | null = null;
    let currentParticipant: Participant | null = null;

    socket.on("room:join", ({ roomId, name, role }) => {
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }

      const roomParticipants = rooms.get(roomId)!;
      const players = Array.from(roomParticipants.values()).filter(
        (p) => p.role === "player"
      );

      // プレイヤーは最大2人
      const assignedRole: Role =
        role === "player" && players.length >= 2 ? "spectator" : role;

      const participant: Participant = {
        id: socket.id,
        name,
        role: assignedRole,
      };

      roomParticipants.set(socket.id, participant);
      currentRoomId = roomId;
      currentParticipant = participant;

      socket.join(roomId);
      io.to(roomId).emit("room:state", getRoomState(roomId));
    });

    socket.on("role:request-switch", ({ targetRole }) => {
      if (!currentRoomId || !currentParticipant) return;

      const roomParticipants = rooms.get(currentRoomId);
      if (!roomParticipants) return;

      if (targetRole === "player") {
        const players = Array.from(roomParticipants.values()).filter(
          (p) => p.role === "player"
        );
        if (players.length >= 2) {
          socket.emit("room:error", "すでにプレイヤーが2人います");
          return;
        }
      }

      currentParticipant.role = targetRole;
      roomParticipants.set(socket.id, currentParticipant);

      io.to(currentRoomId).emit("room:state", getRoomState(currentRoomId));
    });

    socket.on("cointoss:request", () => {
      if (!currentRoomId) return;
      const roomParticipants = rooms.get(currentRoomId);
      if (!roomParticipants) return;

      const players = Array.from(roomParticipants.values()).filter(
        (p) => p.role === "player"
      );
      if (players.length < 2) {
        socket.emit("room:error", "コイントスにはプレイヤーが2人必要です");
        return;
      }

      // ランダムで先行を決定
      const shuffled = Math.random() < 0.5 ? players : [players[1], players[0]];
      io.to(currentRoomId).emit("cointoss:result", {
        firstPlayer: { id: shuffled[0].id, name: shuffled[0].name },
        secondPlayer: { id: shuffled[1].id, name: shuffled[1].name },
      });
    });

    socket.on("disconnect", () => {
      if (!currentRoomId) return;
      const roomParticipants = rooms.get(currentRoomId);
      if (!roomParticipants) return;

      roomParticipants.delete(socket.id);
      if (roomParticipants.size === 0) {
        rooms.delete(currentRoomId);
      } else {
        io.to(currentRoomId).emit("room:state", getRoomState(currentRoomId));
      }
    });
  });

  return io;
}
