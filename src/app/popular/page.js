import PopularPosts from "@/components/post/PopularPosts";

export const metadata = {
  title: "Popular Posts - CardiNet",
  description: "See the most upvoted posts across all communities",
};

export default function PopularPage() {
  return <PopularPosts />;
}
