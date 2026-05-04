"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiMicLine, RiMicOffLine, RiRecordCircleLine } from "@remixicon/react";

export default function LiveTranscriptionPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>("");

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Connect to live transcription websocket
  };

  useEffect(() => {
    // Dummy effect to simulate incoming websocket text
    let interval: NodeJS.Timeout;
    if (isRecording) {
      const phrases = [
        " Hello team, thanks for joining.",
        " Let's review the Q3 metrics.",
        " User engagement is up 15%.",
        " We need to focus on retention next month.",
      ];
      let i = 0;
      interval = setInterval(() => {
        if (i < phrases.length) {
          setTranscript((prev) => prev + phrases[i]);
          i++;
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Live Transcription</h1>
            <p className="text-muted-foreground mt-2">
              Real-time speech to text using websockets.
            </p>
          </div>
          
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={toggleRecording}
            className="flex items-center gap-2 rounded-full px-8 shadow-lg shadow-primary/20 transition-all duration-300"
          >
            {isRecording ? (
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
        </div>

        <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm min-h-[500px] flex flex-col">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                Transcript
              </CardTitle>
              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-red-500 font-medium animate-pulse">
                  <RiRecordCircleLine className="h-4 w-4" />
                  Live
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-6 overflow-y-auto">
            {transcript ? (
              <p className="text-lg leading-loose text-foreground whitespace-pre-wrap font-medium">
                {transcript}
                {isRecording && (
                  <span className="inline-block w-2 h-5 ml-1 bg-primary animate-pulse align-middle" />
                )}
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-full">
                  <RiMicLine className="h-8 w-8 opacity-50" />
                </div>
                <p>Click "Start Recording" to begin transcribing.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}