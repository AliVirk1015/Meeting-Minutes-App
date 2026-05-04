"use client"

const features = [
  {
    icon: "✦",
    title: "AI-Powered Note Taking",
    description:
      "Your AI agent joins every call, captures every decision, and delivers a clean summary before the call even ends.",
  },
  {
    icon: "⬡",
    title: "Seamless Integration",
    description:
      "Works with all major video conferencing platforms without any setup required.",
  },
  {
    icon: "◈",
    title: "Actionable Summaries",
    description:
      "Get concise, actionable summaries that highlight key decisions and next steps.",
  },
  {
    icon: "⌕",
    title: "Searchable Archives",
    description:
      "Easily search and reference past meeting notes to stay organized and informed.",
  },
]

const Features = () => {
  return (
    <>
      <div className="mt-16 flex w-full items-center gap-4 px-10">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-[11px] font-medium tracking-[0.2em] text-gray-400 uppercase">
          Everything you need
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="mt-8 mb-2 flex w-full flex-col items-center px-6 text-center">
        <h2 className="font-serif text-3xl leading-snug font-normal tracking-tight text-gray-900 md:text-4xl">
          Built for teams that move{" "}
          <em className="text-primary italic">fast.</em>
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed font-light text-gray-400">
          Every feature designed to eliminate friction from your meeting
          workflow.
        </p>
      </div>

      <section className="mt-10 flex w-full flex-col overflow-hidden bg-primary md:flex-row">
        <div className="flex w-full flex-shrink-0 items-center justify-center px-8 py-10 md:w-[30%]">
          <div className="relative w-full max-w-[200px] md:max-w-full">
            <div className="absolute inset-0 scale-110 rounded-2xl bg-orange-500/85 blur-xl" />
            <img
              src="/continous linear.avif"
              alt="AI meeting notes"
              className="relative max-h-[280px] w-full rounded-2xl object-contain opacity-85 mix-blend-luminosity"
            />
          </div>
        </div>
        <div className="w-full border-white/10 md:w-[70%] md:border-l">
          <div className="grid h-full grid-cols-1 sm:grid-cols-2">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group relative flex cursor-default items-start gap-4 px-7 py-8 transition-colors duration-200 hover:bg-white/5 ${i % 2 === 0 ? "border-white/10 sm:border-r" : ""} ${i < 2 ? "border-white/10 sm:border-b" : ""} border-b border-white/10 last:border-b-0 sm:last:border-b-0`}
              >
                <span className="absolute top-5 right-5 font-mono text-[10px] text-white/20">
                  0{i + 1}
                </span>
                <span className="mt-0.5 flex-shrink-0 text-base text-white/50 transition-colors duration-200 group-hover:text-white/80">
                  {feature.icon}
                </span>
                <div className="flex flex-col gap-1.5 pr-4">
                  <h3 className="text-sm leading-snug font-medium tracking-tight text-white/90">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed font-light text-white/45 transition-colors duration-200 group-hover:text-white/60">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default Features
