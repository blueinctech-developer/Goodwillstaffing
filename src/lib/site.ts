// Site-wide constants, recovered from the production vivian.com bundle.

export const SITE_URL = "https://www.vivian.com";
export const EMPLOYER_URL = "https://hire.vivian.com";
export const BLOG_URL = "https://www.vivian.com/community/";
export const EMPLOYER_BLOG_URL = "https://hire.vivian.com/blog";
export const PARTNERSHIPS_URL = "https://partnerships.vivian.com";
export const NEW_FEATURES_URL =
  "https://www.vivian.com/community/vivian-updates/new-candidate-features-august-2024";

export const CONTACT_EMAIL = "hello@vivian.com";
export const MEDIA_EMAIL = "media@vivian.com";

export const APP_STORE_URL =
  "https://apps.apple.com/us/app/vivian-find-healthcare-jobs/id1364643201";
export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.nursefly.NurseFlyMobile";

export const REGISTER_PATH = "/register/";
export const LOGIN_PATH = "/auth";

// The 14.5 MB hero loop ships with the app. The full-length video is 315 MB,
// too large for the repo or a static deploy, so it streams from Vivian's
// existing marketing CDN. Point these at new storage if that bucket moves.
export const HERO_CLIP_URL = "/videos/homepage-clipped-20230615.mp4";
export const HERO_FULL_VIDEO_URL =
  "https://marketing-assets.vivian.com/homepage/videos-202306/homepage-full-20230615.mp4";

export type NavLink = { text: string; href: string };

export const RESOURCES_LINKS: NavLink[] = [
  { text: "Salaries", href: "/salary/" },
  { text: "Certifications", href: "/certifications/" },
  { text: "Licenses", href: "/licensing/" },
  { text: "The Vivian Blog", href: BLOG_URL },
  { text: "New Features", href: NEW_FEATURES_URL },
  { text: "Giveaways / Deals", href: PARTNERSHIPS_URL },
  { text: "FAQ", href: "/faq/" },
  { text: "Contact Vivian", href: `mailto:${CONTACT_EMAIL}` },
];

export const TRENDING_JOBS_LINKS: NavLink[] = [
  { href: "/nursing/med-surg/travel/", text: "Travel Med Surg Jobs" },
  { href: "/nursing/er-emergency-room-nurse/travel/", text: "Travel Emergency Department Jobs" },
  { href: "/nursing/icu-nurse/travel/", text: "Travel ICU Nurse Jobs" },
  { href: "/nursing/home-health-nurse/travel/", text: "Travel Home Health Nurse Jobs" },
  { href: "/nursing/long-term-care-nurse/travel/", text: "Travel Long Term Care Jobs" },
  { href: "/nursing/or-operating-room-nurse/travel/", text: "Travel OR Nurse Jobs" },
  { href: "/nursing/psychiatric-nurse/travel/", text: "Travel Psychiatric Nursing Jobs" },
  { href: "/cna/", text: "Staff CNA Jobs" },
  { href: "/lpn-lvn/", text: "Staff LPN / LVN Jobs" },
  { href: "/nursing/travel/", text: "Travel Nursing Jobs" },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Candidates",
    links: [
      { text: "Locations", href: "/explore/" },
      { text: "Salaries", href: "/salary/" },
      { text: "Vivian blog", href: BLOG_URL },
      { text: "Sitemap", href: "/sitemap/" },
    ],
  },
  {
    title: "Employers",
    links: [
      { text: "For employers", href: EMPLOYER_URL },
      { text: "Healthcare facilities", href: `${EMPLOYER_URL}/facilities` },
      { text: "Staffing agencies", href: `${EMPLOYER_URL}/staffing-agencies` },
      { text: "Employer blog", href: EMPLOYER_BLOG_URL },
    ],
  },
  {
    title: "Company",
    links: [
      { text: "About", href: "/about/" },
      { text: "FAQ", href: "/faq/" },
      { text: "Careers", href: "/careers/" },
      { text: "Contact us", href: `mailto:${CONTACT_EMAIL}` },
      { text: "Media inquiries", href: `mailto:${MEDIA_EMAIL}` },
    ],
  },
];

export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/vivianhealthapp/", icon: "/svg/social-facebook.svg" },
  { name: "Instagram", href: "https://www.instagram.com/vivianhealthapp/", icon: "/svg/social-instagram.svg" },
  { name: "TikTok", href: "https://www.tiktok.com/@vivianhealth?lang=en", icon: "/svg/social-tiktok.svg" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/vivianhealth", icon: "/svg/social-linkedin.svg" },
];
