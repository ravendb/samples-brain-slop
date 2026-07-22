import { DocumentStore, AiConnectionString, OpenAiSettings, PutConnectionStringOperation } from "ravendb";
import { AddOrUpdateAiAgentOperation } from "ravendb";
import { AddGenAiOperation, UpdateGenAiOperation, GenAiConfiguration, GenAiTransformation } from "ravendb";
import { writeAppConfig } from "@/lib/config";
import { z } from "zod";
import { AddNewTaskArgumentsSchema, EditTaskArgumentsSchema, DeleteTaskArgumentsSchema } from "@/models/task";
import { CreateProjectArgumentsSchema, EditProjectArgumentsSchema, DeleteProjectArgumentsSchema } from "@/models/project";

const SYSTEM_PROMPT = `You are an AI assistant for a task management system BrainSlop.
Your goal is to convert unstructured manager messages into structured tasks and execute actions using available tools.
You are assisting lazy managers so answer simply (No long answers that will take too long to read).
The frontend can display GitHub Flavored Markdown (bold, italic, lists, tables, code blocks, strikethrough), so use it when it makes things clearer.

Capabilities:
- Create tasks
- Mark tasks completed
- Query tasks
- Update tasks

Guidelines:
- Always prefer using tools instead of responding with plain text when an action is requested.
- Extract structured information from messages such as:
  - title
  - description
  - due date
  - priority
  - tags
  - subtasks
- If the user message is vague, enrich the task using the project context.
- Break complex requests into multiple tasks if necessary.

Output rules:
- Be concise.
- Do not invent information.
- Ask clarification questions if required information is missing.

Context:
Each conversation belongs to a specific project. Use the project description and previous messages to understand the intent.`;

const AGENT_QUERIES = [
    {
        name: "GetProjects",
        description: "Use this query when you need information about the users projects. \nThe query will return a list of projects with information like: \n- The ID of the project.\n- The due date.\n- The description.",
        query: "from \"ProjectDocuments\" where teamId = $teamId",
        parametersSampleObject: "{}",
        options: {}
    },
    {
        name: "GetTaskByID",
        description: "Use this when you have the ID of a task and you want to get all of the information about it.",
        query: "from \"TaskDocuments\" \nwhere id() = $taskId",
        parametersSampleObject: "{\n    \"taskId\": \"The ID of the task you want to get information about\"\n}",
        options: {}
    },
    {
        name: "GetTasksByProjectId",
        description: "Use this to get all tasks belonging to a specific project. Pass the project's document ID as projectId.",
        query: "from \"TaskDocuments\" \nwhere projectId = $projectId",
        parametersSampleObject: "{\n    \"projectId\": \"The document ID of the project\"\n}",
        options: {}
    },
    {
        name: "GetTeamInfo",
        description: "Use this query to get the name of the current team. Returns the team document for the given teamId.",
        query: "from \"Teams\" where id() = $teamId",
        parametersSampleObject: "{}",
        options: {}
    },
    {
        name: "GetTeamMembers",
        description: "Use this query to get all members of the current team, including their usernames and roles. Returns each member's username (from their user account) and their role (manager or member).",
        query: "from \"Members\" as m\nwhere m.teamId = $teamId\nload m.userId as u\nselect { memberId: id(m), username: u.username, role: m.role }",
        parametersSampleObject: "{}",
        options: {}
    },
    {
        name: "GetCurrentUser",
        description: "Use this query to get information about the user you are currently talking to, including their username, color, and role.",
        query: "from \"Members\" as m\nwhere id(m) = $memberId\nload m.userId as u\nselect { memberId: id(m), userId: m.userId, username: u.username, color: m.color, role: m.role }",
        parametersSampleObject: "{}",
        options: {}
    }
];

const AGENT_ACTIONS = [
    {
        name: "CreateProject",
        description: "Trigger this action when the user intends to create a new project or start tracking a new initiative.\nThis includes explicit requests or when the user provides a project name, goal, or context implying a new project.\nEnsure you have a project name (or can infer one). If key details are missing, ask a follow-up question instead of triggering the tool.",
        parametersSchema: JSON.stringify(z.toJSONSchema(CreateProjectArgumentsSchema.strict()))
    },
    {
        name: "AddNewTask",
        description: "Trigger this action when the user intends to create a new task and add it to an existing project. If the user wants to add a task to a new project - create a new project with that task using the CreateProject action.",
        parametersSchema: JSON.stringify(z.toJSONSchema(AddNewTaskArgumentsSchema.strict()))
    },
    {
        name: "EditTask",
        description: "Trigger this action when the user intends to edit an existing task, including when the user says a task is done or completed. Make sure you know the ID of the task to edit — use query tools to look it up by name if you don't have it. Only fill the properties that the user wants to edit. Leave the other properties empty so the task won't change beyond what the user intended. To mark a task complete, set completed to true. When setting assigneeId, also set assigneeName to the member's username (use GetTeamMembers to look it up).",
        parametersSchema: JSON.stringify(z.toJSONSchema(EditTaskArgumentsSchema.strict()))
    },
    {
        name: "EditProject",
        description: "Trigger this action when the user intends to edit an existing project. Make sure you know the ID of the project to edit. You can use query tools to get the info you need.\nOnly fill the properties that the user wants to edit. Leave the other properties empty so the project wont change beyond what the user intended.",
        parametersSchema: JSON.stringify(z.toJSONSchema(EditProjectArgumentsSchema.strict()))
    },
    {
        name: "DeleteProject",
        description: "Trigger this action when the user intends to delete a project permanently.",
        parametersSchema: JSON.stringify(z.toJSONSchema(DeleteProjectArgumentsSchema.strict()))
    },
    {
        name: "DeleteTask",
        description: "Trigger this action when the user intends to delete a task permanently.",
        parametersSchema: JSON.stringify(z.toJSONSchema(DeleteTaskArgumentsSchema.strict()))
    }
];

