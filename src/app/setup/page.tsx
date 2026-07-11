import { getAppConfig } from "@/lib/config";
import SetupForm from "./SetupForm";

// getAppConfig() reads from the filesystem, which doesn't opt the route into
// dynamic rendering on its own — without this the prefilled config (and the
// reconfigure detection) would be frozen at build time.
export const dynamic = "force-dynamic";

export default function SetupPage() {
    const config = getAppConfig();
    return <SetupForm initialConfig={config ?? undefined} />;
}
