import { Hero } from "@/components/home/Hero";
import { ProductFeatures } from "@/components/home/ProductFeatures";
import { EmployerLogos } from "@/components/home/EmployerLogos";
import { AppDownload } from "@/components/home/AppDownload";
import { Testimonials } from "@/components/home/Testimonials";
import { AsSeenOn } from "@/components/home/AsSeenOn";
import { JoinCta } from "@/components/home/JoinCta";
import { ExploreJobs } from "@/components/home/ExploreJobs";
import { exploreJobs, jobsByType } from "@/data/home";
import { pageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Find Healthcare & Nursing Jobs | Vivian Health",
  description:
    "Take the first step to finding your next healthcare job. Explore thousands of job opportunities with all the information you need. It's your future. Come find it.",
  path: "/",
  image: "/images/2023-B2C-Open-Graph-Image.jpg",
});

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
