import {
  getIntegrationStatus,
  type IntegrationKey,
} from "@/lib/integrations/status";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LABELS: Record<IntegrationKey, string> = {
  supabase: "Supabase",
  firebase: "Firebase",
  ai: "AI",
  mcp: "MCP",
  webhooks: "Webhooks",
};

const DESCRIPTIONS: Record<IntegrationKey, string> = {
  supabase: "Database, auth, storage, realtime",
  firebase: "Auth, Firestore, FCM (client-side)",
  ai: "OpenAI-compatible chat completions",
  mcp: "Model Context Protocol tools",
  webhooks: "Signed inbound + outbound hooks",
};

/** Server component — reads env vars, renders one card per integration. */
export function IntegrationCards() {
  const status = getIntegrationStatus();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(Object.keys(status) as IntegrationKey[]).map((key) => {
        const integration = status[key];
        return (
          <Card key={key}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{LABELS[key]}</CardTitle>
                <Badge variant={integration.configured ? "default" : "outline"}>
                  {integration.configured ? "Connected" : "Not configured"}
                </Badge>
              </div>
              <CardDescription>{DESCRIPTIONS[key]}</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {integration.configured ? (
                <p>Ready to use — see {integration.docs}.</p>
              ) : (
                <>
                  <p>
                    Set{" "}
                    <code>{integration.envVars.join(", ")}</code> in{" "}
                    <code>.env.local</code>.
                  </p>
                  <p className="mt-1">Recipe: {integration.docs}</p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
