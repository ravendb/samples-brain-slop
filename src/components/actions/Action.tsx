import { Action} from "@/models/action";
import { AddNewTaskArguments, EditTaskArguments } from "@/models/task";
import CreateProjectAction from "./CreateProjectAction";
import AddNewTaskAction from "./AddNewTaskAction";
import EditTaskAction from "./EditTaskAction";
import EditProjectAction from "./EditProjectAction";
import { Project, EditProjectArguments } from "@/models/project";

type ActionCardProps = {
    action: Action;
};

export default function ActionCard({ action }: ActionCardProps) {
    switch (action.name) {
        case "CreateProject":
            return <CreateProjectAction action={action as Action<Project>} />;
        case "AddNewTask":
            return <AddNewTaskAction action={action as Action<AddNewTaskArguments>} />;
        case "EditTask":
            return <EditTaskAction action={action as Action<EditTaskArguments>} />;
        case "EditProject":
            return <EditProjectAction action={action as Action<EditProjectArguments>} />;
        default:
            return <div>Unknown action: {action.name}</div>;
    }
}
