import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/top-nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-muted/30">
      <TopNav userEmail={user?.email} />
      <main className="mx-auto max-w-5xl overflow-x-hidden p-4 md:p-8">{children}</main>
    </div>
  );
}
