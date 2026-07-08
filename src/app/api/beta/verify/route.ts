import { NextResponse } from "next/server";
import { isValidInviteCode } from "@/lib/auth";

export async function POST(request: Request) {
  const { inviteCode } = (await request.json()) as { inviteCode?: string };

  if (!isValidInviteCode(inviteCode)) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
