import { NextRequest } from "next/server";
import { findRoomByInviteCode, countRoomMembers } from "@/lib/db/supabase";
import { errorResponse, successResponse } from "@/lib/api/helpers";

// GET /api/invite/[code] - Get room info by invite code
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params;

    // Find room by invite code in Supabase
    const room = await findRoomByInviteCode(code);

    if (!room) {
      return errorResponse("Invalid invite code", 404);
    }

    // Get member count from Supabase
    const memberCount = await countRoomMembers(room.id);

    return successResponse({
      roomId: room.id,
      roomName: room.name || "Secret Room",
      memberCount,
      maxMembers: room.maxMembers,
      isFull: memberCount >= room.maxMembers,
    });
  } catch {
    return errorResponse("Failed to get invite info", 500);
  }
}
