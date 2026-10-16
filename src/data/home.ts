import {
  ABOUT_PATH,
  EMPLOYER_MENU,
  JOB_BOARD_URL,
  PORTAL_SIGNUP_URL,
  PROVINCE_LINKS,
  REQUEST_STAFFING_PATH,
  type NavLink,
} from "@/lib/site";

// Homepage copy from goodwillstaffing.ca. There is no live jobs feed; like the
// live homepage, every job-type card opens the LaborEdge job board.

export type EmploymentType = "Travel" | "Permanent" | "Local Contract" | "Per Diem / PRN" | "Locum Tenens";

export type JobType = {
  employmentType: EmploymentType;
  label: string;
  description: string;
  href: string;
};

export const JOB_TYPES: JobType[] = [
  {
    employmentType: "Permanent",
    label: "Staff Positions",
    description: "Full-time, permanent roles",
    href: JOB_BOARD_URL,
  },
  {
    employmentType: "Travel",
    label: "Travel Nursing",
    description: "Temporary nursing assignments",
    href: JOB_BOARD_URL,
  },
  {
    employmentType: "Locum Tenens",
    label: "Locum tenens",
    description: "Temporary professionals roles",
    href: JOB_BOARD_URL,
  },
  {
    employmentType: "Per Diem / PRN",
    label: "Per Diem/PRN",
    description: "On-demand jobs for more flexibility",
    href: JOB_BOARD_URL,
  },
  {
    employmentType: "Local Contract",
    label: "Local contracts",
    description: "Short-term assignments",
    href: JOB_BOARD_URL,
  },
];

export type ExploreLink = {
  label: string;
  value: string;
  items?: ExploreLink[];
};
export type ExploreTab = { label: string; items: ExploreLink[] };

const toExploreLinks = (links: NavLink[], prefix = ""): ExploreLink[] =>
  links.map((link) => ({ label: `${prefix}${link.text}`, value: link.href }));

export const exploreJobs: ExploreTab[] = [
  {
    label: "Travel nursing by province",
    items: toExploreLinks(PROVINCE_LINKS.travelNursing, "Travel nursing in "),
  },
  {
    label: "Staffing by province",
    items: toExploreLinks(PROVINCE_LINKS.staffing, "Healthcare staffing in "),
  },
  {
    label: "Jobs by role",
    items: toExploreLinks([
      { text: "RN Jobs", href: "/rn-jobs-in-canada/" },
      { text: "LPN Jobs", href: "/lpn-jobs-in-canada/" },
      { text: "PSW Jobs", href: "/psw-jobs-in-canada/" },
      { text: "HCA Jobs", href: "/hca-jobs-in-canada/" },
      {
        text: "Nurse Practitioner Jobs",
        href: "/nurse-practitioner-jobs-in-canada/",
      },
      { text: "Bilingual Nurse Jobs", href: "/bilingual-nurse-jobs-canada/" },
      { text: "Allied Health Jobs", href: "/allied-health-jobs-in-canada/" },
      {
        text: "Physician Locum Jobs",
        href: "/physician-locum-jobs-in-canada/",
      },
      { text: "Non-Clinical Jobs", href: "/non-clinical-healthcare-jobs/" },
    ]),
  },
  {
    label: "Facilities we staff",
    items: toExploreLinks(EMPLOYER_MENU.find((group) => group.title === "Facilities we staff")?.links ?? []),
  },
];

// The three tabs of the live "Step into your next adventure" block.
// The three tabs under the job-type cards. Headlines are the live homepage
// copy; badges and stats come from wording Goodwill already publishes.
export const PRODUCT_FEATURES = [
  {
    audience: "For Candidates",
    title: "We help you secure the job and pay you",
    accent: "deserve!",
    description:
      "If you’re a healthcare professional, we have your dream job waiting for you. Sign up with us, and get engaged!",
    cta: { text: "Apply now", href: PORTAL_SIGNUP_URL },
    badges: ["Travel & permanent roles", "Paid travel & housing", "Dedicated recruiter"],
    stat: { value: "4.9★", label: "Google rating" },
    image: "/media/2025/01/JOBSEEKER-GOODWILL.jpg",
  },
  {
    audience: "For Employers",
    title: "Find the right talent, faster, with",
    accent: "Goodwill.",
    description: "We have the right staff that will fit in just right within your organization!",
    cta: { text: "Request staffing", href: REQUEST_STAFFING_PATH },
    badges: ["Screened & vetted", "Rapid placement", "24/7 support"],
    stat: { value: "24/7", label: "Support & response" },
    image: "/media/2023/11/business-1-1.jpg",
  },
  {
    audience: "Job Specialties",
    title: "Specialized talent across every area of",
    accent: "healthcare.",
    description: "We are able to deploy our professionals with specialty in diverse working environment.",
    cta: { text: "Learn more", href: ABOUT_PATH },
    badges: ["Nursing", "Allied health", "PSWs & HCAs"],
    stat: { value: "9", label: "Provinces served" },
    image: "/media/2023/11/business-3-1.jpg",
  },
];

