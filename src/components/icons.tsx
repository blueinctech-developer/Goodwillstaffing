import type { SVGProps } from "react";
import type { EmploymentType } from "@/data/home";

// Paths copied from the production vivian.com markup and bundle.

const BRAND_GREEN = "#124E3B";
const BRAND_PINK = "#EAAFB0";

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
      <line x1="0.5" y1="0" x2="0.5" y2="11.88" stroke="white" />
      <line x1="6.98" y1="0" x2="6.98" y2="11.88" stroke="white" />
    </svg>
  );
}

export function PlayGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M13.25 7.93301L5 12.6962C4.66667 12.8886 4.25 12.648 4.25 12.2631L4.25 2.73686C4.25 2.35196 4.66667 2.1114 5 2.30385L13.25 7.06699C13.5833 7.25944 13.5833 7.74056 13.25 7.93301Z"
        stroke="white"
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

function Illustration({ children, size = 40 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 64 64" width={size} height={size}>
      {children}
    </svg>
  );
}

function TravelIllustration() {
  return (
    <Illustration>
      <path d="M38.2263 15.6587L11.4028 6.34697C8.25589 5.25452 5.93881 9.33828 8.49076 11.4793L26.933 26.952L38.2263 15.6587Z" fill={BRAND_PINK} />
      <path d="M18.3795 36.111L2.59287 38.9339C0.561684 39.2972 0.344202 42.125 2.29596 42.7945L13.7708 46.7308L14.7641 43.5244C15.5853 40.8736 16.8072 38.3747 18.3795 36.111Z" fill={BRAND_PINK} />
      <path d="M17.2434 49.7257L21.184 61.4741C21.8449 63.4444 24.6998 63.2247 25.0514 61.1765L27.8289 44.9968C25.4789 46.6819 22.8655 47.9841 20.0851 48.8454L17.2434 49.7257Z" fill={BRAND_PINK} />
      <path d="M38.1479 35.1861L53.5209 53.5095C55.662 56.0615 59.7457 53.7444 58.6533 50.5975L49.3979 23.9361L38.1479 35.1861Z" fill={BRAND_PINK} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M61.734 4.49696C61.9243 3.50528 61.1215 2.60327 60.1144 2.67737C54.8971 3.06124 49.9917 5.30757 46.2925 9.0067L22.1702 33.129C19.1834 36.1159 16.9692 39.7854 15.7193 43.8203L14.4542 47.9041C14.2162 48.6726 14.9369 49.3933 15.7054 49.1552L19.7892 47.8901C23.824 46.6402 27.4936 44.4261 30.4804 41.4393L55.4211 16.4986C58.6544 13.2652 60.8436 9.13635 61.7055 4.64567L61.734 4.49696ZM59.9677 0.682759C62.2873 0.512089 64.1366 2.58974 63.6981 4.87394L63.6696 5.02265C62.7323 9.9063 60.3516 14.3965 56.8353 17.9128L31.8946 42.8535C28.6781 46.0701 24.7262 48.4545 20.381 49.8006L16.2972 51.0657C13.9917 51.7798 11.8296 49.6177 12.5438 47.3123L13.8089 43.2285C15.1549 38.8832 17.5394 34.9314 20.756 31.7148L44.8783 7.59249C48.9166 3.55415 54.272 1.10183 59.9677 0.682759Z"
        fill={BRAND_GREEN}
      />
    </Illustration>
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
      <path d="M44 25C44 31.6274 38.6274 37 32 37C25.3726 37 20 31.6274 20 25C20 18.3726 25.3726 13 32 13C38.6274 13 44 18.3726 44 25Z" fill={BRAND_PINK} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M33.4249 61H44C44.5523 61 45 61.4477 45 62C45 62.5523 44.5523 63 44 63H20C19.4477 63 19 62.5523 19 62C19 61.4477 19.4477 61 20 61H30.5751C30.4908 60.9158 30.3998 60.8247 30.3025 60.7267C29.6677 60.0881 28.7625 59.1611 27.677 58.0043C25.5071 55.6917 22.6115 52.4546 19.7132 48.7603C16.8177 45.0695 13.9034 40.9019 11.7087 36.7291C9.52384 32.575 8 28.319 8 24.4762C8 11.4891 18.767 1 32 1C45.233 1 56 11.4891 56 24.4762C56 28.319 54.4762 32.575 52.2913 36.7291C50.0966 40.9019 47.1823 45.0695 44.2868 48.7603C41.3885 52.4546 38.4929 55.6917 36.323 58.0043C35.2375 59.1611 34.3323 60.0881 33.6975 60.7267C33.6002 60.8247 33.5092 60.9158 33.4249 61ZM10 24.4762C10 12.6368 19.8279 3 32 3C44.1721 3 54 12.6368 54 24.4762C54 27.84 52.6488 31.7528 50.5212 35.7981C48.4034 39.8248 45.5677 43.8874 42.7132 47.5258C39.8615 51.1609 37.0071 54.3522 34.8645 56.6358C33.7937 57.777 32.902 58.69 32.279 59.3168C32.179 59.4175 32.0858 59.5108 32 59.5965C31.9142 59.5108 31.821 59.4175 31.721 59.3168C31.098 58.69 30.2063 57.777 29.1355 56.6358C26.9929 54.3522 24.1385 51.1609 21.2868 47.5258C18.4323 43.8874 15.5966 39.8248 13.4788 35.7981C11.3512 31.7528 10 27.84 10 24.4762Z"
        fill={BRAND_GREEN}
      />
    </Illustration>
  );
}

