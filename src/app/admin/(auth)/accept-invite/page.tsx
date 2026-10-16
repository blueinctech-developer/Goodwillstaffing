import type { Metadata } from "next";
import { TokenPage } from "../token-page";

// Reads the session (or a token) at request time; navigations may block.
export const instant = false;

export const metadata: Metadata = { title: "Accept invitation" };

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await searchParams;
  return <TokenPage purpose="invite" token={typeof token === "string" ? token : ""} />;
}
