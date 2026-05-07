import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function ensureAuth(request: NextRequest) {
  const response = await fetch(
    new URL("/api/auth/get-session", request.url),
    {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  )

  const session = await response.json()

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  return { userId: session.user.id as string, session }
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function verifyMeetingOwnership(
  meetingId: string,
  userId: string
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  })

  if (!meeting) {
    return { error: errorResponse("Meeting not found", 404) }
  }

  if (meeting.userId !== userId) {
    return { error: errorResponse("Forbidden", 403) }
  }

  return { meeting }
}
