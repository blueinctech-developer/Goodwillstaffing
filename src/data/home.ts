import jobsByTypeSnapshot from "./jobs-by-type.json";
import exploreJobsSnapshot from "./explore-jobs.json";

// Job counts and pay ceilings are a snapshot of the live site's server props,
// taken 2026-10-13. Swap these imports for a cached fetch once the jobs API is
// reconnected.

export type EmploymentType =
  | "Travel"
  | "Permanent"
  | "Local Contract"
  | "Per Diem / PRN"
  | "Locum Tenens";

export type JobsByType = {
  employmentType: EmploymentType;
  jobCount: number;
  maxPay: string;
};

export type ExploreLink = { label: string; value: string; items?: ExploreLink[] };
export type ExploreTab = { label: string; items: ExploreLink[] };

export const jobsByType = jobsByTypeSnapshot as JobsByType[];
export const exploreJobs = exploreJobsSnapshot as ExploreTab[];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  Travel: "Travel contracts",
  Permanent: "Staff positions",
  "Local Contract": "Local contracts",
  "Per Diem / PRN": "Per Diem/PRN",
  "Locum Tenens": "Locum tenens",
};

export const browseJobsHref = (type: EmploymentType) =>
  `/browse-jobs/?refinementList%5BemploymentType%5D=${encodeURIComponent(type)}`;

export const PRODUCT_FEATURES = [
  {
    title: "Access to all healthcare jobs",
    description:
      "Search for healthcare jobs that match your needs and qualifications using industry-specific filters.",
  },
  {
    title: "Build your profile",
    description:
      "Create a profile to showcase your skills, experience, and education. We've got your back.",
  },
  {
    title: "Chat with recruiters",
    description:
      "Recruiters are highly responsive and help you navigate the job search process.",
  },
  {
    title: "Get multiple offers",
    description:
      "We provide pay transparency so you can confidently pick the best offer.",
  },
];

export const TESTIMONIALS = [
  {
    name: "Sally",
    title: "RN, CCRN",
    image: "Vivian_Lifestyle_Sally",
    quote:
      "At first, I thought Vivian was a new agency [it's not], but I realized I could look at a ton of jobs on one website and talk with a bunch of recruiters. I liked that I could contact a recruiter and talk about multiple jobs.",
  },
  {
    name: "Daniel",
    title: "PMHNP-BC",
    image: "Vivian_Lifestyle_Daniel",
    quote:
      "Vivian is the single most effective networking platform which truly connects nurses to their desired jobs. With Vivian, the sky is the limit.",
  },
  {
    name: "Victoria",
    title: "RN, BSN, CCRN",
    image: "Vivian_Studio_Victoria",
    quote: "I like that I’m able to look at job postings from LOTS of different companies.",
  },
];

// `mobileRow` splits the logos across the two rows shown below 768px;
// desktop shows every logo in a single row.
export const EMPLOYER_LOGOS = [
  { src: "/images/Trinity2x.png", alt: "Trinity Health", mobileRow: 2 },
  { src: "/images/MemorialHermann2x.png", alt: "Memorial Hermann Health", mobileRow: 2 },
  { src: "/images/UHealth2x.png", alt: "University of Miami Health", mobileRow: 2 },
  { src: "/images/Tenet2x.png", alt: "Tenet Health", mobileRow: 2 },
  { src: "/images/Supplemental.png", alt: "Supplemental Health Care", mobileRow: 2 },
  { src: "/images/Ingenovis.png", alt: "Ingenovis Health", mobileRow: 2 },
  { src: "/images/JacksonNurseProfessionals.png", alt: "Jackson Nurse Professionals", mobileRow: 1 },
  { src: "/images/lrsHealthcare.png", alt: "LRS Healthcare", mobileRow: 1 },
  { src: "/images/Epic.png", alt: "Epic Staffing", mobileRow: 1 },
  { src: "/images/Favorite.png", alt: "Favorite Healthcare Staffing", mobileRow: 1 },
  { src: "/images/AdventistHealth.png", alt: "Adventist Health", mobileRow: 1 },
] as const;

export const PRESS_LOGOS = [
  { src: "/svg/press-forbes.svg", alt: "Forbes" },
  { src: "/svg/press-cnbc.svg", alt: "CNBC" },
  { src: "/svg/press-verywell.svg", alt: "verywell" },
  { src: "/svg/press-cnn.svg", alt: "CNN" },
  { src: "/svg/press-business-insider.svg", alt: "Business Insider" },
  { src: "/svg/press-usa-today.svg", alt: "USA Today" },
];

export const APP_RATINGS = {
  appStore: { rating: "4.8", count: "13.6k" },
  googlePlay: { rating: "4.4", count: "1.5k" },
};