// Only figures Goodwill already publishes (reviews widget, staffing pages).
export const STATS = [
  { icon: "star", value: "4.9/5", label: "Google rating" },
  { icon: "map", value: "9", label: "Provinces we staff across Canada" },
  {
    icon: "clock",
    value: "24 hrs",
    label: "Response time on staffing requests",
  },
  {
    icon: "shield",
    value: "24/7",
    label: "Support for clients and candidates",
  },
] as const;

// Role pages rather than individual postings; the job board is on LaborEdge.
export const FEATURED_ROLES = [
  {
    title: "Registered Nurse (RN)",
    href: "/rn-jobs-in-canada/",
    tags: ["Travel", "Permanent"],
  },
  {
    title: "Licensed Practical Nurse (LPN)",
    href: "/lpn-jobs-in-canada/",
    tags: ["Travel", "Local"],
  },
  {
    title: "Personal Support Worker (PSW)",
    href: "/psw-jobs-in-canada/",
    tags: ["Full-time", "Part-time"],
  },
  {
    title: "Health Care Aide (HCA)",
    href: "/hca-jobs-in-canada/",
    tags: ["Contract", "Permanent"],
  },
] as const;

// About-page copy: Goodwill was founded by registered nurses.
export const WHY_GOODWILL = {
  title: "Connecting healthcare providers with",
  accent: "top-tier talent.",
  description:
    "As registered nurses with varied experience across healthcare settings, we understand staffing challenges first-hand, and we bring a wide network of medical professionals to serve our clients.",
  // Supplied by Goodwill: nurses in brand teal and orange scrubs.
  image: "/images/stock/goodwill-nurses-teal-orange.jpg",
};

export const CTA_BAND = {
  title: "Join our pool today.",
  description: "Join a network of healthcare professionals making a difference in communities across Canada.",
  // Supplied by Goodwill: a nurse in teal scrubs resting by a mountain lake.
  image: "/images/stock/goodwill-nurse-lake.jpg",
  points: ["Travel & permanent roles", "Support at every step", "Work across Canada", "A dedicated recruiter"],
};

