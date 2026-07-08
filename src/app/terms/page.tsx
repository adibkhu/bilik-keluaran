import { Footer } from "@/components/layout/footer";
import { SITE_NAME } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

        <section className="prose prose-invert mt-8 max-w-none space-y-4 text-sm leading-relaxed text-foreground/90">
          <p>
            By using {SITE_NAME}, you agree to these terms. This is a beta
            community platform operated for Malaysian music producers and fans.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Your account</h2>
          <p>
            You are responsible for your account and the content you post. You
            must provide accurate information and comply with our Community
            Guidelines.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Content</h2>
          <p>
            You retain ownership of content you post. By posting, you grant{" "}
            {SITE_NAME} a non-exclusive license to display and distribute your
            content on the platform. Do not post content you do not have rights
            to share.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Moderation</h2>
          <p>
            We may remove content or restrict accounts that violate our
            guidelines or these terms, without prior notice.
          </p>
          <h2 className="text-lg font-semibold text-foreground">Disclaimer</h2>
          <p>
            The platform is provided &quot;as is&quot; during beta. We do not
            guarantee uninterrupted service. Track previews and embeds are
            provided by third-party platforms.
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
