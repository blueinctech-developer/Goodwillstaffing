import { ButtonLink } from "@/components/ui/Button";
import { listPosts } from "@/lib/content";
import { BLOG_PATH } from "@/lib/site";
import { PostGrid } from "./PostCard";

export async function LatestPosts({ count = 3 }: { count?: number }) {
  const posts = (await listPosts()).slice(0, count);
  return (
    <>
      <PostGrid posts={posts} />
      <div>
        <ButtonLink href={BLOG_PATH} variant="secondary" tall>
          View all articles
        </ButtonLink>
      </div>
    </>
  );
}
