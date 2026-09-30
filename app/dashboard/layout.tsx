import { AppHeader } from "@/components/app-header";

// Session-dependent route (header + page read cookies) — render dynamically.
export const instant = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-5xl mx-auto p-5 md:p-8">
        {children}
      </main>
    </div>
  );
}
