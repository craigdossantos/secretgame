import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { findUserByEmail } from "@/lib/db/supabase";

export async function GET() {
  const diagnostics: Record<string, unknown> = {};

  // 1. Test auth session
  try {
    const session = await auth();
    diagnostics.auth = {
      success: true,
      hasSession: !!session,
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
          }
        : null,
    };
  } catch (error) {
    diagnostics.auth = {
      success: false,
      error: String(error),
    };
  }

  // 2. Check DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  diagnostics.envCheck = {
    DATABASE_URL_set: !!dbUrl,
    DATABASE_URL_length: dbUrl?.length ?? 0,
    DATABASE_URL_prefix: dbUrl ? dbUrl.substring(0, 30) + "..." : "NOT SET",
  };

  // 3. Test raw database connection
  try {
    const result = await db.execute(sql`SELECT 1 as ok`);
    diagnostics.dbConnection = {
      success: true,
      result: result[0] ?? "connected",
    };
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    const cause = err.cause as Record<string, unknown> | undefined;
    diagnostics.dbConnection = {
      success: false,
      message: err.message,
      code: err.code,
      severity: err.severity,
      detail: err.detail,
      // The real error is often in .cause
      cause: cause
        ? {
            message: cause.message ?? String(cause),
            code: cause.code,
            name: cause.name,
          }
        : "no cause",
    };
  }

  // 3. Test users table query
  try {
    const user = await findUserByEmail("test@test.com");
    diagnostics.usersTable = {
      success: true,
      found: !!user,
    };
  } catch (error: unknown) {
    const err = error as Record<string, unknown>;
    diagnostics.usersTable = {
      success: false,
      message: err.message,
      code: err.code,
      severity: err.severity,
      detail: err.detail,
    };
  }

  return NextResponse.json(diagnostics);
}
