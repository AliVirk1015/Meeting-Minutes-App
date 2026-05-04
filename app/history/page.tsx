"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiCalendarEventLine, RiTimeLine, RiMore2Fill } from "@remixicon/react";

const DUMMY_MEETINGS = [
  {
    id: 1,
    title: "Product Sync: Q3 Roadmap",
    date: "Oct 24, 2026",
    duration: "45m",
    participants: 4,
  },
  {
    id: 2,
    title: "Weekly Engineering Standup",
    date: "Oct 22, 2026",
    duration: "30m",
    participants: 12,
  },
  {
    id: 3,
    title: "Client Discovery: Acme Corp",
    date: "Oct 20, 2026",
    duration: "1h 15m",
    participants: 3,
  },
];

export default function HistoryPage() {
  // TODO: Fetch meeting history from API

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
          <CardHeader>
            <CardTitle>Recent Meetings</CardTitle>
            <CardDescription>A log of your transcribed sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DUMMY_MEETINGS.map((meeting) => (
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
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <RiCalendarEventLine className="h-3.5 w-3.5" />
                          {meeting.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <RiTimeLine className="h-3.5 w-3.5" />
                          {meeting.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View Details
                    </Button>
                    <Button variant="ghost" size="icon" className="hidden sm:flex">
                      <RiMore2Fill className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}