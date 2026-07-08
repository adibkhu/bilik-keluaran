import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Footer } from "@/components/layout/footer";
import { Header, MobileNav } from "@/components/layout/nav";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function SignOutButton() {
  async function signOut() {
    "use server";
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/feed");
  }

  return (
    <form action={signOut}>
      <Button type="submit" variant="secondary">
        Sign out
      </Button>
    </form>
  );
}

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <Header
        isAuthenticated
        isAdmin={user.is_admin}
        username={user.username}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 sm:pb-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Your profile</h1>
          <Link
            href={`/profile/${user.username}`}
            className="text-sm text-accent hover:underline"
          >
            View public profile
          </Link>
        </div>
        <EditProfileForm profile={user} />
        <div className="mt-8">
          <SignOutButton />
        </div>
      </main>
      <Footer />
      <MobileNav isAuthenticated />
    </>
  );
}
