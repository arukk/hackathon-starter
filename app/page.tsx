import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";

/**
 * Landing page — intentionally empty.
 * Add hero content, screenshots, feature grid… during the hackathon.
 */

// The auth-aware header reads cookies — render this route dynamically.
export const instant = false;

export default function Home() {
  return (
    <div className="min-h-svh flex flex-col">
      <AppHeader />

      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-5 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Hackathon Starter
        </h1>
        <p className="text-muted-foreground max-w-md">
          Landing page — empty by design. Auth, dashboard, API, MCP and webhook
          scaffolding are ready to go.
        </p>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </main>

      <footer className="w-full border-t py-8 text-center text-xs text-muted-foreground">
        Built for the hackathon · See HACKATHON.md for integration recipes
      </footer>
    </div>
  );
}
