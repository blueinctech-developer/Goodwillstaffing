import { SmartApplyLanding } from "@/components/smart-apply/SmartApplyLanding";
import { pageMetadata } from "@/lib/metadata";
import { SMART_APPLY_PATH } from "@/lib/site";

export const metadata = pageMetadata({
  title: "SmartApply - AI Meets Healthcare Staffing | Goodwill Staffing",
  description:
    "Your next healthcare opportunity is just a click away. SmartApply helps you connect faster with our recruiters, streamline your applications, and secure your ideal position.",
  path: SMART_APPLY_PATH,
});

export default function SmartApplyPage() {
  return <SmartApplyLanding />;
}
