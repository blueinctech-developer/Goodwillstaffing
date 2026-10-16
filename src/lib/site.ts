// Site-wide constants for Goodwill Staffing & Recruitment, taken from the
// goodwillstaffing.ca WordPress menus, footer and contact blocks.

export const SITE_URL = "https://goodwillstaffing.ca";
export const SITE_NAME = "Goodwill Staffing & Recruitment";

export const CONTACT_EMAIL = "info@goodwillstaffing.ca";
export const CONTACT_PHONE = "1-343-309-5318";
export const CONTACT_PHONE_HREF = "tel:+13433095318";
export const ADDRESS_LINES = ["900 - 1000 Suite, 300 Terry Fox Dr", "Kanata, ON, K2K 0E3"];

// The job board, candidate sign-up and employee portal live on LaborEdge.
export const JOB_BOARD_URL = "https://nexus-leap.laboredge.com/goodwill/canadajobs";
export const PORTAL_SIGNIN_URL = "https://nexus-leap.laboredge.com/goodwill/signin";
export const PORTAL_SIGNUP_URL = "https://nexus-leap.laboredge.com/goodwill/signup";
export const PHYSICIAN_SITE_URL = "https://goodwillphysician.ca/";
export const GOOGLE_REVIEWS_URL =
  "https://search.google.com/local/reviews?placeid=ChIJVX6AOPj_0UwRwQRtvvyBXLs";
export const GOOGLE_WRITE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJVX6AOPj_0UwRwQRtvvyBXLs";

export const APPLY_PATH = "/apply-now/";
export const REQUEST_STAFFING_PATH = "/request-staffing/";
export const CONTACT_PATH = "/contact-us/";
export const BLOG_PATH = "/blog/";
export const TALENT_POOL_PATH = "/register-travel-nurse-jobs-canada/";
export const ABOUT_PATH = "/about-us/";

// Homepage hero: the short loop plays inline; "Watch video" opens the full cut.
export const HERO_CLIP_URL = "/media/2025/01/goodwill-slider.mp4";
export const HERO_FULL_VIDEO_URL = "/media/2025/01/small.mp4";
export const INTRO_YOUTUBE_ID = "qinBAj9GfkI";

export type NavLink = { text: string; href: string };

/** Menu icons come from the site's own set: a job-type SVG or a SECTION_ICONS key. */
export type NavIcon =
  | `/svg/job-types/${string}.svg`
  | "star"
  | "clock"
  | "shield"
  | "heart"
  | "people"
  | "map"
  | "hospital"
  | "stethoscope";

export type MenuLink = NavLink & {
  /** One-line hint shown under the link in the mega menu. */
  description?: string;
  /** Small orange pill after the label, e.g. "New". */
  badge?: string;
};

export type NavGroup = { title: string; icon?: NavIcon; links: MenuLink[] };

export type MegaMenu = {
  label: string;
  /** Lead column: what the panel covers and where its overview lives. */
  intro: { title: string; text: string; link: NavLink };
  /** Each column stacks one or more groups. */
  columns: NavGroup[][];
  /** Optional chip row along the bottom of the panel (provinces). */
  strip?: { title: string; links: NavLink[] };
  promo: { eyebrow: string; title: string; text: string; image: string; link: NavLink; badge?: string };
};

// Provinces in the order the live menus list them.
export const PROVINCE_LINKS = {
  travelNursing: [
    { text: "Alberta", href: "/travel-nursing-healthcare-jobs-in-alberta/" },
    { text: "British Columbia", href: "/travel-nursing-jobs-in-british-columbia/" },
    { text: "Saskatchewan", href: "/travel-nursing-jobs-in-saskatchewan/" },
    { text: "Manitoba", href: "/travel-nursing-jobs-in-manitoba/" },
    { text: "Ontario", href: "/travel-nursing-jobs-in-ontario/" },
    { text: "New Brunswick", href: "/travel-nursing-jobs-new-brunswick/" },
    { text: "Nova Scotia", href: "/travel-nursing-jobs-nova-scotia/" },
    { text: "Prince Edward Island", href: "/travel-nursing-jobs-in-prince-edward-island/" },
    { text: "Newfoundland & Labrador", href: "/travel-nursing-jobs-in-newfoundland-labrador/" },
  ],
  staffing: [
    { text: "Alberta", href: "/alberta/" },
    { text: "British Columbia", href: "/staffing-british-columbia/" },
    { text: "Saskatchewan", href: "/staffing-solutions-saskatchewan/" },
    { text: "Manitoba", href: "/staffing-manitoba/" },
    { text: "Ontario", href: "/staffing-solutions-ontario/" },
    { text: "New Brunswick", href: "/staffing-solutions-new-brunswick/" },
    { text: "Nova Scotia", href: "/nova-scotia/" },
    { text: "Prince Edward Island", href: "/prince-edward-island/" },
    { text: "Newfoundland & Labrador", href: "/newfoundland-and-labrador/" },
  ],
} satisfies Record<string, NavLink[]>;

