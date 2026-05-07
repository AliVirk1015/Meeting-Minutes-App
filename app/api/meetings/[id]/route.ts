import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ensureAuth, errorResponse, verifyMeetingOwnership } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await ensureAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const ownership = await verifyMeetingOwnership(id, authResult.userId)
  if (ownership.error) return ownership.error

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      transcript: true,
      summary: true,
      actionItems: { orderBy: { createdAt: "asc" } },
      audioFile: true,
    },
  })

  if (!meeting) return errorResponse("Meeting not found", 404)

  return NextResponse.json({ meeting })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await ensureAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const ownership = await verifyMeetingOwnership(id, authResult.userId)
  if (ownership.error) return ownership.error

  let body: {
    title?: string
    duration?: number
    participants?: number
  }

  try {
    body = await request.json()
  } catch {
    return errorResponse("Invalid JSON body", 400)
  }

  const { title, duration, participants } = body
  const updateData: Record<string, unknown> = {}

  if (title !== undefined) {
    if (!title.trim()) return errorResponse("Title cannot be empty", 400)
    updateData.title = title.trim()
  }
  if (duration !== undefined) updateData.duration = duration
  if (participants !== undefined) updateData.participants = participants

  if (Object.keys(updateData).length === 0) {
    return errorResponse("No fields to update", 400)
  }

  const meeting = await prisma.meeting.update({
    where: { id },
    data: updateData,
    include: {
      transcript: true,
      summary: true,
      actionItems: true,
      audioFile: true,
    },
  })

  return NextResponse.json({ meeting })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await ensureAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const ownership = await verifyMeetingOwnership(id, authResult.userId)
  if (ownership.error) return ownership.error

  await prisma.meeting.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
