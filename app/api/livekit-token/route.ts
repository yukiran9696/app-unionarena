import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  const { roomId, participantName, role } = await req.json();

  if (!roomId || !participantName) {
    return NextResponse.json({ error: "roomId and participantName are required" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: "LiveKit credentials not configured" }, { status: 500 });
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: "2h",
  });

  // プレイヤーはカメラ送信可、観戦者は視聴のみ
  token.addGrant({
    roomJoin: true,
    room: roomId,
    canPublish: role === "player",
    canSubscribe: true,
    canPublishData: true,
  });

  const jwt = await token.toJwt();
  return NextResponse.json({ token: jwt });
}
