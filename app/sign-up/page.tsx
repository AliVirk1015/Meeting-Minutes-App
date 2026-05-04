"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
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

export default function SignUpPage() {
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
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signUp.email({
      name,
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
            Create an account
          </CardTitle>
          <CardDescription className="text-center">
            Join us to get started
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                className="bg-white dark:bg-gray-900"
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                className="bg-white dark:bg-gray-900"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}