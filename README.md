# BrainSlop

[![Build](https://github.com/ravendb/samples-brain-slop/actions/workflows/build.yml/badge.svg)](https://github.com/ravendb/samples-brain-slop/actions/workflows/build.yml)

## Overview

BrainSlop **solves the chaos of unstructured task input** by using an AI Agent to interpret sloppy, free-form messages and automatically turn them into organized, actionable tasks. Instead of forcing managers to carefully structure every entry, the system does the heavy lifting—parsing intent, creating tasks, and taking the correct actions.

The app **turns vague goals into one-click actions** — managers describe a project or objective in plain language, and the AI Agent suggests what to do next. A single click is all it takes to approve and move forward.


Built with [RavenDB](https://ravendb.net), [Next.js](https://nextjs.org), and [.NET Aspire](https://aspire.dev).

<img width="2229" height="1180" alt="image" src="https://github.com/user-attachments/assets/c4be7913-27b7-49f8-a527-865f27116f3c" />


## Features used

The following RavenDB features are used to build the application:

1. [AI Agents](https://ravendb.net/docs/article-page/7.2/csharp/ai-integration/ai-agents) – Interprets unstructured user input and dispatches the correct actions (e.g., create tasks, mark as completed, query by due date)
1. [GenAI](https://ravendb.net/docs/article-page/7.2/csharp/ai-integration/overview) – Give chat's a title based on the user's messages
## Technologies

The following technologies were used to build this application:

1. [RavenDB 7.2](https://ravendb.net/)
1. [Next.js](https://nextjs.org/)
1. [.NET 10](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
1. [.NET Aspire](https://aspire.dev)
1. [Node.js 20](https://nodejs.org)

## Run locally

1. Check out the GIT repository
1. Install prerequisites:
   1. [Docker](https://docs.docker.com/engine/install)
   1. [.NET 10.x](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
   1. [Node.js 20.x](https://nodejs.org/en/download)
   1. [Aspire CLI](https://aspire.dev) — `dotnet tool install -g Aspire.Cli`
1. Run the application:
   ```
   aspire start
   ```
1. Open the app URL shown in the Aspire dashboard and complete the one-time setup:
   1. **RavenDB License** — paste your license JSON (get one free at [ravendb.net/download](https://ravendb.net/download))
   1. **OpenAI API Key** — your OpenAI key

## Community & Support

If you spot a bug, have an idea or a question, please let us know by raising an issue or creating a pull request.

We do use a [Discord server](https://discord.gg/ravendb). If you have any doubts, don't hesitate to reach out!

## Contributing

We encourage you to contribute! Please read our [CONTRIBUTING](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed with the [MIT license](LICENSE).
