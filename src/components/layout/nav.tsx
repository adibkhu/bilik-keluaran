"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, User, Shield } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/create", label: "Create", icon: PlusCircle },
  { href: "/settings", label: "Profile", icon: User },
];

export function Header({
  isAuthenticated,
  isAdmin,
  username,
}: {
  isAuthenticated: boolean;
  isAdmin?: boolean;
  username?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/feed" className="font-bold tracking-tight text-foreground">
          {SITE_NAME}
        </Link>
        <nav className="hidden items-center gap-4 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={isAuthenticated || item.href === "/feed" ? item.href : "/login"}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                pathname.startsWith(item.href) ? "text-accent" : "text-muted",
              )}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-accent",
                pathname.startsWith("/admin") ? "text-accent" : "text-muted",
              )}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
          {!isAuthenticated && (
            <>
              <Link href="/login" className="text-sm text-muted hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-bg hover:bg-accent/90"
              >
                Sign up
              </Link>
            </>
          )}
          {isAuthenticated && username && (
            <Link
              href={`/profile/${username}`}
              className="text-sm text-muted hover:text-foreground"
            >
              @{username}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function MobileNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const href =
            isAuthenticated || item.href === "/feed" ? item.href : "/login";
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 text-xs",
                active ? "text-accent" : "text-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
