import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { tone, type Tone } from "@/lib/tone";

// One card system for the whole app. `Card` stays a plain div that accepts a
// className, so every existing `<Card className="p-6">` call site renders as
// before; the header/content parts below are opt-in structure for new and
// redesigned panels.

export function Card({
  className,
  interactive = false,
  accent,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  /** Lifts on hover. Use for cards that navigate or drill in. */
  interactive?: boolean;
  /** Adds a thin coloured rail down the left edge. */
  accent?: Tone;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line bg-surface shadow-card",
        "transition-[transform,box-shadow,border-color] duration-200 ease-out",
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card-hover",
        className
      )}
      {...props}
    >
      {accent && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 w-1",
            tone(accent).edge
          )}
        />
      )}

      {props.children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Usually an <AccentIcon />. */
  icon?: ReactNode;
  /** Right-aligned slot for a badge, filter or link. */
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex items-start justify-between gap-4",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon}

        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-ink">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm text-ink-muted">{description}</p>
          )}
        </div>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-ink-muted", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 border-t border-line pt-3 text-xs text-ink-subtle",
        className
      )}
      {...props}
    />
  );
}