// SmartApply: the chat lives at /ai-recruiter/ and the landing page at
// /smart-apply/. AI_RECRUITER_PATH and SMART_APPLY_PATH are declared at the end
// of this file, too late for these constants, so the paths are repeated.
const SMART_APPLY_HREF = "/ai-recruiter/";
const SMART_APPLY_LANDING_HREF = "/smart-apply/";

// Header navigation, mirroring goodwillstaffing.ca's main menu: Travel Nursing,
// Candidates, Client Solutions, Search Jobs, Company and SmartApply.
export const TRAVEL_NURSING_LINK: NavLink = { text: "Travel Nursing", href: "/travel-nurse-in-canada/" };
export const SMART_APPLY_LINK: MenuLink = { text: "SmartApply", href: SMART_APPLY_HREF, badge: "New" };

export const CANDIDATE_MENU: NavGroup[] = [
  {
    title: "Travel jobs",
    icon: "/svg/job-types/travel-nursing.svg",
    links: [
      {
        text: "Travel Nursing by Specialty",
        href: "/travel-nursing-jobs-by-specialty-in-canada/",
        description: "ICU, ER, OR, med-surg and more",
      },
      { text: "Travel Nursing by Province", href: "/travel-nursing-jobs-by-province/", description: "Contracts coast to coast" },
      {
        text: "Travel Allied Health by Province",
        href: "/travel-allied-health-jobs-by-province/",
        description: "Therapy, lab and imaging contracts",
      },
      { text: "Travel Allied Health by Specialty", href: "/travel-allied-health-jobs-by-specialty-2/" },
    ],
  },
  {
    title: "Permanent nursing",
    icon: "/svg/job-types/staff-positions.svg",
    links: [
      { text: "Nursing Jobs by Specialty", href: "/nursing-jobs-by-specialty/" },
      { text: "Nursing Jobs by Province", href: "/nursing-jobs-by-province/" },
      { text: "RN Jobs", href: "/rn-jobs-in-canada/" },
      { text: "LPN Jobs", href: "/lpn-jobs-in-canada/" },
      { text: "PSW Jobs", href: "/psw-jobs-in-canada/" },
      { text: "HCA Jobs", href: "/hca-jobs-in-canada/" },
      { text: "Nurse Practitioner Jobs", href: "/nurse-practitioner-jobs-in-canada/" },
      { text: "Bilingual Nurse Jobs", href: "/bilingual-nurse-jobs-canada/" },
    ],
  },
  {
    title: "Permanent allied health",
    icon: "heart",
    links: [
      { text: "Allied Health by Specialty", href: "/allied-health-jobs-by-specialty/" },
      { text: "Allied Health by Province", href: "/allied-health-jobs-by-province/" },
      { text: "Allied Health Jobs in Canada", href: "/allied-health-jobs-in-canada/" },
    ],
  },
  {
    title: "Other healthcare jobs",
    icon: "/svg/job-types/locum-tenens.svg",
    links: [
      { text: "Non-Clinical Jobs", href: "/non-clinical-healthcare-jobs/" },
      { text: "Healthcare Jobs Across Canada", href: "/healthcare-jobs-across-canada/" },
      { text: "Physician Locum Jobs", href: "/physician-locum-jobs-in-canada/" },
    ],
  },
];

