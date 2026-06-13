import Link from "next/link";
import styles from "./page.module.css";

const PILLARS = [
    {
        icon: "🧠",
        title: "Turns chaos into tasks",
        body: "The AI Agent interprets sloppy, free-form messages and automatically creates organized, actionable tasks — no careful structuring required.",
    },
    {
        icon: "⚡",
        title: "One-click actions",
        body: "Describe a project or objective in plain language and the AI suggests what to do next. Approve with a single click.",
    },
    {
        icon: "🤝",
        title: "Built for teams",
        body: "Invite teammates, assign tasks to specific members, and share AI conversations across your whole team — everyone stays in sync without extra overhead.",
    },
];

const FEATURES = [
    {
        name: "AI Agents",
        href: "https://ravendb.net/docs/article-page/7.2/csharp/ai-integration/ai-agents",
        description: "Interprets unstructured user input and dispatches the correct actions (create tasks, mark as completed, query by due date, etc.)",
    },
    {
        name: "GenAI",
        href: "https://ravendb.net/docs/article-page/7.2/csharp/ai-integration/overview",
        description: "Enriches task descriptions with subtasks, tags, and priority using project context.",
    },
    {
        name: "Time Series",
        href: "https://ravendb.net/docs/article-page/7.2/csharp/document-extensions/timeseries/overview",
        description: "Tracks task creation, completion, and progress over time to power the Burndown chart.",
    },
    {
        name: "Attachments / Remote Attachments",
        href: "https://ravendb.net/docs/article-page/7.2/csharp/document-extensions/attachments/what-are-attachments",
        description: "Stores PDFs, images, or screenshots alongside project and task documents.",
    },
    {
        name: "Revisions",
        href: "https://ravendb.net/docs/article-page/7.2/csharp/document-extensions/revisions/overview",
        description: "Shows previous versions of a task document so nothing is ever lost.",
    },
];

const STEPS = [
    { body: <>Check out the repository from GitHub.</> },
    {
        body: (
            <>
                Install prerequisites:{" "}
                <a href="https://nodejs.org" target="_blank" rel="noreferrer">Node.js</a>
                {" and "}
                <a href="https://ravendb.net/download" target="_blank" rel="noreferrer">RavenDB</a>
                {" (grab a free license while you're there)."}
            </>
        ),
    },
    {
        body: (
            <>
                Start RavenDB in{" "}
                <a href="https://docs.ravendb.net/7.2/start/installation/setup-wizard/choose-security-option" target="_blank" rel="noreferrer">
                    unsecured mode
                </a>
                {" "}(no TLS or auth — suitable for local development). The app creates the database automatically on first setup.
            </>
        ),
    },
    {
        body: (
            <>
                Install dependencies and start the dev server:
                <pre className={styles.codeBlock}>{`npm install\nnpm run dev`}</pre>
            </>
        ),
    },
];

export default function LandingPage() {
    return (
        <div className={styles.wrapper}><div className={styles.page}>

            {/* Hero */}
            <section className={styles.hero}>
                <h1 className={styles.title}>BrainSlop</h1>
                <p className={styles.tagline}>
                    AI-assisted task management for busy managers — turn messy thoughts into actionable work, automatically.
                </p>
                <Link href="/auth/login" className={styles.cta}>
                    Get started →
                </Link>
            </section>

            {/* Three pillars */}
            <div className={styles.pillars}>
                {PILLARS.map((p) => (
                    <div key={p.title} className={styles.pillar}>
                        <span className={styles.pillarIcon}>{p.icon}</span>
                        <h2 className={styles.pillarTitle}>{p.title}</h2>
                        <p className={styles.pillarBody}>{p.body}</p>
                        {p.comingSoon && (
                            <div className={styles.pillarFooter}>
                                <span className={styles.comingSoon}>Coming soon</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* RavenDB features */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>RavenDB features used</h2>
                <ul className={styles.featureList}>
                    {FEATURES.map((f) => (
                        <li key={f.name} className={styles.featureItem}>
                            <a href={f.href} target="_blank" rel="noreferrer" className={styles.featureName}>
                                {f.name}
                            </a>
                            <span className={styles.featureDash}>—</span>
                            <span>{f.description}</span>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Run locally */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Run locally</h2>
                <ol className={styles.steps}>
                    {STEPS.map((s, i) => (
                        <li key={i} className={styles.step}>
                            <span className={styles.stepNumber}>{i + 1}</span>
                            <div className={styles.stepBody}>{s.body}</div>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Community & links */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Community & contributing</h2>
                <div className={styles.links}>
                    <a href="https://discord.gg/ravendb" target="_blank" rel="noreferrer" className={styles.link}>
                        💬 Discord
                    </a>
                    <a href="https://github.com/ravendb/samples-brain-slop/issues" target="_blank" rel="noreferrer" className={styles.link}>
                        🐛 Report an issue
                    </a>
                    <a href="https://github.com/ravendb/samples-brain-slop/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer" className={styles.link}>
                        🤝 Contributing
                    </a>
                    <a href="https://github.com/ravendb/samples-brain-slop/blob/main/LICENSE" target="_blank" rel="noreferrer" className={styles.link}>
                        📄 MIT License
                    </a>
                </div>
            </section>

        </div></div>
    );
}
