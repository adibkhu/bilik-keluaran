import { Footer } from "@/components/layout/footer";
import { SITE_NAME } from "@/lib/constants";

export default function GuidelinesPage() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold">Community Guidelines</h1>
        <p className="mt-2 text-muted">
          {SITE_NAME} is a music-only community for the Malaysian scene. These
          rules keep the space focused, safe, and useful for everyone.
        </p>

        <section className="mt-8 space-y-4 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-foreground">What belongs here</h2>
          <ul className="list-disc space-y-2 pl-5 text-foreground/90">
            <li>New releases and works-in-progress (with track links)</li>
            <li>Production talk, gear, techniques, and feedback requests</li>
            <li>Gigs, events, and scene news across Malaysia</li>
            <li>Opinions, debates, and memes about music</li>
            <li>Artist discovery and recommendations from the local scene</li>
          </ul>

          <h2 className="pt-4 text-lg font-semibold text-foreground">
            Zero tolerance
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-foreground/90">
            <li>Pornography or sexually explicit / 18+ content</li>
            <li>Harassment, hate speech, threats, or intimidation</li>
            <li>Spam, scams, or impersonation</li>
            <li>Off-topic lifestyle or general social content unrelated to music</li>
          </ul>

          <h2 className="pt-4 text-lg font-semibold text-foreground">Moderation</h2>
          <p className="text-foreground/90">
            Admins may remove content, suspend accounts, or permanently ban users
            at their discretion. Explicit content violations may result in an
            immediate permanent ban. Use the report button on posts and comments
            to flag issues.
          </p>

          <h2 className="pt-4 text-lg font-semibold text-foreground">Be real</h2>
          <p className="text-foreground/90">
            Casual language is welcome — this is a community, not a press release.
            Just keep it about music and treat people with respect.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
