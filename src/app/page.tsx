import { Hero } from "@/components/home/Hero";
import { ProductFeatures } from "@/components/home/ProductFeatures";
import { EmployerLogos } from "@/components/home/EmployerLogos";
import { AppDownload } from "@/components/home/AppDownload";
import { Testimonials } from "@/components/home/Testimonials";
import { AsSeenOn } from "@/components/home/AsSeenOn";
import { JoinCta } from "@/components/home/JoinCta";
import { ExploreJobs } from "@/components/home/ExploreJobs";
import { exploreJobs, jobsByType } from "@/data/home";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Hero jobsByType={jobsByType} />
      <ProductFeatures />
      <EmployerLogos />
      <AppDownload />
      <Testimonials />
      <AsSeenOn />
      <JoinCta />
      <ExploreJobs title="Explore top healthcare jobs" tabs={exploreJobs} />
    </div>
  );
}
