"use client"
import { Button } from "./ui/button"
import { motion } from "framer-motion"
const Hero = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-secondary">
      <div className="flex flex-col items-center px-4 pt-14 pb-0 text-center sm:px-6 sm:pt-20">
        <div className="mb-6 flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-4 py-1.5 text-xs tracking-wide text-gray-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          AI-powered · zero setup
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 1,
            delay: 0.2,
            ease: "easeOut",
          }}
          className="mb-4 max-w-2xl font-serif text-4xl leading-[1.1] font-normal tracking-tight text-gray-900 sm:mb-5 sm:text-5xl md:text-7xl"
        >
          Never take meeting
          <br />
          notes <em className="text-primary italic">again.</em>
        </motion.h1>
        <p className="mb-7 max-w-md text-sm leading-relaxed font-light text-gray-500 sm:mb-9 sm:text-base">
          Your AI agent joins every call, captures every decision, and delivers
          a clean summary before the call even ends.
        </p>
        <div className="mb-10 flex w-full flex-col gap-3 px-4 sm:mb-14 sm:w-auto sm:flex-row sm:px-0">
          <Button className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium sm:w-auto">
            Get started free
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-lg border bg-transparent px-6 py-2.5 text-sm text-gray-500 sm:w-auto"
          >
            See how it works →
          </Button>
        </div>
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-t-2xl border border-b-0 border-gray-200 shadow-[0_-4px_40px_rgba(0,0,0,0.06)] md:max-w-6xl">
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            <span className="ml-2 hidden text-[11px] text-gray-400 sm:inline">
              app.notewise.ai
            </span>
            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              Recording
            </div>
          </div>
          <div className="flex min-h-[340px] flex-col bg-white sm:grid sm:grid-cols-[180px_1fr]">
            <div className="hidden flex-col gap-1 border-r border-gray-100 p-4 sm:flex">
              <p className="mt-2 mb-1 px-2 text-[10px] tracking-widest text-gray-400 uppercase">
                Workspace
              </p>
              {["Dashboard", "All meetings", "Recordings"].map((item, i) => (
                <div
                  key={item}
                  className={`cursor-pointer rounded-md px-2.5 py-1.5 text-[13px] ${
                    i === 0
                      ? "hover bg-blue-50 font-medium text-blue-700"
                      : "text-gray-500 transition-colors hover:bg-primary hover:text-white"
                  }`}
                >
                  {item}
                </div>
              ))}
              <p className="mt-4 mb-1 px-2 text-[10px] tracking-widest text-gray-400 uppercase">
                Teams
              </p>
              {["Product", "Sales"].map((item) => (
                <div
                  key={item}
                  className="cursor-pointer rounded-md px-2.5 py-1.5 text-[13px] text-gray-500"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 p-4 sm:p-5">
              <div className="xs:grid-cols-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  {
                    label: "Meetings this week",
                    val: "14",
                    delta: "↑ 3 vs last week",
                  },
                  { label: "Hours saved", val: "6.2", delta: "↑ 1.4 hrs" },
                  { label: "Action items", val: "31", delta: "12 completed" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-accent"
                  >
                    <p className="mb-1 text-[10px] text-gray-400">{s.label}</p>
                    <p className="text-xl font-medium text-gray-900">{s.val}</p>
                    <p className="text-[10px] text-emerald-600">{s.delta}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <p className="text-[13px] font-medium text-gray-800">
                    Q2 Product Roadmap Review
                  </p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] whitespace-nowrap text-emerald-700">
                    ✓ Summary ready
                  </span>
                </div>
                <p className="mb-2 text-[12px] leading-relaxed text-gray-500">
                  Agreed to push the analytics dashboard to v2.4. Design team to
                  finalize mockups by Thursday.
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    "Sarah: send revised wireframes by Thu",
                    "Jake: update sprint board in Linear",
                    "Marcus: get sign-off from stakeholders",
                  ].map((item, i) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-[11px] text-gray-500"
                    >
                      <span
                        className={`h-3 w-3 flex-shrink-0 rounded-full border-[1.5px] ${
                          i < 2
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-emerald-500"
                        }`}
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
