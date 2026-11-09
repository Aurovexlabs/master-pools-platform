import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { cn } from "../../utils/cn";

/**
 * The text link with a trailing arrow used beside headings and in directories.
 * `to` is cast because these links target routes that are generated at build
 * time by the router plugin.
 */
export default function ArrowLink({
  to,
  label,
  className,
}: {
  to: string;
  label: string;
  className?: string;
}) {
  return (
    <Link to={to as never} className={cn("textlink", className)}>
      {label}
      <ArrowRight size={14} strokeWidth={2} aria-hidden="true" />
    </Link>
  );
}
