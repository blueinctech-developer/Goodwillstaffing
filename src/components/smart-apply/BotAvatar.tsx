import { HAND_LEFT, HAND_RIGHT } from "@/components/ui/logo-paths";
import styles from "./BotAvatar.module.css";

/** GoodwillBot's avatar: the handshake mark from the Goodwill logo in a white disc. */
export function BotAvatar({ className }: { className?: string }) {
  return (
    <span className={`${styles.avatar} ${className ?? ""}`} aria-hidden="true">
      <svg viewBox="14 30 354 190" className={styles.mark} focusable="false">
        <path fill="#02646F" d={HAND_LEFT} />
        {HAND_RIGHT.map((d) => (
          <path key={d.slice(0, 24)} fill="#E5482E" d={d} />
        ))}
      </svg>
    </span>
  );
}
