import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowUpLeft } from "@phosphor-icons/react";

type Variant = "primary" | "secondary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: boolean;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-on-accent hover:opacity-90 shadow-[0_8px_28px_var(--brand-glow)]",
  secondary:
    "bg-snow text-ink hover:opacity-90",
  ghost:
    "bg-transparent text-snow border border-line-strong hover:bg-[color-mix(in_oklab,var(--surface-snow)_6%,transparent)]",
};

export function Button({
  variant = "primary",
  icon = false,
  children,
  className = "",
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={[
        "group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold whitespace-nowrap",
        "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none",
        styles[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      <span>{children}</span>
      {icon && (
        <span
          className={[
            "flex h-8 w-8 items-center justify-center rounded-full",
            "transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "group-hover:-translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
            variant === "ghost"
              ? "bg-[color-mix(in_oklab,var(--surface-snow)_10%,transparent)]"
              : "bg-[color-mix(in_oklab,var(--btn-on-accent)_12%,transparent)]",
          ].join(" ")}
        >
          <ArrowUpLeft size={16} weight="bold" />
        </span>
      )}
    </button>
  );
}
