import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ensureAuth, errorResponse } from "@/lib/api-helpers"

const MEETINGS_PER_PAGE = 20

export async function GET(request: NextRequest) {
  const authResult = await ensureAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") || String(MEETINGS_PER_PAGE), 10))
  )
  const search = searchParams.get("search")?.trim()
  const skip = (page - 1) * limit

  const where = {
    userId,
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { transcript: { content: { contains: search, mode: "insensitive" as const } } },
            { summary: { content: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  }

  const [meetings, total] = await Promise.all([
    prisma.meeting.findMany({
      where,
      include: {
        transcript: { select: { content: true, source: true } },
        summary: { select: { content: true } },
        actionItems: {
          select: { id: true, text: true, assignee: true, completed: true },
          orderBy: { createdAt: "asc" },
        },
        audioFile: {
          select: { fileName: true, fileSize: true, mimeType: true, duration: true },
        },
      },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.meeting.count({ where }),
  ])

  return NextResponse.json({
    meetings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export async function POST(request: NextRequest) {
  const authResult = await ensureAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { userId } = authResult

  let body: {
    title: string
    transcript: string
    source: "UPLOAD" | "RECORDING" | "LIVE"
    duration?: number
    participants?: number
    audioFile?: {
      filePath: string
      fileName: string
      fileSize: number
      mimeType: string
      duration?: number
    }
  }

  try {
    body = await request.json()
  } catch {
    return errorResponse("Invalid JSON body", 400)
  }

  const { title, transcript, source, duration, participants, audioFile } = body

  if (!title?.trim()) return errorResponse("Title is required", 400)
  if (!transcript?.trim()) return errorResponse("Transcript content is required", 400)

  const validSources = ["UPLOAD", "RECORDING", "LIVE"] as const
  if (!validSources.includes(source as (typeof validSources)[number])) {
    return errorResponse("Source must be UPLOAD, RECORDING, or LIVE", 400)
  }

  const result = await prisma.$transaction(async (tx) => {
    const meeting = await tx.meeting.create({
      data: {
        userId,
        title: title.trim(),
        duration,
        participants: participants ?? 0,
        transcript: {
          create: {
            content: transcript,
            source: source as "UPLOAD" | "RECORDING" | "LIVE",
          },
        },
      },
      include: {
        transcript: true,
        summary: true,
        actionItems: true,
        audioFile: true,
      },
    })

    if (audioFile) {
      await tx.audioFile.create({
        data: {
          meetingId: meeting.id,
          filePath: audioFile.filePath,
          fileName: audioFile.fileName,
          fileSize: audioFile.fileSize,
          mimeType: audioFile.mimeType,
          duration: audioFile.duration,
        },
      })
    }

    const withAudio = await tx.meeting.findUnique({
      where: { id: meeting.id },
      include: {
        transcript: true,
        summary: true,
        actionItems: true,
        audioFile: true,
      },
    })

    return withAudio!
  })

  return NextResponse.json({ meeting: result }, { status: 201 })
}
