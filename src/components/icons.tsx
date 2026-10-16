import type { SVGProps } from "react";
import type { EmploymentType } from "@/data/home";

// Paths copied from the production vivian.com markup and bundle.

// Palette of the icons on goodwillstaffing.ca: teal line art, soft pink fill.
const BRAND_GREEN = "#02646F";
const BRAND_PINK = "#F9C0C0";

type IconProps = SVGProps<SVGSVGElement> & { size?: string | number };

function UiIcon({ size = "1em", children, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <UiIcon {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 8.58578L12 13.5858L17 8.58578L18.4142 10L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.58578 10L7 8.58578Z"
        fill="currentColor"
      />
    </UiIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <UiIcon {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.58579 17L14.5858 12L9.58578 7L11 5.58578L16.7071 11.2929C17.0976 11.6834 17.0976 12.3166 16.7071 12.7071L11 18.4142L9.58579 17Z"
        fill="currentColor"
      />
    </UiIcon>
  );
}

// The job-type cards use an off-centre chevron; kept as-is for fidelity.
export function ArrowRightIcon(props: IconProps) {
  return (
    <UiIcon {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.5858 17L21.5858 12L16.5858 7L18 5.58578L23.7071 11.2929C24.0976 11.6834 24.0976 12.3166 23.7071 12.7071L18 18.4142L16.5858 17Z"
        fill="currentColor"
      />
    </UiIcon>
  );
}

/** Straight arrow (line and head) for CTA buttons. */
export function ArrowIcon(props: IconProps) {
  return (
    <UiIcon {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </UiIcon>
  );
}

export function MapleLeafIcon(props: IconProps) {
  return (
    <UiIcon {...props}>
      <path
        d="M12 1.5l1.6 3.1 2-.8-.7 4.6 2.4-2 .7 1.7 3-.6-.9 3 1.5.8-4.4 3.5.6 1.8-5.2-.8.1 5.4h-1.4l.1-5.4-5.2.8.6-1.8-4.4-3.5 1.5-.8-.9-3 3 .6.7-1.7 2.4 2-.7-4.6 2 .8L12 1.5z"
        fill="currentColor"
      />
    </UiIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <UiIcon {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5858 12L4.29289 5.70711L5.70711 4.29289L12 10.5858L18.2929 4.29289L19.7071 5.70711L13.4142 12L19.7071 18.2929L18.2929 19.7071L12 13.4142L5.70711 19.7071L4.29289 18.2929L10.5858 12Z"
        fill="currentColor"
      />
    </UiIcon>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <UiIcon {...props}>
      <path
        d="M12.8904 1.54544C12.7196 1.2107 12.3755 1 11.9997 1C11.6239 1 11.2798 1.2107 11.109 1.54544L8.04279 7.55373L1.38104 8.61322C1.0099 8.67225 0.703187 8.93438 0.587056 9.2918C0.470925 9.64921 0.564986 10.0416 0.830553 10.3075L5.59726 15.0803L4.54631 21.7434C4.48776 22.1146 4.64228 22.4873 4.94631 22.7082C5.25035 22.9291 5.65256 22.9609 5.98752 22.7905L11.9997 19.732L18.012 22.7905C18.3469 22.9609 18.7491 22.9291 19.0532 22.7082C19.3572 22.4873 19.5117 22.1146 19.4532 21.7434L18.4022 15.0803L23.1689 10.3075C23.4345 10.0416 23.5285 9.64921 23.4124 9.2918C23.2963 8.93438 22.9896 8.67225 22.6184 8.61322L15.9567 7.55373L12.8904 1.54544Z"
        fill="currentColor"
      />
    </UiIcon>
  );
}

export function VivianMarkIcon(props: IconProps) {
  return (
    <UiIcon {...props}>
      <path
        d="M19.9631 8.41499C18.0155 8.41499 17.2739 9.6453 16.8567 10.4943L11.9707 20.4753H11.7621L7.01942 10.7567C6.17031 8.99511 5.60152 8.4264 4.75893 7.88213V7.41119H10.4811V7.88213C9.85359 8.35307 9.68084 8.56165 9.68084 8.97882C9.68084 9.34383 9.86337 9.81477 10.1779 10.4943L12.8866 16.1114L15.3948 10.6507C15.7094 9.97121 15.812 9.63227 15.812 9.29169C15.812 8.7686 15.3427 8.35144 14.6109 7.8805V7.40956H23.0873C21.2848 3.06029 17.0018 0 12 0C5.37172 0 0 5.37262 0 12C0 18.6274 5.37335 24 12 24C18.6266 24 24 18.6274 24 12C24 10.7501 23.8077 9.5459 23.454 8.41336H19.9631V8.41499Z"
        fill="currentColor"
      />
    </UiIcon>
  );
}

export function PauseGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true" {...props}>
      <line x1="0.5" y1="0" x2="0.5" y2="11.88" stroke="currentColor" strokeWidth="2" />
      <line x1="6.98" y1="0" x2="6.98" y2="11.88" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function PlayGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13.25 7.93301L5 12.6962C4.66667 12.8886 4.25 12.648 4.25 12.2631L4.25 2.73686C4.25 2.35196 4.66667 2.1114 5 2.30385L13.25 7.06699C13.5833 7.25944 13.5833 7.74056 13.25 7.93301Z"
        stroke="currentColor" fill="currentColor"
      />
    </svg>
  );
}

export function ThinChevronLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true" {...props}>
      <path d="M8 15L1 8L8 1" stroke="#3C3B3D" />
    </svg>
  );
}

export function ThinChevronRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true" {...props}>
      <path d="M1 1L8 8L1 15" stroke="#3C3B3D" />
    </svg>
  );
}