// Google reviews shown on the live homepage (reviews widget), all 5 stars.
// Photos are the reviewers' Google profile pictures mirrored by the widget;
// reviewers with a real photo come first, Google letter placeholders last.
export const TESTIMONIALS = [
  {
    name: "Jayne Roberts",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_5441ee1bb50c63812e69b00b22000139.jpg",
    quote:
      "My experience at Goodwill has been positive, and this is largely due to Sindu. She is an amazing recruiter, pleasant, warm, genuine and honest. She is responsive, displays active listening and knows how to find information to provide what is best for her recruit. Due to her calming personality, Sindu was able to keep me calm while navigating the onboarding process. Thank you Sindu!!",
    profile: "https://www.google.com/maps/contrib/115573576062292687682/reviews",
  },
  {
    name: "Shannen B.",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_3663aad5a381a7e398bda306a5138a46.jpg",
    quote:
      "Been working with my recruiter Harini and Goodwill since day one of my travel nurse journey back in July 2022. Harini makes me feel supported, answers my questions about anything and everything in a timely manner, and whenever I encounter an issue, Harini and her team listens and resolves things efficiently and profesionally.",
    profile: "https://www.google.com/maps/contrib/108630855861251523260/reviews",
  },
  {
    name: "Tia S",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_b61c9a794377afb0210422f102e66f6c.jpg",
    quote:
      "I had an excellent recruiter (Nicole Wiens). The recruiter you have really does break or make your experience. Excellent communication and very responsive. I plan to do another contract with this company.",
    profile: "https://www.google.com/maps/contrib/104483443999082801479/reviews",
  },
  {
    name: "Jake Vidal",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_263d33c85158e304088f8d383f63a6c7.jpg",
    quote:
      "This is the best travel nursing company 🙌 Harini is the one who help me to process my travel nursing and she is the best she helped me from the beginning until the end of my processing , she is very hands on when it comes to the employee very respectful and she responds to your email right away if you needed help definitely would stay in this company 👍",
    profile: "https://www.google.com/maps/contrib/115129355939549192148/reviews",
  },
  {
    name: "Lucy Wanja",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_4d4c4da85e2032e71e099cd885b0ca77.jpg",
    quote:
      "I had such a great experience with Goodwill Health Services. From the very beginning, Sinduja made my onboarding process so smooth and stress-free. She was professional, patient, and incredibly supportive—always ready to answer my questions and guide me through each step. Her friendly approach really set the tone and made me feel comfortable right away. I truly appreciate the effort and care she put into making the whole experience easy and positive. Thank you, Goodwill Health Services, and a special thanks to Sinduja for making my start such a pleasant one!",
    profile: "https://www.google.com/maps/contrib/107327324618685488274/reviews",
  },
  {
    name: "Tessy Nwosu",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_8b8a241fd7b7fc4bdb427bd64229de42.jpg",
    quote:
      "I had a wonderful experience working with Goodwill Staffing, and I especially want to recognize my recruiter, Sinduja. From the very beginning, she was professional, approachable, and truly dedicated to supporting me throughout the process. She took the time to understand my skills and goals, guided me through each step, and made sure I always felt informed and confident. What stood out most was her responsiveness and genuine care—she went above and beyond to make sure I found the right opportunity. Her encouragement and clear communication made the entire experience smooth and stress-free. I’m very grateful for her support and highly recommend Sinduja to anyone looking for a recruiter who is not only skilled but also compassionate and committed to her candidates’ success.",
    profile: "https://www.google.com/maps/contrib/114904636385537218426/reviews",
  },
  {
    name: "Nana Akua",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_ea8ec2aa4bdac37e1f53f6b5152c24dd.jpg",
    quote:
      "Goodwill staffing is a trust worthy Agency. They have an amazing staffs. recruiters are amazing and they do a good job in getting you contracts quickly. I had the pleasure to have Divya as my recruiter. She worked tirelessly to secure a contract for me. At that time, I need a contract so badly and She was consistently reaching out to me to encourage me that she would do her best to get me a contract. Divya is very professional, and she responds to your messages quickly and always answers your questions. she will communicate with you from the time she finds you contract till the time you get to your placement and settle down. Even, throughout your contract, you can reach out to her with questions and she would respond very quickly. I really enjoyed my contract with Goodwill staffing and I am always looking forward to get new contracts from them. THANK YOU SOS MUCH DIVYA for making my experience working for Goodwill staffing a wonderful experience. I would always come back! Theresa",
    profile: "https://www.google.com/maps/contrib/100518981195375962763/reviews",
  },
  {
    name: "Hailey Vokey",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_f068573a4f8a8833809239873a37679a.jpg",
    quote:
      "Sinjua has been my recruiter, she has been working with me to find the best contacts and opportunities for me . She has been extremely kind,helpful and supportive throughout each time. I appreciate her time and kindness:)",
    profile: "https://www.google.com/maps/contrib/107878456714318859215/reviews",
  },
  {
    name: "Yvonne MC",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_0f8aef4f8b34454bf951390b168eb8a1.jpg",
    quote:
      "I am working with Goodwill staffing and Recruitment as Contract nurse in Alberta and overall I am having a great experience and they are very supportive. My recruiter, Sinduja Mandala she is a super star, responsive and upfront about everything, from onboarding process throughout the contract end also the extensions. Quick on replies to the messages, she is very supportive as needed and advocate for staff and make things ran smoothly. I would definitely recommend Goodwill staffing and Recruitment agency to others, their transparency and good communication with caregivers on fields, supportive and motivated. Five star",
    profile: "https://www.google.com/maps/contrib/108478126520518079830/reviews",
  },
  {
    name: "Nicolas",
    photo: "/media/2025/10/ChIJVX6AOPj_0UwRwQRtvvyBXLs_719b95604165feb6a92d2bcb19be8043.jpg",
    quote:
      "It's a great pleasure for me to be part of Goodwill Staffing & Recruitment. I was welcomed to this agency by one of best staff at Goodwill Sinduja Mandala to whom I'm sending my sincere gratitude for the professional way she does her job. She guided me through the process and collaborating with recruitment and payroll staff to accommodate me. So they do with any other staff applying to work with this great agency which has connections in many provinces. You will never regret working with Goodwill Staffing & Recruitment. If you are a healthcare worker looking for wonderful experiences Just apply! You are knocking at the right door.",
    profile: "https://www.google.com/maps/contrib/102976279304709664278/reviews",
  },
];
