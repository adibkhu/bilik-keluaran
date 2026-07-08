import { getCurrentUser } from "@/lib/auth";
import { Footer } from "@/components/layout/footer";
import { Header, MobileNav } from "@/components/layout/nav";
import { CreatePostForm } from "@/components/posts/create-post-form";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const user = await getCurrentUser();

  return (
    <>
      <Header
        isAuthenticated={!!user}
        isAdmin={user?.is_admin}
        username={user?.username}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 sm:pb-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Create post</h1>
        <CreatePostForm />
      </main>
      <Footer />
      <MobileNav isAuthenticated={!!user} />
    </>
  );
}
