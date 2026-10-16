// Copy for /about-us/, taken from goodwillstaffing.ca/about-us/.
import { INTRO_YOUTUBE_ID } from "@/lib/site";

export const ABOUT_IMAGES = {
  heroArch: { src: "/media/2025/01/goodwill-home-683x1024.jpg", width: 683, height: 1024 },
  heroCircle: { src: "/media/2025/01/3a.jpg", width: 630, height: 630 },
  connecting: { src: "/media/2025/01/goodwill-laptop-683x1024.jpg", width: 683, height: 1024 },
  join: { src: "/media/2025/01/image.jpg", width: 896, height: 1152 },
};

export const VALUE_CARDS = [
  { title: "Our Mission", text: "To provide qualified professionals to meet your immediate labour needs." },
  { title: "Vision", text: "Provider of choice for healthcare organizations and professionals." },
  { title: "Core Values", text: "Excellence, continuous improvement, work life balance and reliability." },
];

export const CONNECTING_PARAGRAPHS = [
  "We are an incorporated company with expertise in providing staffing services across Canada. If you are an individual looking for quality care at home or are an institution looking for well-trained staff for your facility, we are here for you. Our goal is to provide solutions to your labour needs in line with your specifications.",
  "As registered nurses (RNs) with varying experiences in various healthcare institutions and different operational environments, we have a firsthand understanding of these staffing challenges and possess a wide network of medical professionals to serve our clients.",
];

export const ABOUT_VIDEO = {
  src: `https://www.youtube.com/embed/${INTRO_YOUTUBE_ID}`,
  title: "About Us: Goodwill Staffing & Recruitment",
};
