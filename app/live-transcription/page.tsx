"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  RiMicLine,
  RiMicOffLine,
  RiRecordCircleLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiSave2Line,
  RiCheckLine,
  RiRestartLine,
  RiSparkling2Line,
} from "@remixicon/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export default function LiveTranscriptionPage() {
  const router = useRouter()

  const [isRecording, setIsRecording] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isStopped, setIsStopped] = useState(false)
  const [chunkCount, setChunkCount] = useState(0)

  const [meetingTitle, setMeetingTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedMeetingId, setSavedMeetingId] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sessionIdRef = useRef<string>("")

  const cleanup = () => {
    setIsRecording(false)
    setIsConnecting(false)
    setIsTranscribing(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
    wsRef.current = null
  }

  const startRecording = async () => {
    setError(null)
    setTranscript("")
    setIsStopped(false)
    setSavedMeetingId(null)
    setChunkCount(0)
    setIsConnecting(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm"

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 24000,
      })
      mediaRecorderRef.current = recorder

      sessionIdRef.current = crypto.randomUUID()
      const wsUrl = `${API_URL.replace("http", "ws")}/ws/transcribe/${sessionIdRef.current}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnecting(false)
        setIsRecording(true)
        recorder.start(6000)
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.text) {
            setTranscript((prev) => prev + msg.text)
            setChunkCount((c) => c + 1)
            setIsTranscribing(false)
          }
          if (msg.error) {
            setError(msg.error)
            setIsTranscribing(false)
          }
        } catch {
        }
      }

      ws.onerror = () => {
        setError("WebSocket connection failed. Is the FastAPI server running?")
        cleanup()
      }

      ws.onclose = () => {
        setIsRecording(false)
        setIsConnecting(false)
      }

      recorder.ondataavailable = (e) => {
        if (
          e.data.size > 0 &&
          wsRef.current &&
          wsRef.current.readyState === WebSocket.OPEN
        ) {
          wsRef.current.send(e.data)
          setIsTranscribing(true)
        }
      }
    } catch {
      setError(
        "Microphone access denied. Please allow microphone permissions and try again."
      )
      setIsConnecting(false)
    }
  }

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop()
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "stop" }))
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close()
        }
        cleanup()
        setIsStopped(true)
      }, 3000)
    } else {
      cleanup()
      setIsStopped(true)
    }

    setMeetingTitle(
      `Live — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
    )
  }

  const saveMeeting = async () => {
    if (!transcript.trim() || !meetingTitle.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: meetingTitle.trim(),
          transcript,
          source: "LIVE",
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save meeting")
      }
      const data = await res.json()
      setSavedMeetingId(data.meeting.id)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save meeting"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Live Transcription
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time speech to text via WebSocket. Speak and see your words
              appear.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isStopped ? (
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={
                  isRecording
                    ? stopRecording
                    : isConnecting
                      ? undefined
                      : startRecording
                }
                disabled={isConnecting}
                className="flex items-center gap-2 rounded-full px-8 shadow-lg shadow-primary/20 transition-all duration-300"
              >
                {isConnecting ? (
                  <>
                    <RiLoader4Line className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : isRecording ? (
                  <>
                    <RiMicOffLine className="h-5 w-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <RiMicLine className="h-5 w-5" />
                    Start Recording
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setIsStopped(false)
                  setTranscript("")
                  setSavedMeetingId(null)
                  setMeetingTitle("")
                  setError(null)
                  setChunkCount(0)
                }}
                className="flex items-center gap-2 rounded-full px-6"
              >
                <RiRestartLine className="h-5 w-5" />
                Record Again
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
            <CardContent className="p-4 flex items-center gap-3">
              <RiErrorWarningLine className="h-5 w-5 text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm min-h-[400px] flex flex-col">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                {isTranscribing ? (
                  <RiSparkling2Line className="h-5 w-5 text-primary animate-pulse" />
                ) : (
                  <RiRecordCircleLine className="h-5 w-5 text-primary" />
                )}
                Transcript
              </CardTitle>
              <div className="flex items-center gap-3">
                {isRecording && isTranscribing && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-[11px]"
                  >
                    <RiLoader4Line className="h-3 w-3 animate-spin" />
                    Transcribing...
                  </Badge>
                )}
                {isRecording && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 border-red-200 text-red-500"
                  >
                    <RiRecordCircleLine className="h-3.5 w-3.5" />
                    Live
                  </Badge>
                )}
                {chunkCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {chunkCount} segment{chunkCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-6 overflow-y-auto">
            {transcript ? (
              <p className="text-lg leading-loose text-foreground whitespace-pre-wrap font-medium">
                {transcript}
                {isTranscribing && (
                  <span className="inline-block w-2 h-5 ml-1 bg-primary animate-pulse align-bottom" />
                )}
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full">
                  <RiMicLine className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-sm">
                  {isConnecting
                    ? "Connecting to transcription service..."
                    : isRecording
                      ? "Listening... transcription will appear every few seconds."
                      : 'Click "Start Recording" to begin.'}
                </p>
                {isRecording && (
                  <p className="text-xs text-muted-foreground/60">
                    First results typically appear after 5-10 seconds of
                    speech
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isStopped && transcript && (
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Save Meeting</CardTitle>
              <CardDescription>
                Give your transcript a title and save it to your history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedMeetingId ? (
                <div className="flex items-center gap-4">
                  <RiCheckLine className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    Meeting saved successfully!
                  </span>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/history/${savedMeetingId}`)}
                  >
                    View Details
                  </Button>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label
                      htmlFor="live-meeting-title"
                      className="text-[11px] text-gray-400 mb-1 block"
                    >
                      Meeting title
                    </Label>
                    <Input
                      id="live-meeting-title"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Enter a title for this meeting..."
                    />
                  </div>
                  <Button
                    onClick={saveMeeting}
                    disabled={saving || !meetingTitle.trim()}
                    className="gap-1.5"
                  >
                    {saving ? (
                      <RiLoader4Line className="h-4 w-4 animate-spin" />
                    ) : (
                      <RiSave2Line className="h-4 w-4" />
                    )}
                    {saving ? "Saving..." : "Save Meeting"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
