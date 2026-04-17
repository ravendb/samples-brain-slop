import { getAppConfig } from "@/lib/config";
import SetupForm from "./SetupForm";

export default function SetupPage() {
    const config = getAppConfig();
    return <SetupForm initialConfig={config ?? undefined} />;
}
