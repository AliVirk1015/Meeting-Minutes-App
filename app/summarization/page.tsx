"use client"

import React, { useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  RiMagicLine,
  RiFileList3Line,
  RiErrorWarningLine,
  RiCheckDoubleLine,
  RiLightbulbLine,
  RiClipboardLine,
} from "@remixicon/react"

const FASTAPI_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function SummarizationPage() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [transcript, setTranscript] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [keyPoints, setKeyPoints] = useState<string[] | null>(null)
  const [decisions, setDecisions] = useState<string[] | null>(null)

  const handleGenerate = async () => {
    if (!transcript.trim()) return
    setIsGenerating(true)
    setError(null)
    setSummary(null)
    setKeyPoints(null)
    setDecisions(null)

    try {
      const res = await fetch(`${FASTAPI_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcript.trim() }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }))
        throw new Error(err.detail || `API returned ${res.status}`)
      }

      const data = await res.json()
      setSummary(data.summary || "No summary generated.")
      setKeyPoints(data.keyPoints || [])
      setDecisions(data.decisions || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate summary"
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setTranscript(text)
        setSummary(null)
        setKeyPoints(null)
        setDecisions(null)
        setError(null)
      }
    } catch {
      // clipboard read denied
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Meeting Summarization
          </h1>
          <p className="text-muted-foreground mt-2">
            Paste your raw transcript below and let AI extract the key points.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiFileList3Line className="h-5 w-5 text-primary" />
                Input Transcript
              </CardTitle>
              <CardDescription>
                Paste your meeting text here to generate a summary.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <textarea
                ref={textareaRef}
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value)
                  setSummary(null)
                  setKeyPoints(null)
                  setDecisions(null)
                  setError(null)
                }}
                className="w-full h-full min-h-[300px] p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all text-sm"
                placeholder="Speaker 1: Hi everyone, let's start the meeting...&#10;Speaker 2: Yes, the first item on the agenda is..."
              />
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePasteFromClipboard}
                className="gap-1.5"
              >
                <RiClipboardLine className="h-3.5 w-3.5" />
                Paste
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || transcript.trim().length < 10}
                className="flex-1"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <RiMagicLine className="h-4 w-4 animate-pulse" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RiMagicLine className="h-4 w-4" />
                    Generate Summary
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiMagicLine className="h-5 w-5 text-primary" />
                AI Summary
              </CardTitle>
              <CardDescription>
                Your structured summary will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {error ? (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-start gap-3">
                  <RiErrorWarningLine className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              ) : summary ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                      Summary
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {summary}
                    </p>
                  </div>

                  {keyPoints && keyPoints.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <RiLightbulbLine className="h-3.5 w-3.5" />
                        Key Points
                      </p>
                      <ul className="space-y-1.5">
                        {keyPoints.map((point, i) => (
                          <li
                            key={i}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className="text-amber-500 mt-0.5">&bull;</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {decisions && decisions.length > 0 && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <RiCheckDoubleLine className="h-3.5 w-3.5" />
                        Decisions Made
                      </p>
                      <ul className="space-y-1.5">
                        {decisions.map((decision, i) => (
                          <li
                            key={i}
                            className="text-sm flex items-start gap-2"
                          >
                            <RiCheckDoubleLine className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                            {decision}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[300px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-muted-foreground p-6 text-center">
                  <div>
                    <RiMagicLine className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">
                      {isGenerating
                        ? "Generating summary..."
                        : "Click generate to view the AI-powered summary"}
                    </p>
                    {isGenerating && (
                      <p className="text-xs mt-1 text-muted-foreground/60">
                        This may take 5-15 seconds
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {summary && (
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RiLightbulbLine className="h-4 w-4 text-amber-500" />
                Want to save this summary?
              </CardTitle>
              <CardDescription>
                Head to{" "}
                <a
                  href="/transcribe"
                  className="text-primary underline underline-offset-2"
                >
                  Transcribe
                </a>{" "}
                to record a meeting and save it with the summary automatically.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </main>
  )
}
