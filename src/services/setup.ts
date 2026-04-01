import { DocumentStore, AiConnectionString, OpenAiSettings, PutConnectionStringOperation } from "ravendb";
import { AddOrUpdateAiAgentOperation } from "ravendb";
import { AddGenAiOperation, UpdateGenAiOperation, GenAiConfiguration, GenAiTransformation } from "ravendb";
import { writeAppConfig } from "@/lib/config";

const SYSTEM_PROMPT = `You are an AI assistant for a task management system BrainSlop.
Your goal is to convert unstructured manager messages into structured tasks and execute actions using available tools.
You are assisting lazy managers so answer simply (No long answers that will take too long to read).

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
        description: "Use this query when you need information about the users projects. \nThe query will return a list of projects with information like: \n- The ID or the project.\n- The due date.\n- The description.\n- A list of task IDs",
        query: "from \"ProjectDocuments\" ",
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
        name: "GetTasksByIDList",
        description: "Use this when you have a list of task IDs. From a project for example. And you want to get information about them.",
        query: "from \"TaskDocuments\" \nwhere id() in ($taskIds)",
        parametersSampleObject: "{\n    \"taskIds\": \"List of task IDs\"\n}",
        options: {}
    }
];

const AGENT_ACTIONS = [
    {
        name: "CreateProject",
        description: "Trigger this action when the user intends to create a new project or start tracking a new initiative.\nThis includes explicit requests or when the user provides a project name, goal, or context implying a new project.\nEnsure you have a project name (or can infer one). If key details are missing, ask a follow-up question instead of triggering the tool.",
        parametersSchema: JSON.stringify({
            type: "object",
            properties: {
                title: { type: "string", description: "The title of the project. If not explicitly provided, generate a concise and meaningful title based on the user's request." },
                description: { type: "string", description: "A clear description of the project's purpose, goals, and context. Expand based on the conversation if needed." },
                dueDate: { type: "string", description: "The project deadline in ISO 8601 format (YYYY-MM-DD). If not mentioned, omit this field." },
                tasks: {
                    type: "array",
                    description: "A list of initial tasks for the project. Can be empty if no tasks are specified or inferred.",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string", description: "Short title of the task." },
                            description: { type: "string", description: "Optional detailed description of the task." },
                            priority: { type: "string", enum: ["low", "normal", "high"], description: "Priority of the task." },
                            dueDate: { type: "string", description: "The tasks deadline in ISO 8601 format (YYYY-MM-DD). If not mentioned, omit this field." }
                        },
                        required: ["title"],
                        additionalProperties: false
                    }
                }
            },
            required: ["title", "description"],
            additionalProperties: false
        })
    },
    {
        name: "AddNewTask",
        description: "Trigger this action when the user intends to create a new task and add it to an existing project. If the user wants to add a task to a new project - create a new project with that task using the CreateProject action.",
        parametersSchema: JSON.stringify({
            type: "object",
            properties: {
                projectId: { type: "string", description: "The document ID of the project the task is added to. NOT THE PROJECT TITLE. The document ID that RavenDB can use to load the document. If you don't know what the ID is, ask for it." },
                projectTitle: { type: "string", description: "The title of the project so the user would know which project is being updated." },
                task: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "Short title of the task." },
                        description: { type: "string", description: "Optional detailed description of the task." },
                        priority: { type: "string", enum: ["low", "normal", "high"], default: "normal", description: "Priority of the task." },
                        dueDate: { type: "string", description: "The tasks deadline in ISO 8601 format (YYYY-MM-DD). If not mentioned, omit this field." },
                        completed: { type: "boolean", description: "Is the task completed or not.", default: false }
                    },
                    required: ["title", "priority", "completed"],
                    additionalProperties: false
                }
            },
            required: ["projectId", "projectTitle", "task"],
            additionalProperties: false
        })
    },
    {
        name: "EditTask",
        description: "Trigger this action when the user intends to edit an existing task. Make sure you know the ID of the task to edit. You can use query tools to get the info you need.\nOnly fill the properties that the user wants to edit. Leave the other properties empty so the task won't change beyond what the user intended.",
        parametersSchema: JSON.stringify({
            type: "object",
            properties: {
                taskId: { type: "string", description: "The ID of the task to edit." },
                currentTitle: { type: "string", description: "The current title of the task to display to the user which task is being edited." },
                updates: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "Short title of the task." },
                        description: { type: "string", description: "Optional detailed description of the task." },
                        priority: { type: "string", enum: ["low", "normal", "high"], description: "Priority of the task." },
                        dueDate: { type: "string", description: "The tasks deadline in ISO 8601 format (YYYY-MM-DD). If not mentioned, omit this field." },
                        completed: { type: "boolean", description: "Is the task completed or not." }
                    },
                    required: [],
                    additionalProperties: false
                }
            },
            required: ["taskId", "updates", "currentTitle"],
            additionalProperties: false
        })
    },
    {
        name: "EditProject",
        description: "Trigger this action when the user intends to edit an existing project. Make sure you know the ID of the project to edit. You can use query tools to get the info you need.\nOnly fill the properties that the user wants to edit. Leave the other properties empty so the project wont change beyond what the user intended.",
        parametersSchema: JSON.stringify({
            type: "object",
            properties: {
                projectId: { type: "string", description: "The ID of the project to edit." },
                currentTitle: { type: "string", description: "The current title of the project to display to the user which project is being eddited." },
                updates: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "The title of the project." },
                        description: { type: "string", description: "A clear description of the project's purpose, goals, and context." },
                        dueDate: { type: "string", description: "The project deadline in a common date format." }
                    },
                    required: [],
                    additionalProperties: false
                }
            },
            required: ["projectId", "updates", "currentTitle"],
            additionalProperties: false
        })
    },
    {
        name: "DeleteProject",
        description: "Trigger this action when the user intends to delete a project permanently.",
        parametersSampleObject: JSON.stringify({
            projectId: "The ID of the project to delete.",
            title: "The title of the project to delete."
        })
    },
    {
        name: "DeleteTask",
        description: "Trigger this action when the user intends to delete a task permanently.",
        parametersSampleObject: JSON.stringify({
            projectId: "The ID of the project the task belongs to.",
            projectTitle: "The title of the project the task belongs to.",
            taskId: "The ID of the task to be deleted.",
            taskTitle: "The title of the task to be deleted."
        })
    }
];

export type SetupPayload = {
    ravenUrl: string;
    ravenDb: string;
    openAiApiKey: string;
    mainModel: string;
    smallModel: string;
};

export async function runSetup(payload: SetupPayload): Promise<void> {
    const { ravenUrl, ravenDb, openAiApiKey, mainModel, smallModel } = payload;

    const store = new DocumentStore([ravenUrl], ravenDb);
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

        const tasksRes = await fetch(`${ravenUrl}/databases/${encodeURIComponent(ravenDb)}/tasks`);
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

        writeAppConfig({ ravenUrl, ravenDb, agentId: "assistant" });
    } finally {
        store.dispose();
    }
}
