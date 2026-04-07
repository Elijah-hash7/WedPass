import Link from "next/link";
import { PageShell } from "@/components/shells/PageShell";
import { Button } from "@/components/ui/button";

export default function UsherInfoPage() {
  return (
    <PageShell
      eyebrow="Usher lane"
      title="Use the protected usher link"
      description="Staff devices should open the usher link generated for the event."
      className="max-w-4xl"
    >
      <div className="card-surface bg-white/85 p-6 sm:p-8 space-y-4">
        <p className="text-sm text-[var(--color-ink-muted)]">
          The live usher screen is opened from a link that looks like{" "}
          <span className="font-mono text-[var(--color-ink-strong)]">/usher/your-token</span>. The
          token is sent to the backend automatically, so ushers never have to type it.
        </p>
        <Link href="/host">
          <Button variant="secondary">Back to host dashboard</Button>
        </Link>
      </div>
    </PageShell>
  );
}
