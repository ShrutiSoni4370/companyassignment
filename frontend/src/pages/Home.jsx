import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const content = {
    brand: {
        name: "Fairway For Good",
        tag: "Golf Charity Subscription Platform",
    },
    hero: {
        eyebrow: "Play better. Give better. Win monthly.",
        title: "A modern golf platform where golf scores, prize draws, and charity come together.",
        description:
            "Track your latest Stableford rounds, subscribe monthly or yearly, and support a charity of your choice through a clean and emotionally engaging experience.",
        ctas: [
            { label: "Start Subscription", href: "#subscriptions", primary: true },
            { label: "Explore Charities", href: "#charities", primary: false },
        ],
        stats: [
            { label: "Latest scores stored", value: "5" },
            { label: "Prize tiers every month", value: "3" },
            { label: "Minimum charity share", value: "10%" },
        ],
    },
    intro: {
        title: "What this platform offers",
        description:
            "The homepage is designed like a dynamic 3-page story inside one landing experience: platform intro, subscription plans, and charity plans.",
        cards: [
            {
                title: "Golf score tracking",
                text: "Users enter their Stableford scores with dates, and the system keeps only the latest five scores automatically.",
            },
            {
                title: "Monthly draw rewards",
                text: "Subscribers take part in draw-based rewards with 3-match, 4-match, and 5-match jackpot tiers.",
            },
            {
                title: "Charity-first impact",
                text: "A fixed portion of the subscription supports a selected charity, with flexible contribution options.",
            },
        ],
    },
    subscriptions: [
        {
            name: "Monthly Plan",
            price: "£19",
            cycle: "/month",
            badge: "Flexible",
            featured: false,
            features: [
                "Access to member dashboard",
                "Monthly draw participation",
                "Score entry and score history",
                "Charity selection at signup",
            ],
        },
        {
            name: "Yearly Plan",
            price: "£190",
            cycle: "/year",
            badge: "Best Value",
            featured: true,
            features: [
                "Discounted annual subscription",
                "Continuous access to draws and dashboard",
                "Ideal for long-term participation",
                "Better retention for recurring giving",
            ],
        },
    ],
    charityPlans: [
        {
            title: "Starter Giving",
            percent: "10%",
            text: "The minimum contribution set from the subscription amount at signup.",
        },
        {
            title: "Impact Plus",
            percent: "20%",
            text: "A higher recurring contribution for members who want to increase support.",
        },
        {
            title: "Independent Donation",
            percent: "Custom",
            text: "A separate donation path not tied directly to gameplay or draw activity.",
        },
    ],
    charities: [
        "Community Health Outreach",
        "Junior Golf Access Fund",
        "Women in Sport Foundation",
        "Green Course Sustainability Trust",
    ],
    draw: [
        { match: "5-Number Match", share: "40%", rollover: "Yes" },
        { match: "4-Number Match", share: "35%", rollover: "No" },
        { match: "3-Number Match", share: "25%", rollover: "No" },
    ],
    admin: {
        title: "Run as admin",
        text: "Switch into admin mode from the navbar to preview a control-focused experience for managing users, subscriptions, draws, charities, and winner verification.",
        features: [
            "Manage users and subscriptions",
            "Run random or algorithmic draws",
            "Verify winners and update payouts",
            "View reports and charity totals",
        ],
    },
};

const navLinks = [
    { label: "Intro", href: "#intro" },
    { label: "Subscriptions", href: "#subscriptions" },
    { label: "Charities", href: "#charities" },
    { label: "Draws", href: "#draws" },
];

