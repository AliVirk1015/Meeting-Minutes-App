"use client"

import React, { useState } from "react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet"
import { RiMenu2Line, RiLogoutBoxRLine } from "@remixicon/react"
import Link from "next/link"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

const MAIN_NAV_ITEMS = [
  { label: "Home", href: "/" },
]

const FEATURE_ITEMS = [
  { label: "Transcribe", href: "/transcribe", desc: "Upload & transcribe" },
  { label: "Live", href: "/live-transcription", desc: "Real-time speech" },
  { label: "History", href: "/history", desc: "Past meetings" },
  { label: "Summarize", href: "/summarization", desc: "AI summaries" },
  { label: "Post-Meeting", href: "/post-meeting", desc: "Action items" },
  { label: "Search", href: "/search", desc: "Semantic queries" },
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { data: session, isPending } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in");
        },
      },
    });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/95">
      <div className="flex w-full items-center justify-between px-5 py-4 md:px-8 md:py-5">
        <div className="flex items-center gap-1.5">
          <Link href="/">
            <h1 className="text-3xl font-semibold tracking-tight">
              Meeting<span className="text-primary">Mind</span>
            </h1>
          </Link>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {MAIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground flex items-center gap-1 outline-none">
                Explore
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-[400px] p-4">
              <div className="grid grid-cols-2 gap-2">
                {FEATURE_ITEMS.map((item) => (
                  <DropdownMenuItem key={item.label} asChild className="p-3 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Link href={item.href} className="flex flex-col gap-1 outline-none">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.desc}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {!isPending && (
            session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "Avatar"} />
                      <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                    <RiLogoutBoxRLine className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/sign-in">Login</Link>
              </Button>
            )
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
          {!isPending && session ? (
             <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                 <Avatar className="h-10 w-10">
                   <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "Avatar"} />
                   <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                 </Avatar>
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent className="w-56" align="end" forceMount>
               <DropdownMenuLabel className="font-normal">
                 <div className="flex flex-col space-y-1">
                   <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                   <p className="text-xs leading-none text-muted-foreground">
                     {session.user?.email}
                   </p>
                 </div>
               </DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                 <RiLogoutBoxRLine className="mr-2 h-4 w-4" />
                 <span>Log out</span>
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="md:hidden">
              <Link href="/sign-in">Login</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Open menu"
              >
                <RiMenu2Line className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[280px] border-l border-gray-200 p-0 sm:w-[320px] dark:border-gray-800"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                <SheetTitle></SheetTitle>
              </div>
              <nav className="flex flex-col px-3 py-6">
                {[...MAIN_NAV_ITEMS, ...FEATURE_ITEMS].map((item, index) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center rounded-2xl px-4 py-4 text-lg font-medium text-muted-foreground transition-all duration-200 hover:bg-gray-50 hover:text-foreground dark:hover:bg-gray-900/50 ${index !== [...MAIN_NAV_ITEMS, ...FEATURE_ITEMS].length - 1 ? "mb-1" : ""} `}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="absolute right-6 bottom-8 left-6">
                <div className="text-center text-xs text-muted-foreground">
                  MeetingMind © 2026
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
