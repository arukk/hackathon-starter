import { requireAdmin } from "@/lib/auth/session";
import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";

// Session-dependent admin route — render dynamically.
export const instant = false;

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <div className="min-h-svh flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto p-5 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Admin panel</h1>
            <Badge>{user.role}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Only admins see this page — the check runs server-side in{" "}
            <code>requireAdmin()</code> and again in the proxy.
          </p>
          {/* TODO(hackathon): admin features here (user list, feature flags, job runner…) */}
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Admin feature slot — build me during the hackathon
          </div>
        </div>
      </main>
    </div>
  );
}
