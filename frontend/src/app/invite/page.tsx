import Link from "next/link";
import { PageShell } from "@/components/shells/PageShell";
import { Button } from "@/components/ui/button";

export default function InviteInfoPage() {
  return (
    <PageShell
      eyebrow="Invitation"
      title="Use your host-generated invite link"
      description="This page is opened from the invite link the host shares with guests."
      className="max-w-4xl"
    >
      <div className="card-surface bg-white/85 p-6 sm:p-8 space-y-4">
        <p className="text-sm text-[var(--color-ink-muted)]">
          Guests should open a link that looks like <span className="font-mono text-[var(--color-ink-strong)]">/invite/your-token</span>.
          That token tells the backend which event this invitation belongs to.
        </p>
        <Link href="/host">
          <Button variant="secondary">Back to host dashboard</Button>
        </Link>
      </div>
    </PageShell>
  );
}
