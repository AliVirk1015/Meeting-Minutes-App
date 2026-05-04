"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  RiBrain2Line,
  RiMic2Line,
  RiSparkling2Line,
  RiStopCircleLine,
  RiUpload2Line,
  RiFileCopyLine,
  RiCheckLine,
} from "@remixicon/react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const MAX_FILE_SIZE = 5 * 1024 * 1024

const Transcribe = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((d) => setApiConnected(d.status === "ok"))
      .catch(() => setApiConnected(false))
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("audio/")) {
      setUploadedFile(file)
      setTranscription(null)
      setError(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setTranscription(null)
      setError(null)
    }
  }

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setUploadedFile(null)
  }

  const transcribeFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 5 MB.`
      )
      return
    }

    setIsTranscribing(true)
    setError(null)
    setTranscription(null)

    try {
      const formData = new FormData()
      formData.append("audio", file)

      const res = await fetch(`${API_URL}/api/transcribe`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || "Transcription failed")
      }

      setTranscription(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsTranscribing(false)
    }
  }

  const startRecording = async () => {
    setError(null)
    setTranscription(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setRecordedBlob(blob)
        setPreviewUrl(url)
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch {
      setError(
        "Microphone access denied. Please allow microphone permissions and try again."
      )
    }
  }

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  const discardRecording = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setRecordedBlob(null)
    setPreviewUrl(null)
  }

  const transcribeRecording = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], "recording.webm", {
        type: "audio/webm",
      })
      transcribeFile(file)
    }
  }

  const formatSize = (bytes: number) =>
    bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

  const copyToClipboard = () => {
    if (transcription) {
      navigator.clipboard.writeText(transcription)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const renderBadge = () => {
    if (apiConnected === null) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 text-[11px] font-normal text-gray-400"
        >
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gray-300" />
          Checking...
        </Badge>
      )
    }
    if (apiConnected) {
      return (
        <Badge
          variant="outline"
          className="gap-1.5 border-green-200 text-[11px] font-normal text-green-600"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
          API connected
        </Badge>
      )
    }
    return (
      <Badge
        variant="outline"
        className="gap-1.5 text-[11px] font-normal text-gray-400"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-300" />
        No API connected
      </Badge>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
      <div className="flex w-full items-center justify-between border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-2.5">
          <RiBrain2Line className="text-xl text-primary" />
          <span className="text-sm font-medium text-gray-700">Transcribe</span>
        </div>
        {renderBadge()}
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-stretch lg:flex-row">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-16">
            <div className="mb-2 text-center">
              <p className="mb-2 text-[11px] tracking-[0.18em] text-gray-400 uppercase">
                Audio file
              </p>
              <h2 className="font-serif text-2xl font-normal text-gray-900 md:text-3xl">
                Upload & transcribe
              </h2>
            </div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex w-full max-w-md cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed px-8 py-12 transition-all duration-200 ${
                isDragging
                  ? "scale-[1.01] border-primary bg-primary/5"
                  : uploadedFile
                    ? "border-primary/40 bg-primary/3"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              } `}
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {uploadedFile ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <RiUpload2Line className="text-2xl text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="max-w-[220px] truncate text-sm font-medium text-gray-800">
                      {uploadedFile.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatSize(uploadedFile.size)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2 rounded-lg bg-primary px-5 text-xs text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      transcribeFile(uploadedFile)
                    }}
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? (
                      <>
                        <RiSparkling2Line className="animate-pulse" />
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <RiSparkling2Line />
                        Transcribe file
                      </>
                    )}
                  </Button>
                  <button
                    onClick={clearFile}
                    disabled={isTranscribing}
                    className="text-[11px] text-gray-400 transition-colors hover:text-gray-600 disabled:opacity-50"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                    <RiUpload2Line className="text-2xl text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Drop your audio file here
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      or click to browse · MP3, WAV, M4A, FLAC
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {["MP3", "WAV", "M4A", "FLAC", "OGG"].map((fmt) => (
                <span
                  key={fmt}
                  className="rounded border border-gray-200 px-1.5 py-0.5 font-mono text-[10px] text-gray-400"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 px-4 py-4 lg:flex-col lg:py-0">
            <div className="h-px w-auto flex-1 bg-gray-200 lg:h-auto lg:w-px" />
            <span className="text-[11px] font-medium tracking-widest text-gray-300 uppercase lg:rotate-180 lg:[writing-mode:vertical-lr]">
              or
            </span>
            <div className="h-px w-auto flex-1 bg-gray-200 lg:h-auto lg:w-px" />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-16">
            {previewUrl ? (
              <>
                <div className="mb-2 text-center">
                  <p className="mb-2 text-[11px] tracking-[0.18em] text-gray-400 uppercase">
                    Recorded
                  </p>
                  <h2 className="font-serif text-2xl font-normal text-gray-900 md:text-3xl">
                    Review recording
                  </h2>
                </div>
                <div className="w-full max-w-xs rounded-xl border border-gray-100 bg-white p-4">
                  <audio controls src={previewUrl} className="w-full" />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-lg px-5 text-sm"
                    onClick={discardRecording}
                  >
                    Record again
                  </Button>
                  <Button
                    className="gap-2 rounded-lg bg-primary px-5 text-sm text-white"
                    onClick={transcribeRecording}
                    disabled={isTranscribing}
                  >
                    {isTranscribing ? (
                      <>
                        <RiSparkling2Line className="animate-pulse" />
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <RiSparkling2Line />
                        Transcribe
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2 text-center">
                  <p className="mb-2 text-[11px] tracking-[0.18em] text-gray-400 uppercase">
                    Live
                  </p>
                  <h2 className="font-serif text-2xl font-normal text-gray-900 md:text-3xl">
                    Real-time transcription
                  </h2>
                </div>
                <div className="relative flex items-center justify-center">
                  {isRecording && (
                    <>
                      <span className="absolute h-32 w-32 animate-ping rounded-full bg-red-400/20" />
                      <span className="absolute h-24 w-24 animate-ping rounded-full bg-red-400/15 [animation-delay:0.3s]" />
                    </>
                  )}
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
                      isRecording
                        ? "scale-105 bg-red-500 hover:bg-red-600"
                        : "bg-primary hover:bg-primary/90"
                    } `}
                  >
                    {isRecording ? (
                      <RiStopCircleLine className="text-2xl" />
                    ) : (
                      <RiMic2Line className="text-2xl" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-medium text-gray-700">
                    {isRecording
                      ? "Recording in progress..."
                      : "Start live transcription"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isRecording
                      ? "Click the button to stop"
                      : "Uses your device microphone"}
                  </p>
                </div>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`gap-2 rounded-lg px-6 text-sm ${!isRecording && "border-gray-200 text-gray-600 hover:border-gray-300"} `}
                >
                  <i
                    className={`${isRecording ? "ri-stop-circle-line" : "ri-mic-2-line"} text-base`}
                  />
                  {isRecording ? "Stop recording" : "Start recording"}
                </Button>
                <div className="mt-2 flex w-full max-w-xs flex-col gap-2.5 rounded-xl border border-gray-100 bg-white p-4">
                  {[
                    {
                      icon: "ri-checkbox-circle-line",
                      text: "Speak clearly near your mic",
                    },
                    {
                      icon: "ri-checkbox-circle-line",
                      text: "Works in any language",
                    },
                    {
                      icon: "ri-checkbox-circle-line",
                      text: "Transcription appears in real-time",
                    },
                  ].map((tip) => (
                    <div key={tip.text} className="flex items-center gap-2.5">
                      <i className={`${tip.icon} text-sm text-primary`} />
                      <p className="text-xs text-gray-500">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {(transcription || error) && (
          <div className="border-t border-gray-200">
            {error ? (
              <div className="px-8 py-6">
                <div className="mx-auto max-w-2xl">
                  <p className="mb-1 text-sm font-medium text-red-600">Error</p>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
            ) : transcription ? (
              <div className="px-8 py-8">
                <div className="mx-auto max-w-2xl">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="mb-1 text-[11px] tracking-[0.18em] text-gray-400 uppercase">
                        Transcription
                      </p>
                      <p className="text-xs text-gray-400">
                        Powered by whisper-large-v3-turbo
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-lg text-xs"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <RiCheckLine className="text-sm text-green-600" />
                      ) : (
                        <RiFileCopyLine className="text-sm" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-white p-6">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                      {transcription}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Transcribe
