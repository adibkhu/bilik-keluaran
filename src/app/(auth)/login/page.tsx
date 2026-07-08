import { Suspense } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { Footer } from "@/components/layout/footer";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <Link href="/feed" className="text-xl font-bold">
            {SITE_NAME}
          </Link>
          <p className="mt-2 text-sm text-muted">Welcome back to the community.</p>
        </div>
        <Card>
          <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
            <LoginForm />
          </Suspense>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