export function CircleArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="61" height="61" viewBox="0 0 61 61" fill="none" aria-hidden="true" {...props}>
      <circle cx="30.5" cy="30.5" r="29.5" stroke="#3C3B3D" strokeWidth="2" />
      <path
        d="M18.2929 30.2929C17.9024 30.6834 17.9024 31.3166 18.2929 31.7071L24.6569 38.0711C25.0474 38.4616 25.6805 38.4616 26.0711 38.0711C26.4616 37.6805 26.4616 37.0474 26.0711 36.6569L20.4142 31L26.0711 25.3431C26.4616 24.9526 26.4616 24.3195 26.0711 23.9289C25.6805 23.5384 25.0474 23.5384 24.6569 23.9289L18.2929 30.2929ZM41 30L19 30L19 32L41 32L41 30Z"
        fill="#3C3B3D"
      />
    </svg>
  );
}

export function CircleArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="61" height="61" viewBox="0 0 61 61" fill="none" aria-hidden="true" {...props}>
      <circle cx="30.5" cy="30.5" r="29.5" stroke="#3C3B3D" strokeWidth="2" />
      <path
        d="M42.7071 30.7071C43.0976 30.3166 43.0976 29.6834 42.7071 29.2929L36.3431 22.9289C35.9526 22.5384 35.3195 22.5384 34.9289 22.9289C34.5384 23.3195 34.5384 23.9526 34.9289 24.3431L40.5858 30L34.9289 35.6569C34.5384 36.0474 34.5384 36.6805 34.9289 37.0711C35.3195 37.4616 35.9526 37.4616 36.3431 37.0711L42.7071 30.7071ZM20 31L42 31L42 29L20 29L20 31Z"
        fill="#3C3B3D"
      />
    </svg>
  );
}

function Illustration({ children, size = 40, className }: { children: React.ReactNode; size?: number; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 64 64" width={size} height={size} className={className}>
      {children}
    </svg>
  );
}

function StaffIllustration() {
  return (
    <Illustration>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 7C14 4.79086 15.7909 3 18 3H46C48.2091 3 50 4.79086 50 7V32H64V64H0V32H14V7ZM28 62H36V46H28V62ZM38 62V44H26V62H16V7C16 5.89543 16.8954 5 18 5H46C47.1046 5 48 5.89543 48 7V62H38ZM50 62V34H62V62H50ZM14 34V62H2V34H14Z"
        fill={BRAND_GREEN}
      />
      <path d="M35 13H29V20H22V26H29V33H35V26H42V20H35V13Z" fill={BRAND_PINK} />
    </Illustration>
  );
}

