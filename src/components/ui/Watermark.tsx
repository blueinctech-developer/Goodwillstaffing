import { MapleLeafIcon } from "@/components/icons";
import { HAND_LEFT, HAND_RIGHT } from "./logo-paths";
import styles from "./Watermark.module.css";

type WatermarkProps = {
  /** "mark": the Goodwill handshake; "leaf": the maple leaf. */
  shape: "mark" | "leaf";
  /** Corner it bleeds off; the parent must be position: relative with overflow hidden. */
  position?: "top-right" | "bottom-right" | "bottom-left" | "top-left";
  className?: string;
};

// A large, very faint brand shape tucked into a section corner. Decorative only.
export function Watermark({ shape, position = "bottom-right", className }: WatermarkProps) {
  const classes = `${styles.watermark} ${styles[position.replace("-", "_")]} ${className ?? ""}`;
  if (shape === "leaf") return <MapleLeafIcon className={classes} />;
  return (
    <svg viewBox="70 20 230 200" className={classes} aria-hidden="true" focusable="false">
      <path d={HAND_LEFT} fill="currentColor" />
      {HAND_RIGHT.map((d) => (
        <path key={d.slice(0, 24)} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}
