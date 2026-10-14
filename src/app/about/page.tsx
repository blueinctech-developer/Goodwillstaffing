import { AboutHero } from "@/components/about/AboutHero";
import { Mission } from "@/components/about/Mission";
import { PlatformStats } from "@/components/about/PlatformStats";
import { TeamTestimonials } from "@/components/about/TeamTestimonials";
import { CommitmentVideo } from "@/components/about/CommitmentVideo";
import { PeopleIncFamily } from "@/components/about/PeopleIncFamily";
import { JoinTeamCta } from "@/components/about/JoinTeamCta";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About us",
  description: "We are transforming the way healthcare hires.",
  path: "/about/",
  image: "/images/about/opengraph.png",
});

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <Mission />
      <PlatformStats />
      <TeamTestimonials />
      <CommitmentVideo />
      <PeopleIncFamily />
      <JoinTeamCta />
    </>
  );
}
