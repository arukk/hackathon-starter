import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutButton } from "@/components/logout-button";

/**
 * Auth-aware top navigation shared by landing + dashboard + admin.
 * Server component — reads the unified session (demo or Supabase).
 */
export async function AppHeader() {
  const user = await getCurrentUser();

  return (
    <header className="w-full border-b">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between h-16 px-5 text-sm">
        <div className="flex items-center gap-5 font-semibold">
          <Link href="/">Hackathon Starter</Link>
        </div>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden md:inline text-muted-foreground">
                {user.email}
              </span>
              {user.role === "admin" && (
                <Button asChild size="sm" variant="ghost">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
