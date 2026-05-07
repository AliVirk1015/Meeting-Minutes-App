import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ensureAuth } from "@/lib/api-helpers"

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
const MAX_CONTEXT_CHARS = 8000

export async function POST(request: NextRequest) {
  const authResult = await ensureAuth(request)
  if (authResult instanceof NextResponse) return authResult

  let query: string
  try {
    const body = await request.json()
    query = body.query
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    )
  }

  const searchTerm = query.trim()

  const meetings = await prisma.meeting.findMany({
    where: {
      userId: authResult.userId,
      OR: [
        { title: { contains: searchTerm, mode: "insensitive" } },
        {
          transcript: {
            content: { contains: searchTerm, mode: "insensitive" },
          },
        },
        {
          summary: {
            content: { contains: searchTerm, mode: "insensitive" },
          },
        },
      ],
    },
    include: {
      transcript: { select: { content: true, source: true } },
      summary: { select: { content: true } },
      actionItems: {
        select: { id: true, text: true, assignee: true, completed: true },
      },
    },
    orderBy: { date: "desc" },
    take: 10,
  })

  const contextDocs: string[] = []
  let totalChars = 0
  for (const m of meetings) {
    const doc = [
      `Meeting: ${m.title} (${new Date(m.date).toLocaleDateString()})`,
      m.transcript?.content ? `Transcript: ${m.transcript.content.slice(0, 600)}` : "",
      m.summary?.content ? `Summary: ${m.summary.content.slice(0, 600)}` : "",
    ]
      .filter(Boolean)
      .join("\n")
    if (totalChars + doc.length <= MAX_CONTEXT_CHARS) {
      contextDocs.push(doc)
      totalChars += doc.length
    } else {
      break
    }
  }

  let answer: string | null = null
  let relevantExcerpts: string[] = []

  if (contextDocs.length > 0) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 25000)

      const res = await fetch(`${FASTAPI_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm, context: contextDocs }),
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (res.ok) {
        const data = await res.json()
        answer = data.answer || null
        relevantExcerpts = data.relevantExcerpts || []
      }
    } catch (err) {
      console.error("[search] FastAPI call failed:", err)
    }
  }

  return NextResponse.json({
    results: meetings.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date,
      duration: m.duration,
      transcript: m.transcript
        ? {
            content: m.transcript.content.slice(0, 300),
            source: m.transcript.source,
          }
        : null,
      summary: m.summary ? { content: m.summary.content } : null,
      actionItems: m.actionItems,
    })),
    answer,
    relevantExcerpts,
  })
}