export default function Home() {
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [mode, setMode] = useState("member");
    const [theme, setTheme] = useState("light");
    const [activeSlide, setActiveSlide] = useState(0);

    const slides = useMemo(
        () => [
            {
                kicker: "Page 1",
                title: "Website intro",
                text: "A golf platform designed around subscriptions, rewards, and charitable impact.",
            },
            {
                kicker: "Page 2",
                title: "Subscription plans",
                text: "Monthly and yearly plans unlock member access, score management, and prize participation.",
            },
            {
                kicker: "Page 3",
                title: "Charity plans",
                text: "Every subscriber supports a cause with flexible contribution percentages and donation options.",
            },
        ],
        []
    );

    useEffect(() => {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(systemDark ? "dark" : "light");
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % slides.length);
        }, 4500);
        return () => clearInterval(timer);
    }, [slides.length]);

    const goToLogin = () => {
        setMenuOpen(false);
        navigate("/login");
    };

    const goToSignup = () => {
        setMenuOpen(false);
        navigate("/signup");
    };

    return (
        <div className="min-h-screen bg-stone-50 text-slate-900 transition-colors duration-300 dark:bg-[#101513] dark:text-white">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-white"
            >
                Skip to content
            </a>

            <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-stone-50/90 backdrop-blur dark:border-white/10 dark:bg-[#101513]/90">
                <div className="mx-auto flex w-[min(1180px,calc(100%-1.5rem))] items-center justify-between gap-4 py-4 md:w-[min(1180px,calc(100%-2rem))]">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-emerald-800 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-emerald-300">
                            <svg viewBox="0 0 64 64" className="h-7 w-7" fill="none" aria-hidden="true">
                                <rect x="6" y="10" width="52" height="44" rx="18" stroke="currentColor" strokeWidth="5" />
                                <path d="M18 40C25 25 35 20 46 22" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                                <circle cx="22" cy="23" r="4" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-semibold tracking-tight">{content.brand.name}</p>
                            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{content.brand.tag}</p>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-2 lg:flex">
                        {navLinks.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                            >
                                {item.label}
                            </a>
                        ))}
                        <button
                            type="button"
                            onClick={() => {setMode("admin")
                                navigate("/admin")}}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                            Run as admin
                        </button>
                    </nav>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 transition hover:bg-emerald-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? "☀" : "☾"}
                        </button>

                        <button
                            type="button"
                            onClick={goToLogin}
                            className="hidden rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 md:inline-flex"
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            onClick={goToSignup}
                            className="hidden rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 md:inline-flex dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                        >
                            Sign Up
                        </button>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-700 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-white"
                            aria-label="Toggle menu"
                        >
                            ☰
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="border-t border-slate-200 bg-stone-50 px-3 py-3 lg:hidden dark:border-white/10 dark:bg-[#101513]">
                        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
                            {navLinks.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 dark:text-slate-200 dark:hover:bg-white/5"
                                >
                                    {item.label}
                                </a>
                            ))}

                            <button
                                type="button"
                                onClick={() => {
                                    setMode("admin");
                                    setMenuOpen(false);
                                }}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                                Run as admin
                            </button>

                            <button
                                type="button"
                                onClick={goToLogin}
                                className="rounded-2xl bg-emerald-700 px-4 py-3 text-left text-sm font-semibold text-white"
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                onClick={goToSignup}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <main id="main-content">
                <section className="mx-auto grid w-[min(1180px,calc(100%-1.5rem))] gap-6 py-8 md:w-[min(1180px,calc(100%-2rem))] md:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-white/5 md:p-8 lg:p-10">
                        <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                            {content.hero.eyebrow}
                        </span>
                        <h1 className="mt-5 max-w-[12ch] text-4xl font-semibold leading-none tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-7xl">
                            {content.hero.title}
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                            {content.hero.description}
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            {content.hero.ctas.map((cta) => (
                                <a
                                    key={cta.label}
                                    href={cta.href}
                                    className={`inline-flex min-h-12 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                                        cta.primary
                                            ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                            : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                    }`}
                                >
                                    {cta.label}
                                </a>
                            ))}
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-3">
                            {content.hero.stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5"
                                >
                                    <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-gradient-to-b from-white to-stone-100 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] dark:border-white/10 dark:from-white/5 dark:to-white/[0.03] md:p-8 lg:p-10">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                                Dynamic home flow
                            </span>
                            <span
                                className={`inline-flex rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
                                    mode === "admin"
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300"
                                        : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"
                                }`}
                            >
                                {mode === "admin" ? "Admin mode" : "Member mode"}
                            </span>
                        </div>

                        <div className="rounded-[24px] border border-slate-200 bg-stone-100 p-6 dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                                {slides[activeSlide].kicker}
                            </p>
                            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                                {slides[activeSlide].title}
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{slides[activeSlide].text}</p>

                            <div className="mt-5 flex gap-2">
                                {slides.map((slide, index) => (
                                    <button
                                        key={slide.title}
                                        type="button"
                                        onClick={() => setActiveSlide(index)}
                                        aria-label={`Show ${slide.title}`}
                                        className={`h-3 w-3 rounded-full transition ${
                                            activeSlide === index
                                                ? "scale-110 bg-emerald-700 dark:bg-emerald-300"
                                                : "bg-slate-300 dark:bg-slate-600"
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                ["Subscription", "Monthly + yearly"],
                                ["Charity", "10% minimum"],
                                ["Scores", "Latest five"],
                                ["Draws", "Monthly rewards"],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                                >
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                                    <p className="mt-1 font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="intro" className="mx-auto w-[min(1180px,calc(100%-1.5rem))] py-6 md:w-[min(1180px,calc(100%-2rem))] md:py-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Introduction</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{content.intro.title}</h2>
                        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{content.intro.description}</p>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                        {content.intro.cards.map((card) => (
                            <article
                                key={card.title}
                                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
                            >
                                <h3 className="text-xl font-semibold tracking-tight">{card.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{card.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="subscriptions" className="mx-auto w-[min(1180px,calc(100%-1.5rem))] py-6 md:w-[min(1180px,calc(100%-2rem))] md:py-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Subscriptions</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Choose a plan</h2>
                        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                            Monthly and yearly plans are presented clearly so users understand access, draw participation, and recurring giving.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {content.subscriptions.map((plan) => (
                            <article
                                key={plan.name}
                                className={`rounded-[24px] border p-6 shadow-sm transition dark:border-white/10 dark:bg-white/5 ${
                                    plan.featured
                                        ? "border-emerald-200 bg-emerald-50/60 dark:bg-emerald-400/10"
                                        : "border-slate-200 bg-white"
                                }`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-300">
                                            {plan.badge}
                                        </span>
                                        <h3 className="mt-4 text-2xl font-semibold tracking-tight">{plan.name}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{plan.price}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{plan.cycle}</p>
                                    </div>
                                </div>

                                <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-400" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    type="button"
                                    onClick={goToSignup}
                                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                >
                                    Choose Plan
                                </button>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="charities" className="mx-auto w-[min(1180px,calc(100%-1.5rem))] py-6 md:w-[min(1180px,calc(100%-2rem))] md:py-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Charity plans</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Giving options built into the platform</h2>
                        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                            The homepage highlights the charity system first so users understand how their subscription supports real causes.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="grid gap-4">
                            {content.charityPlans.map((plan) => (
                                <article
                                    key={plan.title}
                                    className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:grid-cols-[140px_1fr]"
                                >
                                    <div>
                                        <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{plan.percent}</p>
                                        <h3 className="mt-2 text-xl font-semibold tracking-tight">{plan.title}</h3>
                                    </div>
                                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{plan.text}</p>
                                </article>
                            ))}
                        </div>

                        <aside className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Featured charities</p>
                            <h3 className="mt-3 text-2xl font-semibold tracking-tight">Browse support categories</h3>
                            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                {content.charities.map((charity) => (
                                    <li key={charity} className="flex items-start gap-3">
                                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-400" />
                                        <span>{charity}</span>
                                    </li>
                                ))}
                            </ul>
                            <a
                                href="#draws"
                                className="mt-6 inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300"
                            >
                                See draw and reward logic
                            </a>
                        </aside>
                    </div>
                </section>

                <section id="draws" className="mx-auto w-[min(1180px,calc(100%-1.5rem))] py-6 md:w-[min(1180px,calc(100%-2rem))] md:py-10">
                    <div className="max-w-3xl">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Draw system</p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Monthly prize pool breakdown</h2>
                        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                            The home page can communicate reward logic using a clean responsive table so users quickly understand the pool distribution.
                        </p>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
                        <div className="hidden grid-cols-3 gap-4 bg-stone-100 px-6 py-4 text-sm font-semibold text-slate-800 dark:bg-white/5 dark:text-white sm:grid">
                            <span>Match type</span>
                            <span>Pool share</span>
                            <span>Rollover</span>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-white/10">
                            {content.draw.map((row) => (
                                <div key={row.match} className="grid gap-2 px-6 py-5 sm:grid-cols-3 sm:gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 sm:hidden">Match type</p>
                                        <p className="text-sm font-medium text-slate-800 dark:text-white">{row.match}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 sm:hidden">Pool share</p>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.share}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400 sm:hidden">Rollover</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">{row.rollover}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto w-[min(1180px,calc(100%-1.5rem))] py-6 md:w-[min(1180px,calc(100%-2rem))] md:py-10 lg:pb-16">
                    <div className="grid gap-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 lg:grid-cols-2 lg:p-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Admin access</p>
                            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{content.admin.title}</h2>
                            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{content.admin.text}</p>
                        </div>

                        <div className="flex flex-col justify-between gap-5">
                            <ul className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                {content.admin.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-amber-400" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={() => {setMode("admin")
                                    navigate("/admin")}
                                }
                                className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-fit"
                            >
                                Open Admin Mode
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}