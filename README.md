# BrainSlop

[![Build](https://github.com/ravendb/samples-brain-slop/actions/workflows/build.yml/badge.svg)](https://github.com/ravendb/samples-brain-slop/actions/workflows/build.yml)

## Overview

BrainSlop **solves the chaos of unstructured task input** by using an AI Agent to interpret sloppy, free-form messages and automatically turn them into organized, actionable tasks. Instead of forcing managers to carefully structure every entry, the system does the heavy lifting—parsing intent, creating tasks, and taking the correct actions.

The app **turns vague goals into one-click actions** — managers describe a project or objective in plain language, and the AI Agent suggests what to do next. A single click is all it takes to approve and move forward.

Finally, BrainSlop **surfaces slow-moving work before it becomes a problem** by using Time Series to track task and project progress over time, giving managers early warnings on stalled initiatives.

Built with [RavenDB](https://ravendb.net) and [Next.js](https://nextjs.org).

<img width="2229" height="1180" alt="image" src="https://github.com/user-attachments/assets/c4be7913-27b7-49f8-a527-865f27116f3c" />


## Features used

The following RavenDB features are used to build the application:

1. [AI Agents](https://ravendb.net/docs/article-page/7.2/csharp/ai-integration/ai-agents) – Interprets unstructured user input and dispatches the correct actions (e.g., create tasks, mark as completed, query by due date)
1. [GenAI](https://ravendb.net/docs/article-page/7.2/csharp/ai-integration/overview) – Enriches task descriptions with subtasks, tags, and priority using project context
1. [Time Series](https://ravendb.net/docs/article-page/7.2/csharp/document-extensions/timeseries/overview) – Track task creation, completion, and progress over time to display in a Burndown chart.
1. [Attachments / Remote Attachments](https://ravendb.net/docs/article-page/7.2/csharp/document-extensions/attachments/what-are-attachments) – Store PDFs, images, or screenshots with project and task documents
1. [Revisions](https://ravendb.net/docs/article-page/7.2/csharp/document-extensions/revisions/overview) – Show previous versions of a task document
## Technologies

The following technologies were used to build this application:

1. [RavenDB](https://ravendb.net/)
1. [Next.js](https://nextjs.org/)

## Run locally

If you want to run the application locally, please follow the steps:

1. Check out the GIT repository
1. Install prerequisites:
   1. [Node.js](https://nodejs.org)
   1. [RavenDB](https://ravendb.net/download) – grab a new license while you're there
1. Create a local unsecured database.
1. Get the app running:
   ```
   npm install
   npm run dev
   ```

## Community & Support

If you spot a bug, have an idea or a question, please let us know by raising an issue or creating a pull request.

We do use a [Discord server](https://discord.gg/ravendb). If you have any doubts, don't hesitate to reach out!

## Contributing

We encourage you to contribute! Please read our [CONTRIBUTING](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed with the [MIT license](LICENSE).
