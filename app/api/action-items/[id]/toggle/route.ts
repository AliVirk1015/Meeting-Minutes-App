import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { ensureAuth, errorResponse } from "@/lib/api-helpers"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await ensureAuth(request)
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  let body: { completed?: boolean }
  try {
    body = await request.json()
  } catch {
    return errorResponse("Invalid JSON body", 400)
  }

  if (typeof body.completed !== "boolean") {
    return errorResponse("'completed' field is required and must be a boolean", 400)
  }

  const actionItem = await prisma.actionItem.findUnique({
    where: { id },
    include: { meeting: { select: { userId: true } } },
  })

  if (!actionItem) return errorResponse("Action item not found", 404)

  if (actionItem.meeting.userId !== authResult.userId) {
    return errorResponse("Forbidden", 403)
  }

  const updated = await prisma.actionItem.update({
    where: { id },
    data: { completed: body.completed },
  })

  return NextResponse.json({ actionItem: updated })
}
