import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ensureAuth, errorResponse, verifyMeetingOwnership } from "@/lib/api-helpers"

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await ensureAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  const ownership = await verifyMeetingOwnership(id, authResult.userId)
  if (ownership.error) return ownership.error

  const meeting = ownership.meeting
  const transcript = await prisma.transcript.findUnique({
    where: { meetingId: id },
  })

  if (!transcript?.content?.trim()) {
    return errorResponse("No transcript content available to summarize", 400)
  }

  try {
    const res = await fetch(`${FASTAPI_URL}/api/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: transcript.content }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => null)
      return errorResponse(
        errData?.detail || `Summarization service returned ${res.status}`,
        res.status
      )
    }

    const data = await res.json()

    const summaryContent =
      typeof data.summary === "string"
        ? data.summary
        : JSON.stringify(data)

    const summary = await prisma.summary.create({
      data: {
        meetingId: id,
        content: summaryContent,
      },
    })

    return NextResponse.json({
      summary,
      keyPoints: data.keyPoints ?? null,
      decisions: data.decisions ?? null,
    })
  } catch {
    return errorResponse("Failed to connect to summarization service", 503)
  }
}
