import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl md:text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-xl sm:text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
