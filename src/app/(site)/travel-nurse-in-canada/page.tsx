import { notFound } from "next/navigation";
import { TravelNursing } from "@/components/travel/TravelNursing";
import { getPage, type FaqItem } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

const SLUG = "travel-nurse-in-canada";

export async function generateMetadata() {
  const page = await getPage(SLUG);
  return pageMetadata({
    title: page?.seo.title ?? "Travel Nursing in Canada | Goodwill Staffing & Recruitment",
    description:
      page?.seo.description ?? "Discover rewarding travel nursing opportunities across Canada with Goodwill Staffing & Recruitment.",
    path: `/${SLUG}/`,
    image: page?.seo.image?.src,
  });
}

// A designed page; its FAQs still come from the imported content (editable in the admin).
export default async function TravelNursingPage() {
  const page = await getPage(SLUG);
  if (!page) notFound();
  const faqs: FaqItem[] = page.blocks.flatMap((b) => (b.type === "faq" ? b.items : []));
  return <TravelNursing faqs={faqs} />;
}
