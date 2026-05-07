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
import {
  RiCalendarEventLine,
  RiTimeLine,
  RiMore2Fill,
  RiSearchLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiFileList3Line,
  RiTaskLine,
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
    month: "short",
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

function sourceLabel(source: "UPLOAD" | "RECORDING" | "LIVE"): string {
  const labels: Record<string, string> = {
    UPLOAD: "Upload",
    RECORDING: "Recording",
    LIVE: "Live",
  }
  return labels[source] ?? source
}

export default function HistoryPage() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [searching, setSearching] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)

  const fetchMeetings = async (currentPage: number, searchQuery?: string) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "20",
      })
      if (searchQuery?.trim()) params.set("search", searchQuery.trim())

      const res = await fetch(`/api/meetings?${params.toString()}`)
      if (!res.ok) {
        throw new Error(
          res.status === 401
            ? "Session expired. Please sign in again."
            : `Failed to load meetings (${res.status})`
        )
      }
      const data = await res.json()
      setMeetings(data.meetings)
      setTotalPages(data.pagination?.totalPages ?? 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings(page, search || undefined)
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setPage(1)
    fetchMeetings(1, search).finally(() => setSearching(false))
  }

  const handleClearSearch = () => {
    setSearch("")
    setPage(1)
    fetchMeetings(1)
  }

  return (
    <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meeting History</h1>
          <p className="text-muted-foreground mt-2">
            Review your past meetings, transcripts, and generated summaries.
          </p>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Recent Meetings</CardTitle>
                <CardDescription>
                  A log of your transcribed sessions.
                </CardDescription>
              </div>
              <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search meetings..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                {search && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="h-9"
                  >
                    Clear
                  </Button>
                )}
              </form>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <RiLoader4Line className="h-6 w-6 animate-spin" />
                <p className="text-sm">Loading meetings...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-500">
                <RiErrorWarningLine className="h-8 w-8" />
                <p className="text-sm text-center">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMeetings(page, search || undefined)}
                >
                  Retry
                </Button>
              </div>
            ) : meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <RiFileList3Line className="h-12 w-12 opacity-40" />
                <p className="text-sm">
                  {search ? "No meetings match your search." : "No meetings yet."}
                </p>
                {!search && (
                  <Button variant="outline" size="sm" asChild>
                    <a href="/transcribe">Transcribe your first meeting</a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <RiCalendarEventLine className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <RiCalendarEventLine className="h-3.5 w-3.5" />
                            {formatDate(meeting.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <RiTimeLine className="h-3.5 w-3.5" />
                            {formatDuration(meeting.duration)}
                          </span>
                          {meeting.transcript && (
                            <Badge variant="outline" className="text-[10px] h-5">
                              {sourceLabel(meeting.transcript.source)}
                            </Badge>
                          )}
                          {meeting.summary && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 gap-1"
                            >
                              <RiFileList3Line className="h-3 w-3" />
                              Summarized
                            </Badge>
                          )}
                          {meeting.actionItems.length > 0 && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-5 gap-1"
                            >
                              <RiTaskLine className="h-3 w-3" />
                              {meeting.actionItems.length} action item
                              {meeting.actionItems.length !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => router.push(`/history/${meeting.id}`)}
                      >
                        View Details
                      </Button>
                      <Button variant="ghost" size="icon" className="hidden sm:flex">
                        <RiMore2Fill className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}