export const EMPLOYER_MENU: NavGroup[] = [
  {
    title: "Client solutions",
    icon: "shield",
    links: [
      {
        text: "Staffing Solutions",
        href: "/healthcare-staffing-solutions-across-canada/",
        description: "Travel, contract and permanent staff",
      },
      {
        text: "Staffing Cost Calculator",
        href: "/staffing-cost-calculator/",
        description: "The true cost of an in-house hire",
      },
      { text: "Request Staffing", href: REQUEST_STAFFING_PATH, description: "Tell us the shifts you need filled" },
      { text: "Free Consultation", href: "/free-consultation/" },
      { text: "Workforce Data Hub", href: "/canada-healthcare-workforce-data-hub/" },
      { text: "Physician & Executive", href: "/goodwill-physician-executive-recruiting/" },
    ],
  },
  {
    title: "Facilities we staff",
    icon: "hospital",
    links: [
      { text: "Clinics", href: "/staffing-for-clinics/" },
      { text: "Long Term Care Homes", href: "/long-term-care-homes/" },
      { text: "Hospitals", href: "/staffing-for-hospital/" },
      { text: "Group Homes", href: "/staffing-for-group-homes/" },
      { text: "Rural & Remote", href: "/staffing-solutions-for-rural-remote/" },
      { text: "Telehealth", href: "/staffing-solutions-telehealth/" },
    ],
  },
];

export const SEARCH_JOBS_MENU: NavGroup[] = [
  {
    title: "Find your next role",
    icon: "star",
    links: [
      { text: "Jobs", href: JOB_BOARD_URL, description: "Every open role on our job board" },
      {
        text: "Physician & Executive",
        href: "/goodwill-physician-executive-recruiting/",
        description: "Physician and leadership search",
      },
      {
        text: "Travel Nursing Experience",
        href: "/travel-nurse-photo-video/",
        description: "Photos and stories from the road",
      },
    ],
  },
  {
    title: "Explore",
    icon: "map",
    links: [
      { text: "Goodwill Blog", href: "/category/goodwill-blog/", description: "Career advice for healthcare pros" },
      { text: "Location", href: "/location/", description: "Where we place professionals" },
    ],
  },
];

export const COMPANY_MENU: NavGroup[] = [
  {
    title: "Company",
    icon: "people",
    links: [
      { text: "About Us", href: ABOUT_PATH, description: "Who we are and how we work" },
      { text: "Contact", href: CONTACT_PATH, description: "Talk to our team" },
      { text: "Goodwill Staffing Blog", href: BLOG_PATH, description: "News, guides and spotlights" },
      { text: "Join Our Pool Today", href: TALENT_POOL_PATH, description: "Hear about new roles first" },
    ],
  },
  {
    title: "More",
    icon: "clock",
    links: [
      { text: "Careers", href: "/careers/" },
      { text: "FAQ", href: "/faqs/" },
      { text: "Candidate Newsletter", href: "/candidate-newsletter/" },
      { text: "Client Newsletter", href: "/client-newsletter/" },
    ],
  },
];

