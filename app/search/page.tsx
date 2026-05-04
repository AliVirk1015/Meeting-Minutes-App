"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiSearch2Line, RiSparklingLine } from "@remixicon/react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsSearching(true);
    // TODO: Query RAG backend with search term
    setTimeout(() => {
      setResults(
        "Based on your meetings, 'Acme Corp' was mentioned 12 times in the last month. The main contact point discussed was 'Sarah Jenkins' regarding the Q3 integration timeline."
      );
      setIsSearching(false);
    }, 1500);
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 bg-gray-50/50 dark:bg-gray-950/50">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <RiSparklingLine className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Semantic Search</h1>
          <p className="text-muted-foreground text-lg">
            Ask questions about your meeting history. Our RAG engine will find the answers.
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
                placeholder="What did we decide about the Acme Corp timeline?"
                className="w-full bg-transparent border-none px-4 py-4 focus:outline-none focus:ring-0 text-lg"
              />
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSearching || !query}
                className="rounded-lg mr-1 px-8"
              >
                {isSearching ? "Searching..." : "Ask"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {results && (
          <Card className="border-primary/20 bg-primary/5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RiSparklingLine className="h-5 w-5 text-primary" />
                AI Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{results}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}