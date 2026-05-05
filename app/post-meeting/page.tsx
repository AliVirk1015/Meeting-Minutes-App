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
import {
  RiSlackLine,
  RiMailSendLine,
  RiCheckDoubleLine,
  RiSparkling2Line,
} from "@remixicon/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function PostMeetingPage() {
  const [transcript, setTranscript] = useState("");
  const [actionItems, setActionItems] = useState<
    { text: string; assignee: string | null }[]
  >([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    []
  );
  const [isSending, setIsSending] = useState(false);

  const toggleDestination = (dest: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(dest) ? prev.filter((d) => d !== dest) : [...prev, dest]
    );
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;

    setIsExtracting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/extract-action-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to extract action items");
      }

      setActionItems(data.action_items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSend = () => {
    setIsSending(true);
    // TODO: Trigger distribution endpoint (Phase 5)
    setTimeout(() => {
      setIsSending(false);
      alert("Action items sent successfully!");
    }, 1500);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Post-Meeting Agent
          </h1>
          <p className="text-muted-foreground mt-2">
            Paste a transcript to extract action items, then distribute them to
            your team.
          </p>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Input Transcript</CardTitle>
            <CardDescription>
              Paste your meeting transcript below to extract action items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleExtract} className="space-y-4">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full h-40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all text-sm"
                placeholder="Paste your meeting transcript here..."
              />
              <Button
                type="submit"
                disabled={isExtracting || transcript.trim().length < 10}
                className="gap-2"
              >
                {isExtracting ? (
                  <>
                    <RiSparkling2Line className="h-4 w-4 animate-pulse" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <RiSparkling2Line className="h-4 w-4" />
                    Extract Action Items
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Extracted Action Items</CardTitle>
                <CardDescription>
                  {actionItems.length > 0
                    ? `${actionItems.length} task${actionItems.length > 1 ? "s" : ""} identified from your transcript.`
                    : "Submit a transcript above to see extracted tasks."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {actionItems.length > 0 ? (
                  <ul className="space-y-3">
                    {actionItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                      >
                        <RiCheckDoubleLine className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm">{item.text}</span>
                          {item.assignee && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              — {item.assignee}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-32 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-center text-muted-foreground text-sm">
                    No action items extracted yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Distribute</CardTitle>
                <CardDescription>Select where to send.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => toggleDestination("slack")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    selectedDestinations.includes("slack")
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 dark:border-gray-800 hover:border-primary/50"
                  }`}
                >
                  <RiSlackLine className="h-5 w-5" />
                  <span className="font-medium">Slack Channel</span>
                </button>
                <button
                  onClick={() => toggleDestination("email")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    selectedDestinations.includes("email")
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-200 dark:border-gray-800 hover:border-primary/50"
                  }`}
                >
                  <RiMailSendLine className="h-5 w-5" />
                  <span className="font-medium">Email Team</span>
                </button>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSend}
                  disabled={
                    selectedDestinations.length === 0 ||
                    isSending ||
                    actionItems.length === 0
                  }
                  className="w-full"
                >
                  {isSending ? "Sending..." : "Dispatch Actions"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