function LocalIllustration() {
  return (
    <Illustration>
      <circle className="sonar-ring" cx="32" cy="25" r="9" fill="none" stroke={BRAND_PINK} strokeWidth="2" />
      <circle className="sonar-ring sonar-ring-late" cx="32" cy="25" r="9" fill="none" stroke={BRAND_PINK} strokeWidth="2" />
      <circle className="sonar-core" cx="32" cy="25" r="9" fill={BRAND_PINK} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M33.4249 61H44C44.5523 61 45 61.4477 45 62C45 62.5523 44.5523 63 44 63H20C19.4477 63 19 62.5523 19 62C19 61.4477 19.4477 61 20 61H30.5751C30.4908 60.9158 30.3998 60.8247 30.3025 60.7267C29.6677 60.0881 28.7625 59.1611 27.677 58.0043C25.5071 55.6917 22.6115 52.4546 19.7132 48.7603C16.8177 45.0695 13.9034 40.9019 11.7087 36.7291C9.52384 32.575 8 28.319 8 24.4762C8 11.4891 18.767 1 32 1C45.233 1 56 11.4891 56 24.4762C56 28.319 54.4762 32.575 52.2913 36.7291C50.0966 40.9019 47.1823 45.0695 44.2868 48.7603C41.3885 52.4546 38.4929 55.6917 36.323 58.0043C35.2375 59.1611 34.3323 60.0881 33.6975 60.7267C33.6002 60.8247 33.5092 60.9158 33.4249 61ZM10 24.4762C10 12.6368 19.8279 3 32 3C44.1721 3 54 12.6368 54 24.4762C54 27.84 52.6488 31.7528 50.5212 35.7981C48.4034 39.8248 45.5677 43.8874 42.7132 47.5258C39.8615 51.1609 37.0071 54.3522 34.8645 56.6358C33.7937 57.777 32.902 58.69 32.279 59.3168C32.179 59.4175 32.0858 59.5108 32 59.5965C31.9142 59.5108 31.821 59.4175 31.721 59.3168C31.098 58.69 30.2063 57.777 29.1355 56.6358C26.9929 54.3522 24.1385 51.1609 21.2868 47.5258C18.4323 43.8874 15.5966 39.8248 13.4788 35.7981C11.3512 31.7528 10 27.84 10 24.4762Z"
        fill={BRAND_GREEN}
      />
    </Illustration>
  );
}

function LocumIllustration() {
  return (
    <Illustration>
      <path d="M8 3C8 1.34315 9.34315 0 11 0H15C16.6569 0 18 1.34315 18 3C18 4.65685 16.6569 6 15 6H11C9.34315 6 8 4.65685 8 3Z" fill={BRAND_PINK} />
      <path d="M30 3C30 1.34315 31.3431 0 33 0H37C38.6569 0 40 1.34315 40 3C40 4.65685 38.6569 6 37 6H33C31.3431 6 30 4.65685 30 3Z" fill={BRAND_PINK} />
      <path d="M41 29C41 32.866 44.134 36 48 36C51.866 36 55 32.866 55 29C55 25.134 51.866 22 48 22C44.134 22 41 25.134 41 29Z" fill={BRAND_PINK} />
      <path
        d="M12 6V22C12 28.2907 16.8405 33.4508 23 33.9589V50C23 57.1797 28.8203 63 36 63C43.1797 63 49 57.1797 49 50V35.9291C48.6734 35.9758 48.3395 36 48 36C47.6605 36 47.3266 35.9758 47 35.9291V50C47 56.0751 42.0751 61 36 61C29.9249 61 25 56.0751 25 50V33.9589C31.1595 33.4508 36 28.2907 36 22V6H34V22C34 27.5228 29.5228 32 24 32C18.4772 32 14 27.5228 14 22V6H12Z"
        fill={BRAND_GREEN}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M44 29C44 31.2091 45.7909 33 48 33C50.2091 33 52 31.2091 52 29C52 26.7909 50.2091 25 48 25C45.7909 25 44 26.7909 44 29ZM48 31C46.8954 31 46 30.1046 46 29C46 27.8954 46.8954 27 48 27C49.1046 27 50 27.8954 50 29C50 30.1046 49.1046 31 48 31Z"
        fill={BRAND_GREEN}
      />
    </Illustration>
  );
}

// The job-type icons used on goodwillstaffing.ca (public/svg/job-types).
export const EMPLOYMENT_TYPE_ICONS: Record<EmploymentType, string> = {
  Permanent: "/svg/job-types/staff-positions.svg",
  Travel: "/svg/job-types/travel-nursing.svg",
  "Locum Tenens": "/svg/job-types/locum-tenens.svg",
  "Per Diem / PRN": "/svg/job-types/per-diem.svg",
  "Local Contract": "/svg/job-types/local-contracts.svg",
};

