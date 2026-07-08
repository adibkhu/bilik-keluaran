import { Footer } from "@/components/layout/footer";
import { SITE_NAME } from "@/lib/constants";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

        <section className="mt-8 space-y-4 text-sm leading-relaxed text-foreground/90">
          <p>
            {SITE_NAME} respects your privacy. This policy describes what data
            we collect and how we use it.
          </p>

          <h2 className="text-lg font-semibold text-foreground">Data we collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Account information: email, username, display name, profile details</li>
            <li>Content you post: text, images, track URLs, comments</li>
            <li>Usage data: basic logs for security and debugging</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">How we use data</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>To operate the platform and authenticate users</li>
            <li>To display your profile and posts to other users</li>
            <li>To enforce community guidelines and respond to reports</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground">Third parties</h2>
          <p>
            We use Supabase for authentication, database, and file storage.
            Track embeds may load content from Spotify, YouTube, SoundCloud, or
            Apple Music when you include those links.
          </p>

          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <p>
            You may request account deletion or data export by contacting the
            platform administrators.
          </p>

          <p className="text-muted">
            This is placeholder legal copy. Replace with proper legal review
            before public launch.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
