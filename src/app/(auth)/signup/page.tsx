import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { isBetaClosed } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";
import { Footer } from "@/components/layout/footer";

export default function SignupPage() {
  const betaClosed = isBetaClosed();
  const requiresInvite = Boolean(process.env.BETA_INVITE_CODE);

  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <Link href="/feed" className="text-xl font-bold">
            {SITE_NAME}
          </Link>
          <p className="mt-2 text-sm text-muted">
            Join producers and fans from KL, Shah Alam, Penang, JB, and beyond.
          </p>
          {betaClosed && (
            <p className="mt-2 text-sm text-orange-300">
              Beta signups are currently closed.
            </p>
          )}
        </div>
        <Card>
          <SignupForm betaClosed={betaClosed} requiresInvite={requiresInvite} />
        </Card>
      </main>
      <Footer />
    </div>
  );
}
