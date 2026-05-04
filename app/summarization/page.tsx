"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiMagicLine, RiFileList3Line } from "@remixicon/react";

export default function SummarizationPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    // TODO: Post transcript to summarization API
    setTimeout(() => {
      setSummary(
        "Here is a generated summary of the meeting. The main topics discussed were product roadmaps for Q3, the upcoming marketing push, and some restructuring in the engineering teams. Action items include updating the JIRA board and sending out the weekly newsletter."
      );
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meeting Summarization</h1>
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
                className="w-full h-full min-h-[300px] p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                placeholder="Speaker 1: Hi everyone, let's start the meeting...&#10;Speaker 2: Yes, the first item on the agenda is..."
              />
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <RiMagicLine className="h-4 w-4 animate-pulse" /> Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RiMagicLine className="h-4 w-4" /> Generate Summary
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
              {summary ? (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 h-full text-sm leading-relaxed text-foreground">
                  {summary}
                </div>
              ) : (
                <div className="h-full min-h-[300px] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-muted-foreground p-6 text-center">
                  Click generate to view the AI-powered summary of your transcript.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}