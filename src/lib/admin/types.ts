// Shapes shared by admin Server Actions and the client components that call
// them. No server imports, so client code can use these.

export type ActionState =
  | { status: "idle" }
  | { status: "ok"; message: string; data?: Record<string, string> }
  | { status: "error"; message: string; errors?: Record<string, string> };

export const IDLE: ActionState = { status: "idle" };

export type MediaItem = {
  key: string;
  /** Path stored in content ("/media/2025/01/photo.jpg"). */
  path: string;
  /** Where the browser can load it now. */
  url: string;
  name: string;
  size: number;
  lastModified: string | null;
  kind: "image" | "video" | "pdf" | "other";
};
