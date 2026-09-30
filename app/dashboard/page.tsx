import { requireUser } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrationCards } from "@/components/dashboard/integration-cards";

// Session-dependent page (requireUser reads cookies) — render dynamically.
export const instant = false;

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Signed in as {user.email} via {user.provider} auth
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
            {user.role}
          </Badge>
          {user.role === "admin" && (
            <Button asChild size="sm" variant="outline">
              <a href="/admin">Admin panel</a>
            </Button>
          )}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Integrations</h2>
        <IntegrationCards />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Features</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Feature slot 1 — build me during the hackathon
          </div>
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Feature slot 2 — build me during the hackathon
          </div>
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Feature slot 3 — build me during the hackathon
          </div>
        </div>
      </section>
    </div>
  );
}
