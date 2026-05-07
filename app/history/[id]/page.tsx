"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  RiCalendarEventLine,
  RiTimeLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiEditBoxLine,
  RiDeleteBinLine,
  RiSparkling2Line,
  RiFileList3Line,
  RiCheckboxCircleLine,
  RiCheckboxBlankCircleLine,
} from "@remixicon/react"

interface Meeting {
  id: string
  title: string
  date: string
  duration: number | null
  participants: number
  createdAt: string
  transcript: {
    content: string
    source: "UPLOAD" | "RECORDING" | "LIVE"
  } | null
  summary: {
    content: string
  } | null
  actionItems: {
    id: string
    text: string
    assignee: string | null
    completed: boolean
  }[]
  audioFile: {
    fileName: string
    fileSize: number
    mimeType: string
    duration: number | null
  } | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds < 1) return "—"
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [meetingId, setMeetingId] = useState<string | null>(null)
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDuration, setEditDuration] = useState("")
  const [editParticipants, setEditParticipants] = useState("")
  const [saving, setSaving] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    params.then((p) => setMeetingId(p.id))
  }, [params])

  const fetchMeeting = async () => {
    if (!meetingId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/meetings/${meetingId}`)
      if (!res.ok) {
        throw new Error(
          res.status === 404
            ? "Meeting not found."
            : res.status === 403
              ? "You do not have access to this meeting."
              : `Failed to load meeting (${res.status})`
        )
      }
      const data = await res.json()
      setMeeting(data.meeting)
      setEditTitle(data.meeting.title)
      setEditDuration(
        data.meeting.duration ? String(data.meeting.duration) : ""
      )
      setEditParticipants(
        data.meeting.participants ? String(data.meeting.participants) : ""
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeeting()
  }, [meetingId])

  const handleSave = async () => {
    if (!meetingId) return
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = {}
      if (editTitle.trim()) body.title = editTitle.trim()
      if (editDuration) body.duration = parseInt(editDuration, 10)
      if (editParticipants)
        body.participants = parseInt(editParticipants, 10)

      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save changes")
      }

      const data = await res.json()
      setMeeting(data.meeting)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  const handleSummarize = async () => {
    if (!meetingId) return
    setSummarizing(true)
    setError(null)
    try {
      const res = await fetch(`/api/meetings/${meetingId}/summarize`, {
        method: "POST",
      })
      const body = await res.text().catch(() => "Could not read response")
      if (!res.ok) {
        let msg = body
        try { msg = JSON.parse(body).error || JSON.parse(body).detail || body } catch {}
        throw new Error(`[${res.status}] ${msg}`)
      }
      await fetchMeeting()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summarization failed")
    } finally {
      setSummarizing(false)
    }
  }

  const handleDelete = async () => {
    if (!meetingId) return
    if (!confirm("Are you sure you want to delete this meeting?")) return
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete meeting")
      }
      router.push("/history")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete meeting")
      setDeleting(false)
    }
  }

  const toggleActionItem = async (itemId: string, current: boolean) => {
    if (!meetingId) return
    try {
      const res = await fetch(`/api/action-items/${itemId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      })
      if (!res.ok) return
      await fetchMeeting()
    } catch {
    }
  }

  const sourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      UPLOAD: "Uploaded File",
      RECORDING: "Browser Recording",
      LIVE: "Live Transcription",
    }
    return labels[source] ?? source
  }

  if (!meetingId) return null

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <RiLoader4Line className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading meeting...</p>
        </div>
      </main>
    )
  }

  if (error && !meeting) {
    return (
      <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>
              <RiArrowLeftLine className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-500">
            <RiErrorWarningLine className="h-8 w-8" />
            <p className="text-sm text-center">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchMeeting}>
              Retry
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (!meeting) return null

  return (
    <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/history")}>
              <RiArrowLeftLine className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-bold tracking-tight h-auto py-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <RiLoader4Line className="h-3 w-3 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(false)
                      setEditTitle(meeting.title)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <h1 className="text-2xl font-bold tracking-tight">
                  {meeting.title}
                </h1>
              )}
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <RiCalendarEventLine className="h-3.5 w-3.5" />
                  {formatDate(meeting.date)}
                </span>
                <span className="flex items-center gap-1">
                  <RiTimeLine className="h-3.5 w-3.5" />
                  {formatDuration(meeting.duration)}
                </span>
                {meeting.audioFile && (
                  <Badge variant="outline" className="text-[10px]">
                    {meeting.audioFile.fileName}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <RiEditBoxLine className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <RiDeleteBinLine className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 text-sm flex items-center gap-2">
            <RiErrorWarningLine className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <RiFileList3Line className="h-4 w-4" />
                Transcript
                <Badge variant="outline" className="text-[10px] ml-auto">
                  {meeting.transcript
                    ? sourceLabel(meeting.transcript.source)
                    : "None"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meeting.transcript ? (
                <div className="rounded-lg border bg-background p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {meeting.transcript.content}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No transcript available.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RiSparkling2Line className="h-4 w-4" />
                  Summary
                </div>
                {!meeting.summary && meeting.transcript && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSummarize}
                    disabled={summarizing}
                  >
                    {summarizing ? (
                      <RiLoader4Line className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RiSparkling2Line className="h-3 w-3 mr-1" />
                    )}
                    Generate
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {meeting.summary ? (
                <div className="rounded-lg border bg-background p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {meeting.summary.content}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No summary generated yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Items</CardTitle>
            <CardDescription>
              {meeting.actionItems.length > 0
                ? `${meeting.actionItems.length} item${meeting.actionItems.length !== 1 ? "s" : ""} extracted`
                : "No action items found"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meeting.actionItems.length > 0 ? (
              <div className="space-y-2">
                {meeting.actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <button
                      onClick={() => toggleActionItem(item.id, item.completed)}
                      className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.completed ? (
                        <RiCheckboxCircleLine className="h-4 w-4 text-green-500" />
                      ) : (
                        <RiCheckboxBlankCircleLine className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {item.text}
                      </p>
                      {item.assignee && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Assigned to: {item.assignee}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Action items will appear here after summarization.
              </p>
            )}
          </CardContent>
        </Card>

        {meeting.audioFile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audio File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground text-xs">File</Label>
                  <p className="font-mono text-xs truncate mt-0.5">
                    {meeting.audioFile.fileName}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Size</Label>
                  <p className="mt-0.5">
                    {formatFileSize(meeting.audioFile.fileSize)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Type</Label>
                  <p className="mt-0.5 font-mono text-xs">
                    {meeting.audioFile.mimeType}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">
                    Duration
                  </Label>
                  <p className="mt-0.5">
                    {formatDuration(meeting.audioFile.duration)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {editing && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit Meeting Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="participants">Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    value={editParticipants}
                    onChange={(e) => setEditParticipants(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}