// Section icons in the same two-tone line style as the job-type illustrations.
function StarIllustration() {
  return (
    <Illustration>
      <path d="M32 6l7.6 16.2 17.4 2.1-12.8 12.1 3.3 17.4L32 45.1 16.5 53.8l3.3-17.4L7 24.3l17.4-2.1L32 6z" fill="none" stroke={BRAND_GREEN} strokeWidth="2.5" strokeLinejoin="round" />
      <path className="sonar-ring" d="M32 18l4 8.6 9.2 1.1-6.8 6.4 1.7 9.2L32 38.7l-8.1 4.6 1.7-9.2-6.8-6.4 9.2-1.1L32 18z" fill="none" stroke={BRAND_PINK} strokeWidth="1.5" strokeLinejoin="round" />
      <path className="sonar-ring sonar-ring-late" d="M32 18l4 8.6 9.2 1.1-6.8 6.4 1.7 9.2L32 38.7l-8.1 4.6 1.7-9.2-6.8-6.4 9.2-1.1L32 18z" fill="none" stroke={BRAND_PINK} strokeWidth="1.5" strokeLinejoin="round" />
      <path className="sonar-core" d="M32 18l4 8.6 9.2 1.1-6.8 6.4 1.7 9.2L32 38.7l-8.1 4.6 1.7-9.2-6.8-6.4 9.2-1.1L32 18z" fill={BRAND_PINK} />
    </Illustration>
  );
}

function ClockIllustration() {
  return (
    <Illustration>
      <circle cx="32" cy="32" r="25" fill="none" stroke={BRAND_GREEN} strokeWidth="2.5" />
      {/* Minute hand sweeps once a cycle, hour hand creeps: round-the-clock. */}
      <path className="clock-minute" d="M32 32V14" fill="none" stroke={BRAND_PINK} strokeWidth="3.5" strokeLinecap="round" />
      <path className="clock-hour" d="M32 32l10 6" fill="none" stroke={BRAND_PINK} strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.5" fill={BRAND_GREEN} />
    </Illustration>
  );
}

function ShieldIllustration() {
  return (
    <Illustration>
      <path d="M32 5l22 8v16c0 14.5-9.4 25.4-22 30-12.6-4.6-22-15.5-22-30V13l22-8z" fill="none" stroke={BRAND_GREEN} strokeWidth="2.5" strokeLinejoin="round" />
      <path className="draw-tick" pathLength={1} d="M22 32l7 7 14-15" fill="none" stroke={BRAND_PINK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </Illustration>
  );
}

function HeartIllustration() {
  return (
    <Illustration>
      <path d="M32 55S7 40.5 7 23.5C7 15 13.5 9 21 9c5 0 9 2.7 11 6.5C34 11.7 38 9 43 9c7.5 0 14 6 14 14.5C57 40.5 32 55 32 55z" fill="none" stroke={BRAND_GREEN} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M20 28h7l3-6 4 12 3-6h7" fill="none" stroke={BRAND_PINK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </Illustration>
  );
}

function PeopleIllustration() {
  return (
    <Illustration>
      <circle cx="32" cy="20" r="8" fill={BRAND_PINK} />
      <path d="M17 50c0-8.8 6.7-15 15-15s15 6.2 15 15" fill="none" stroke={BRAND_GREEN} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="13" cy="25" r="5.5" fill="none" stroke={BRAND_GREEN} strokeWidth="2.5" />
      <circle cx="51" cy="25" r="5.5" fill="none" stroke={BRAND_GREEN} strokeWidth="2.5" />
      <path d="M3 47c0-6 4-10.5 10-10.5M61 47c0-6-4-10.5-10-10.5" fill="none" stroke={BRAND_GREEN} strokeWidth="2.5" strokeLinecap="round" />
    </Illustration>
  );
}

export const SECTION_ICONS = {
  star: StarIllustration,
  clock: ClockIllustration,
  shield: ShieldIllustration,
  heart: HeartIllustration,
  people: PeopleIllustration,
  map: LocalIllustration,
  hospital: StaffIllustration,
  stethoscope: LocumIllustration,
} satisfies Record<string, () => React.JSX.Element>;

export type SectionIcon = keyof typeof SECTION_ICONS;
