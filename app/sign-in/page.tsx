"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { RiLoader4Line, RiGoogleFill, RiGithubFill } from "@remixicon/react";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn.email({
      email,
      password,
      callbackURL: "/transcribe",
    });

    setIsLoading(false);

    if (res.error) {
      setError(res.error.message || "Something went wrong.");
    } else {
      router.push("/transcribe");
    }
  }

  async function handleSocialSignIn(provider: "google" | "github") {
    setError(null);
    if (provider === "google") setIsGoogleLoading(true);
    if (provider === "github") setIsGithubLoading(true);

    const res = await signIn.social({
      provider,
      callbackURL: "/transcribe",
    });

    if (provider === "google") setIsGoogleLoading(false);
    if (provider === "github") setIsGithubLoading(false);

    if (res.error) {
      setError(res.error.message || "Something went wrong.");
    }
  }

  return (
    <main className="h-screen flex items-center justify-center p-6 bg-gray-50/50 dark:bg-gray-950/50">
      <Card className="w-full max-w-md border-gray-200 dark:border-gray-800 shadow-xl bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleSocialSignIn("github")}
              disabled={isGithubLoading}
              className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              {isGithubLoading ? (
                <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RiGithubFill className="mr-2 h-4 w-4" />
              )}
              Github
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSocialSignIn("google")}
              disabled={isGoogleLoading}
              className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              {isGoogleLoading ? (
                <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RiGoogleFill className="mr-2 h-4 w-4 text-red-500" />
              )}
              Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/50 dark:bg-gray-950/50 px-2 text-muted-foreground backdrop-blur-sm">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}