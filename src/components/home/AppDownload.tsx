/* eslint-disable @next/next/no-img-element -- store badge vectors */
import { StarIcon } from "@/components/icons";
import { ResponsivePicture } from "@/components/ui/ResponsivePicture";
import { APP_RATINGS } from "@/data/home";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/site";
import styles from "./AppDownload.module.css";

const STORES = [
  {
    href: APP_STORE_URL,
    label: "Download Vivian on the App Store",
    badge: "/svg/badge-app-store.svg",
    width: 121,
    store: "Apple App store",
    ...APP_RATINGS.appStore,
  },
  {
    href: GOOGLE_PLAY_URL,
    label: "Download Vivian on the Google Play Store",
    badge: "/svg/badge-google-play.svg",
    width: 140,
    store: "Google Play store",
    ...APP_RATINGS.googlePlay,
  },
];

export function AppDownload() {
  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        <h2 className={styles.title}>
          Thousands of
          <br />
          <span className={styles.italic}>healthcare jobs</span>
          <br />
          in your pocket
        </h2>
        <div className={styles.stores}>
          {STORES.map((store) => (
            <div key={store.href}>
              <a href={store.href} className={styles.badge} aria-label={store.label}>
                <img src={store.badge} alt="" width={store.width} height={32} />
              </a>
              <div className={styles.rating}>
                <div className={styles.score}>
                  <p aria-label={`${store.rating} out of 5 ${store.store} rating`}>{store.rating}</p>
                  <StarIcon className={styles.star} />
                </div>
                <p>{store.count} Ratings</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.media}>
        <ResponsivePicture
          name="PhoneInHand-1-homepage"
          alt="A nurse browsing Vivian jobs using a phone."
          className={styles.image}
          width={3255}
          height={1938}
          breakpoints={[
            { minWidth: 1024, density: "@3x" },
            { minWidth: 768, density: "@2x" },
          ]}
          fallback="@1x"
        />
      </div>
    </section>
  );
}
