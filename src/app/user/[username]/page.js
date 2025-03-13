import { notFound } from "next/navigation";
import UserProfileClient from "./client";

export async function generateMetadata({ params }) {
  // Await params before using its properties
  const resolvedParams = await params;
  const username = resolvedParams.username;

  return {
    title: `${username} - Cardinet`,
    description: `User profile for ${username}`,
  };
}

export default async function UserProfilePage(props) {
  // Resolve props before passing to client component
  const resolvedProps = {
    ...props,
    params: await props.params,
    searchParams: await props.searchParams,
  };

  return <UserProfileClient {...resolvedProps} />;
}
