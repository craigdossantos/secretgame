import { NextRequest } from "next/server";
import {
  findRoomByInviteCode,
  countRoomMembers,
  findRoomMember,
  insertRoomMember,
} from "@/lib/db/supabase";
import { errorResponse, successResponse } from "@/lib/api/helpers";
import { getSessionUserWithUpsert } from "@/lib/api/auth-helpers";

// POST /api/invite/[code]/join - Join a room via invite code
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params;

    const authResult = await getSessionUserWithUpsert();
    if (!authResult) {
      return errorResponse("Authentication required", 401);
    }
    const { userId } = authResult;

    // Find room by invite code
    const room = await findRoomByInviteCode(code);

    if (!room) {
      return errorResponse("Invalid invite code", 404);
    }

    // Check room capacity
    const memberCount = await countRoomMembers(room.id);
    if (memberCount >= room.maxMembers) {
      return errorResponse("This room is full", 403);
    }

    // Check if user is already a member
    const existingMember = await findRoomMember(room.id, userId);
    if (!existingMember) {
      // Add user to room
      await insertRoomMember({
        roomId: room.id,
        userId,
      });
    }

    const responseData = {
      roomId: room.id,
      roomName: room.name || "Secret Room",
      userId,
    };

    return successResponse(responseData);
  } catch {
    return errorResponse("Failed to join room", 500);
  }
}
