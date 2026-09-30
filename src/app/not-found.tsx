import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <p className="num font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">The page you’re looking for doesn’t exist or has moved.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/tools">Browse tools</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}
