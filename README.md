# The Scenario

`BrainSlop` is an AI-assisted task management application designed for busy (and slightly chaotic) managers who don’t have time to manually structure their work.

It acts as a hybrid between a notebook and an advanced todo list, where AI plays the role of a personal assistant that understands messy input and turns it into actionable tasks.

The application allows users to dump unstructured thoughts, or short commands, while the system automatically organizes, categorizes, and enriches them.

# Design

A Next.js application using RavenDB. (Designed for Chrome)
The app has only one user - the manager. It doesn't support employees or other managers.

# Problem - Solution - Benefit

| Problem | Solution | Benefit |
| --- | --- | --- |
| Messages are captured in a sloppy/unstructured way | An `AI Agent` interprets the input and uses `Agent Tools` to perform the correct actions automatically (e.g., create tasks, mark tasks as completed, or query tasks due this week) | The sloppy manager can interact naturally without worrying about formatting or structure |
| Messages are written quickly, lack details and without enough context | A `GenAI` task enriches the description using the project context, automatically adding subtasks, tags, priority, and additional details. | Tasks become clearer and more actionable, reducing follow-up questions |
| The manager has to handle multiple projects, each containing a large number of tasks | Use `Time Series` to identify projects or tasks that show insufficient progress | Helps spot slow progress early so projects stay on track |

# **RavenDB Features Used**

## **Input Handling**

* **AI Agents** – Users can enter tasks in a sloppy, unstructured way. For example:
  * “Call Mark about invoices, send report to the board by Friday, and buy coffee because we’re out.”
  * “Fix login, update docs, call John, urgent!”
* **GenAI** – Enriches task descriptions using project context, automatically adds subtasks, assigns priority and tags to clarify and improve actionability
  
## **Project Management**
* **Counters** - Counters track project metrics like tasks created and tasks completed
* **Time Series** – Track task completion and creation time
* **Attachments / Remote Attachments** – Store PDFs, images, or screenshots as part of the project's context

## **Task Management**
* **Revisions** – Show previous task versions
* **Time Series** – Capture task lifecycle metrics such as progress and time to completion
* **Document Expiration** – Auto-expire tasks after a default period (e.g., 30 days), configurable by users
* **Attachments / Remote Attachments** – Store PDFs, images, or screenshots directly with task documents

# Roadmap

## Phase 1 - MVP

### Pages

* Main page - Primary place to manage projects and tasks. Includes a two-panel layout:
  * Sidebar - Contains a list of projects, each with a collapsible list of tasks
  * Chat - Conversation window where the manager can type or record (using speech-to-text) messages for the AI Agent to interpret and take action
* Project page - Shows project-level details such as name, description, status, and timeline, plus a summary of open, in-progress, completed, and overdue tasks.

* Task page - Shows full task details including title, description, status, priority, tags, due date, change history, and related context files.

### Features
* AI Agent
* GenAI

## Phase 2 - Enhanced Project and Task Features

### Pages

* Project page - Expanded to include project counters, progress and attachments.
* Task page - Expanded to include task revision history, progress, expiration settings, and task-level attached files.

### Features
* Counters - For each project: tasks created, completed, and open.
* Time Series
  * Project - track task creation/completion
  * Task - track subtask creation/completion
* Attachments / Remote Attachments - For projects and tasks.
* Revisions - Task version history
* Document Expiration - Automatically delete tasks upon expiration.