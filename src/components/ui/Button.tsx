import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "dark";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  /** The 59px-tall CTA used in page sections; the default matches the nav. */
  tall?: boolean;
  fullWidth?: boolean;
  /** Use a white focus ring on dark backgrounds. */
  lightFocus?: boolean;
};

export function ButtonLink({
  variant = "primary",
  tall = false,
  fullWidth = false,
  lightFocus = false,
  className,
  ...rest
}: ButtonLinkProps) {
  const classes = [
    styles.button,
    styles[variant],
    tall && styles.tall,
    fullWidth && styles.fullWidth,
    lightFocus && styles.lightFocus,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Link className={classes} {...rest} />;
}
