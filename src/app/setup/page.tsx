import { redirect } from "next/navigation";
import { getAppConfig } from "@/lib/config";
import SetupForm from "./SetupForm";

export default function SetupPage() {
    if (getAppConfig()) redirect("/");
    return <SetupForm />;
}
