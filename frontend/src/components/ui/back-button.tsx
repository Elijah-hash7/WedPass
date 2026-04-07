"use client";

import { useRouter } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
  fallbackHref?: string;
  onClick?: () => void;
  className?: string;
};

export function BackButton({
  fallbackHref = "/",
  onClick,
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label="Go back"
      title="Go back"
      onClick={handleClick}
      className={`h-12 w-12 rounded-2xl border-white/80 bg-white/80 shadow-[0_18px_40px_-26px_rgba(8,23,15,0.55)] backdrop-blur-xl ${className ?? ""}`}
    >
      <FiArrowLeft className="h-4 w-4" />
    </Button>
  );
}