export type SetupPayload = {
    openAiApiKey: string;
    mainModel: string;
    smallModel: string;
    ravenDbLicense: string;
};


async function validateOpenAiKey(openAiApiKey: string): Promise<void> {
    const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${openAiApiKey}` },
    });
    if (res.status === 401) {
        throw new Error("Invalid OpenAI API key.");
    }
    if (!res.ok) {
        throw new Error(`OpenAI API returned an unexpected error (${res.status}). Please try again.`);
    }
}

async function activateLicense(ravenUrl: string, licenseJson: string): Promise<void> {
    let license: unknown;
    try {
        license = JSON.parse(licenseJson);
    } catch {
        throw new Error("Invalid RavenDB license: must be valid JSON.");
    }
    const res = await fetch(new URL("/admin/license/activate", ravenUrl).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(license),
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to activate RavenDB license: ${text}`);
    }
}

export async function runSetup(payload: SetupPayload): Promise<void> {
    const { openAiApiKey, mainModel, smallModel, ravenDbLicense } = payload;

    const ravenUrl = process.env.RAVENDB_URI;
    const databaseName = process.env.RAVENDB_DATABASE;
    if (!ravenUrl || !databaseName) {
        throw new Error("RavenDB connection info is not available. Make sure the app is running via Aspire.");
    }

    await activateLicense(ravenUrl, ravenDbLicense);
    await validateOpenAiKey(openAiApiKey);

    const ravenBaseUrl = new URL(ravenUrl);
    const store = new DocumentStore([ravenUrl], databaseName);
    store.initialize();

    try {
        // Connection strings
        const makeCs = (name: string, identifier: string, model: string) => {
            const cs = new AiConnectionString();
            cs.name = name;
            cs.identifier = identifier;
            cs.modelType = "Chat";
            cs.openAiSettings = new OpenAiSettings(openAiApiKey, "https://api.openai.com/v1/", model);
            return cs;
        };

        await Promise.all([
            store.maintenance.send(new PutConnectionStringOperation(makeCs("OpenAI", "openai", mainModel))),
            store.maintenance.send(new PutConnectionStringOperation(makeCs("Small OpenAI", "small-openai", smallModel))),
        ]);

        // AI agent
        await store.maintenance.send(new AddOrUpdateAiAgentOperation({
            identifier: "assistant",
            name: "Assistant",
            connectionStringName: "OpenAI",
            systemPrompt: SYSTEM_PROMPT,
            sampleObject: '{"response": "Provide your response."}',
            queries: AGENT_QUERIES,
            actions: AGENT_ACTIONS,
            parameters: [
                { name: "teamId", description: "The ID of the team this conversation belongs to.", sendToModel: true },
                { name: "memberId", description: "The ID of the member who started this conversation.", sendToModel: false },
            ],
            disabled: false,
        }));

        // GenAI task (update if already exists)
        const transformation = new GenAiTransformation();
        transformation.script = "ai.genContext({\n    UserPrompt: this.Messages[1].content\n})";

        const genAiConfig = new GenAiConfiguration();
        genAiConfig.name = "Conversation Title Generator";
        genAiConfig.identifier = "conversation-title-generator";
        genAiConfig.connectionStringName = "Small OpenAI";
        genAiConfig.collection = "@conversations";
        genAiConfig.prompt = "Create a concise title summarizing the main topic of this conversation.\n- Use 3 to 6 words\n- Exclude punctuation at the end";
        genAiConfig.sampleObject = '{"Title": "The title of the conversation"}';
        genAiConfig.updateScript = "this.Title = $output.Title";
        genAiConfig.genAiTransformation = transformation;
        genAiConfig.maxConcurrency = 4;

        const tasksUrl = new URL(`/databases/${encodeURIComponent(databaseName)}/tasks`, ravenBaseUrl);
        const tasksRes = await fetch(tasksUrl.toString());
        if (!tasksRes.ok) throw new Error(`Failed to fetch tasks: ${tasksRes.status} ${tasksRes.statusText}`);
        const tasksJson = await tasksRes.json();
        const existingTask = tasksJson.OngoingTasks?.find(
            (t: { TaskType: string; TaskName: string; TaskId: number }) =>
                t.TaskType === "GenAi" && t.TaskName === "Conversation Title Generator"
        );

        if (existingTask) {
            await store.maintenance.send(new UpdateGenAiOperation(existingTask.TaskId, genAiConfig));
        } else {
            await store.maintenance.send(new AddGenAiOperation(genAiConfig));
        }

        writeAppConfig({ ravenUrl: ravenUrl!, databaseName: databaseName!, agentId: "assistant", openAiApiKey, mainModel, smallModel, ravenDbLicense });
    } finally {
        store.dispose();
    }
}
