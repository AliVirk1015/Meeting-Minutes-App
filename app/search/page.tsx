"use client"

import React, { useState } from "react"
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
import {
  RiSearch2Line,
  RiSparklingLine,
  RiCalendarEventLine,
  RiTimeLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiDoubleQuotesL,
  RiFileList3Line,
} from "@remixicon/react"

interface SearchResult {
  id: string
  title: string
  date: string
  duration: number | null
  transcript: { content: string; source: string } | null
  summary: { content: string } | null
  actionItems: { id: string; text: string; assignee: string | null; completed: boolean }[]
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDuration(s: number | null) {
  if (!s || s < 1) return null
  const mins = Math.floor(s / 60)
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`
}

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [excerpts, setExcerpts] = useState<string[]>([])
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)
    setAnswer(null)
    setExcerpts([])
    setResults([])

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Session expired. Please sign in again.")
        }
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Search failed (${res.status})`)
      }

      const data = await res.json()
      setResults(data.results || [])
      setAnswer(data.answer || null)
      setExcerpts(data.relevantExcerpts || [])
      setHasSearched(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <RiSparklingLine className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Semantic Search
          </h1>
          <p className="text-muted-foreground text-lg">
            Ask questions about your meeting history. Our AI will find the
            answers.
          </p>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-md overflow-hidden">
          <CardContent className="p-2">
            <form onSubmit={handleSearch} className="flex items-center">
              <RiSearch2Line className="h-6 w-6 text-muted-foreground ml-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What did we decide about the Q3 timeline?"
                className="w-full bg-transparent border-none px-4 py-4 focus:outline-none focus:ring-0 text-lg"
              />
              <Button
                type="submit"
                size="lg"
                disabled={isSearching || !query.trim()}
                className="rounded-lg mr-1 px-8"
              >
                {isSearching ? (
                  <RiLoader4Line className="h-5 w-5 animate-spin mr-1.5" />
                ) : (
                  <RiSearch2Line className="h-5 w-5 mr-1.5" />
                )}
                {isSearching ? "Searching..." : "Ask"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
            <CardContent className="p-4 flex items-center gap-3">
              <RiErrorWarningLine className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {answer && (
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <RiSparklingLine className="h-5 w-5 text-primary" />
                AI Answer
              </CardTitle>
              <CardDescription>
                Generated from your meeting history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed">{answer}</p>

              {excerpts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-primary/10">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <RiDoubleQuotesL className="h-3 w-3" />
                    Relevant Excerpts
                  </p>
                  {excerpts.map((excerpt, i) => (
                    <p
                      key={i}
                      className="text-sm text-muted-foreground italic pl-3 border-l-2 border-primary/20"
                    >
                      {excerpt}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <RiFileList3Line className="h-5 w-5 text-primary" />
              Matching Meetings ({results.length})
            </h2>
            {results.map((meeting) => (
              <Card
                key={meeting.id}
                className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/history/${meeting.id}`)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-foreground">
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <RiCalendarEventLine className="h-3.5 w-3.5" />
                        {formatDate(meeting.date)}
                      </span>
                      {formatDuration(meeting.duration) && (
                        <span className="flex items-center gap-1">
                          <RiTimeLine className="h-3.5 w-3.5" />
                          {formatDuration(meeting.duration)}
                        </span>
                      )}
                      {meeting.transcript && (
                        <Badge variant="outline" className="text-[10px] h-5">
                          {meeting.transcript.source}
                        </Badge>
                      )}
                      {meeting.summary && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5"
                        >
                          Summarized
                        </Badge>
                      )}
                      {meeting.actionItems.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5"
                        >
                          {meeting.actionItems.length} action
                          {meeting.actionItems.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    {meeting.transcript?.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {meeting.transcript.content}
                      </p>
                    )}
                  </div>
                  <RiArrowRightLine className="h-5 w-5 text-muted-foreground shrink-0 hidden sm:block" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isSearching && !error && !answer && results.length === 0 && (
          <div className="text-center text-muted-foreground py-12 space-y-3">
            {hasSearched ? (
              <>
                <RiSearch2Line className="h-12 w-12 mx-auto opacity-30" />
                <p className="text-sm">No meetings found matching your query</p>
                <p className="text-xs text-muted-foreground/60">
                  Try different keywords or{" "}
                  <a
                    href="/transcribe"
                    className="text-primary underline underline-offset-2"
                  >
                    save a meeting
                  </a>{" "}
                  first.
                </p>
              </>
            ) : (
              <>
                <RiSearch2Line className="h-12 w-12 mx-auto opacity-30" />
                <p className="text-sm">
                  Type a question above to search your meetings
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Try: &ldquo;What was discussed about the budget?&rdquo; or
                  &ldquo;Who is assigned to the API integration?&rdquo;
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
