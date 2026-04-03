import { Action} from "@/models/action";
import CreateProjectAction from "./CreateProjectAction";
import AddNewTaskAction from "./AddNewTaskAction";
import EditTaskAction from "./EditTaskAction";
import EditProjectAction from "./EditProjectAction";
import DeleteProjectAction from "./DeleteProjectAction";
import DeleteTaskAction from "./DeleteTaskAction";

type ActionCardProps = {
    action: Action;
};

export default function ActionCard({ action }: ActionCardProps) {
    switch (action.name) {
        case "CreateProject":
            return <CreateProjectAction action={action as Action<'CreateProject'>} />;
        case "AddNewTask":
            return <AddNewTaskAction action={action as Action<'AddNewTask'>} />;
        case "EditTask":
            return <EditTaskAction action={action as Action<'EditTask'>} />;
        case "EditProject":
            return <EditProjectAction action={action as Action<'EditProject'>} />;
        case "DeleteProject":
            return <DeleteProjectAction action={action as Action<'DeleteProject'>} />;
        case "DeleteTask":
            return <DeleteTaskAction action={action as Action<'DeleteTask'>} />;
        default:
            return <div>Unknown action: {action.name}</div>;
    }
}
