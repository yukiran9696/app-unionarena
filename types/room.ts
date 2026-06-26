export type Role = "player" | "spectator";

export interface Participant {
  id: string;
  name: string;
  role: Role;
}

export interface RoomState {
  roomId: string;
  participants: Participant[];
  players: Participant[];
  spectators: Participant[];
}

export interface CoinTossResult {
  firstPlayer: { id: string; name: string };
  secondPlayer: { id: string; name: string };
}

export interface ServerToClientEvents {
  "room:state": (state: RoomState) => void;
  "role:changed": (participant: Participant) => void;
  "room:error": (message: string) => void;
  "cointoss:result": (result: CoinTossResult) => void;
}

export interface ClientToServerEvents {
  "room:join": (data: { roomId: string; name: string; role: Role }) => void;
  "role:request-switch": (data: { targetRole: Role }) => void;
  "cointoss:request": () => void;
}
