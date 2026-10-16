import { Hero } from "@/components/home/Hero";
import { ProductFeatures } from "@/components/home/ProductFeatures";
import { StatsBar } from "@/components/home/StatsBar";
import { FeaturedRoles } from "@/components/home/FeaturedRoles";
import { WhyGoodwill } from "@/components/home/WhyGoodwill";
import { Testimonials } from "@/components/home/Testimonials";
import { JoinCta } from "@/components/home/JoinCta";
import { ExploreJobs } from "@/components/home/ExploreJobs";
import { JOB_TYPES, exploreJobs } from "@/data/home";
import { pageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Leading Healthcare Staffing & Recruitment in Canada",
  description:
    "We are the leading healthcare staffing and recruitment in Canada. Well staffed with highly skilled NPs, RNs, RPN, PSWs/HCAs and allied health professionals",
  path: "/",
});

export default function HomePage() {
  return (
    <div className={styles.page}>
      <Hero jobTypes={JOB_TYPES} />
      <ProductFeatures />
      <StatsBar />
      <FeaturedRoles />
      <WhyGoodwill />
      <Testimonials />
      <JoinCta />
      <ExploreJobs title="Explore healthcare jobs across Canada" tabs={exploreJobs} />
    </div>
  );
}