function PerDiemIllustration() {
  return (
    <Illustration>
      <path d="M61 8H3V23H61V8Z" fill={BRAND_PINK} />
      <path d="M13 29C11.8954 29 11 29.8954 11 31V36C11 37.1046 11.8954 38 13 38H19C20.1046 38 21 37.1046 21 36V31C21 29.8954 20.1046 29 19 29H13Z" fill={BRAND_PINK} />
      <path d="M45 29C43.8954 29 43 29.8954 43 31V36C43 37.1046 43.8954 38 45 38H51C52.1046 38 53 37.1046 53 36V31C53 29.8954 52.1046 29 51 29H45Z" fill={BRAND_PINK} />
      <path d="M27 31C27 29.8954 27.8954 29 29 29H35C36.1046 29 37 29.8954 37 31V36C37 37.1046 36.1046 38 35 38H29C27.8954 38 27 37.1046 27 36V31Z" fill={BRAND_PINK} />
      <path d="M13 45C11.8954 45 11 45.8954 11 47V52C11 53.1046 11.8954 54 13 54H19C20.1046 54 21 53.1046 21 52V47C21 45.8954 20.1046 45 19 45H13Z" fill={BRAND_PINK} />
      <path d="M27 47C27 45.8954 27.8954 45 29 45H35C36.1046 45 37 45.8954 37 47V52C37 53.1046 36.1046 54 35 54H29C27.8954 54 27 53.1046 27 52V47Z" fill={BRAND_PINK} />
      <path d="M14 2C14 1.44772 14.4477 1 15 1C15.5523 1 16 1.44772 16 2V16C16 16.5523 15.5523 17 15 17C14.4477 17 14 16.5523 14 16V2Z" fill={BRAND_GREEN} />
      <path d="M46 2C46 1.44772 46.4477 1 47 1C47.5523 1 48 1.44772 48 2V16C48 16.5523 47.5523 17 47 17C46.4477 17 46 16.5523 46 16V2Z" fill={BRAND_GREEN} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 23V55C3 58.866 6.13401 62 10 62H44.4321L60.727 44.6866L61 44.3984V23H59V42H47C44.2386 42 42 44.2386 42 47V60H10C7.23858 60 5 57.7614 5 55V23H3ZM58.6226 44L44 59.4378V47C44 45.3431 45.3431 44 47 44H58.6226Z"
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

export const EMPLOYMENT_TYPE_ICONS: Record<EmploymentType, () => React.JSX.Element> = {
  Travel: TravelIllustration,
  Permanent: StaffIllustration,
  "Local Contract": LocalIllustration,
  "Per Diem / PRN": PerDiemIllustration,
  "Locum Tenens": LocumIllustration,
};
