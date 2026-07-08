import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold">Not found</h1>
      <p className="mt-2 text-sm text-muted">
        That page, profile, or post doesn’t exist.
      </p>
      <Link href="/feed" className="mt-6 text-sm text-accent hover:underline">
        Back to feed
      </Link>
    </main>
  );
}
