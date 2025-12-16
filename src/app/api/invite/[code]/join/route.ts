import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  findRoomByInviteCode,
  countRoomMembers,
  findRoomMember,
  insertRoomMember,
  upsertUser,
} from "@/lib/db/supabase";
import { errorResponse, successResponse } from "@/lib/api/helpers";

// POST /api/invite/[code]/join - Join a room via invite code
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await context.params;

    console.log(`👤 User attempting to join room with code: ${code}`);

    // Get user session from NextAuth
    const session = await auth();
    if (!session?.user?.id) {
      console.log(`❌ No authentication session found`);
      return errorResponse(
        "Authentication required. Please sign in first.",
        401,
      );
    }

    const userId = session.user.id;

    console.log(`✅ Authenticated user: ${session.user.name} (${userId})`);

    // Upsert user to ensure they exist in database
    await upsertUser({
      id: userId,
      email: session.user.email!,
      name: session.user.name || "Anonymous",
      avatarUrl: session.user.image || null,
    });

    // Find room by invite code
    const room = await findRoomByInviteCode(code);

    if (!room) {
      console.log(`❌ Invalid invite code: ${code}`);
      return errorResponse("Invalid invite code", 404);
    }

    console.log(`🏠 Found room: ${room.name}`);

    // Check room capacity
    const memberCount = await countRoomMembers(room.id);
    if (memberCount >= room.maxMembers) {
      console.log(
        `❌ Room is full: ${room.name} (${memberCount}/${room.maxMembers})`,
      );
      return errorResponse("This room is full", 403);
    }

    console.log(`👥 Room has ${memberCount}/${room.maxMembers} members`);

    // Check if user is already a member
    const existingMember = await findRoomMember(room.id, userId);
    if (!existingMember) {
      // Add user to room
      await insertRoomMember({
        roomId: room.id,
        userId,
      });
      console.log(`✅ Added user to room: ${room.name}`);
    } else {
      console.log(`ℹ️ User already in room: ${room.name}`);
    }

    const responseData = {
      roomId: room.id,
      roomName: room.name || "Secret Room",
      userId,
    };

    return successResponse(responseData);
  } catch (error) {
    console.error("❌ Failed to join room:", error);
    return errorResponse("Failed to join room", 500);
  }
}
