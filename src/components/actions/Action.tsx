import { Action, AddNewTaskArguments } from "@/models/action";
import CreateProjectAction from "./CreateProjectAction";
import AddNewTaskAction from "./AddNewTaskAction";
import { Project } from "@/models/project";

type ActionCardProps = {
    action: Action;
};

export default function ActionCard({ action }: ActionCardProps) {
    switch (action.name) {
        case "CreateProject":
            return <CreateProjectAction action={action as Action<Project>} />;
        case "AddNewTask":
            return <AddNewTaskAction action={action as Action<AddNewTaskArguments>} />;
        default:
            return <div>Unknown action: {action.name}</div>;
    }
}
