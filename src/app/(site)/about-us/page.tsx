import { AboutHero } from "@/components/about/AboutHero";
import { Mission } from "@/components/about/Mission";
import { ValueCards } from "@/components/about/ValueCards";
import { ConnectingTalent } from "@/components/about/ConnectingTalent";
import { CommitmentVideo } from "@/components/about/CommitmentVideo";
import { JoinTeamCta } from "@/components/about/JoinTeamCta";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About Us - Goodwill Staffing and Recruitment",
  description:
    "Goodwill staffing and recruitment is a healthcare agency dedicated to connecting qualified professionals with hospitals, clinics, and care facilities in Canada.",
  path: "/about-us/",
});

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <Mission />
      <ValueCards />
      <ConnectingTalent />
      <CommitmentVideo />
      <JoinTeamCta />
    </>
  );
}
