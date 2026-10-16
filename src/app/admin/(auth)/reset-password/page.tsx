import type { Metadata } from "next";
import { TokenPage } from "../token-page";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await searchParams;
  return <TokenPage purpose="reset" token={typeof token === "string" ? token : ""} />;
}