export const MEGA_MENUS: MegaMenu[] = [
  {
    label: "Candidates",
    intro: {
      title: "Healthcare jobs across Canada",
      text: "Travel, permanent and locum roles for nurses, allied health and physicians.",
      link: { text: "All healthcare jobs", href: "/healthcare-jobs-across-canada/" },
    },
    columns: [[CANDIDATE_MENU[0]], [CANDIDATE_MENU[1]], [CANDIDATE_MENU[2], CANDIDATE_MENU[3]]],
    strip: { title: "Travel nursing by province", links: PROVINCE_LINKS.travelNursing },
    promo: {
      eyebrow: "Talent pool",
      title: "Join our talent pool",
      text: "Register once and our recruiters match you to roles as they open.",
      image: "/media/2025/01/JOBSEEKER-GOODWILL-400x400.jpg",
      link: { text: "Join today", href: TALENT_POOL_PATH },
    },
  },
  {
    label: "Client Solutions",
    intro: {
      title: "Staffing for every care setting",
      text: "Qualified nurses, allied health and support staff, on your schedule.",
      link: { text: "Client solutions overview", href: "/healthcare-staffing-solutions-across-canada/" },
    },
    columns: [[EMPLOYER_MENU[0]], [EMPLOYER_MENU[1]]],
    strip: { title: "Staffing by province", links: PROVINCE_LINKS.staffing },
    promo: {
      eyebrow: "For employers",
      title: "Request staffing support",
      text: "Share your shifts and get vetted professionals fast, or estimate costs with our calculator first.",
      image: "/media/2025/01/client-solutions-710x473.jpg",
      link: { text: "Request staffing", href: REQUEST_STAFFING_PATH },
    },
  },
  {
    label: "Search Jobs",
    intro: {
      title: "Search open roles",
      text: "Browse live postings, or see what life on assignment looks like.",
      link: { text: "Open the job board", href: JOB_BOARD_URL },
    },
    columns: [[SEARCH_JOBS_MENU[0]], [SEARCH_JOBS_MENU[1]]],
    promo: {
      eyebrow: "Travel nursing",
      title: "See Canada while you nurse",
      text: "Travel contracts in every province, with a recruiter in your corner.",
      image: "/images/stock/goodwill-nurses-teal-orange.jpg",
      link: { text: "Explore travel nursing", href: TRAVEL_NURSING_LINK.href },
    },
  },
  {
    label: "Company",
    intro: {
      title: "Goodwill Staffing & Recruitment",
      text: "A Canadian healthcare agency connecting professionals with the facilities that need them.",
      link: { text: "About us", href: ABOUT_PATH },
    },
    columns: [[COMPANY_MENU[0]], [COMPANY_MENU[1]]],
    promo: {
      eyebrow: "SmartApply",
      badge: "New",
      title: "Apply in minutes with SmartApply",
      text: "Chat with our AI recruiter and get matched to roles that fit your licence and goals.",
      image: "/media/2025/01/goodwill-laptop-683x1024.jpg",
      link: { text: "Try SmartApply", href: SMART_APPLY_LANDING_HREF },
    },
  },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Candidates",
    links: [
      { text: "Travel Nursing", href: "/travel-nurse-in-canada/" },
      { text: "Jobs", href: JOB_BOARD_URL },
      { text: "Apply", href: PORTAL_SIGNUP_URL },
      { text: "Join Our Talent Pool", href: "/register-travel-nurse-jobs-canada/" },
      { text: "Candidate Newsletter", href: "/candidate-newsletter/" },
      { text: "Goodwill Blog", href: "/category/goodwill-blog/" },
    ],
  },
  {
    title: "Employers",
    links: [
      { text: "Client Solutions", href: "/healthcare-staffing-solutions-across-canada/" },
      { text: "Staffing Requests", href: REQUEST_STAFFING_PATH },
      { text: "SmartApply", href: SMART_APPLY_LANDING_HREF },
      { text: "Staffing Cost Calculator", href: "/staffing-cost-calculator/" },
      { text: "Client Newsletter", href: "/client-newsletter/" },
      { text: "Employer Blog", href: "/category/employer-blog/" },
    ],
  },
  {
    title: "Company",
    links: [
      { text: "About", href: "/about-us/" },
      { text: "Contact", href: CONTACT_PATH },
      { text: "Careers", href: "/careers/" },
      { text: "FAQ", href: "/faqs/" },
      { text: "Locations", href: "/location/" },
      // The live /events/ page 301s to the talent-pool sign-up.
      { text: "Events", href: TALENT_POOL_PATH },
    ],
  },
];

export const LEGAL_LINKS: NavLink[] = [
  { text: "Terms & Conditions", href: "/terms-and-conditions/" },
  { text: "Privacy Policy", href: "/privacy-policy/" },
  { text: "Cookie Policy", href: "/cookie-policy/" },
];

// Forms are protected by reCAPTCHA; Google asks for these links alongside.
export const RECAPTCHA_LINKS: NavLink[] = [
  { text: "Privacy Policy", href: "https://policies.google.com/privacy" },
  { text: "Terms of Service", href: "https://policies.google.com/terms" },
];

export const SOCIAL_LINKS = [
  { name: "Facebook", href: "https://www.facebook.com/GoodwillStaffing01/", icon: "/svg/social-facebook.svg" },
  { name: "Instagram", href: "https://www.instagram.com/goodwillstaffing_recruitment/", icon: "/svg/social-instagram.svg" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/goodwill-staffing-recruitment/", icon: "/svg/social-linkedin.svg" },
  { name: "YouTube", href: "https://www.youtube.com/channel/UCUfzxVZWISj8g1Je_r8Eg4g", icon: "/svg/social-youtube.svg" },
];

export const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/** SmartApply: the landing page and the GoodwillBot chat it links to. */
export const SMART_APPLY_PATH = "/smart-apply/";
export const AI_RECRUITER_PATH = "/ai-recruiter/";
