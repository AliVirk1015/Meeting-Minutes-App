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
import { RiSlackLine, RiMailSendLine, RiCheckDoubleLine } from "@remixicon/react";

export default function PostMeetingPage() {
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  const toggleDestination = (dest: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(dest) ? prev.filter((d) => d !== dest) : [...prev, dest]
    );
  };

  const handleSend = () => {
    setIsSending(true);
    // TODO: Trigger agent pipeline and webhooks
    setTimeout(() => {
      setIsSending(false);
      alert("Action items sent successfully!");
    }, 1500);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] p-6 md:p-12 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Post-Meeting Agent</h1>
          <p className="text-muted-foreground mt-2">
            Automate the final steps: extract action items and distribute them to your team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Extracted Action Items</CardTitle>
                <CardDescription>
                  Review the tasks identified from your latest meeting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Update Q3 roadmap presentation (Sarah)",
                    "Schedule follow-up with Acme Corp (John)",
                    "Fix login authentication bug (Dev Team)",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                    >
                      <RiCheckDoubleLine className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
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
                  disabled={selectedDestinations.length === 0 || isSending}
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