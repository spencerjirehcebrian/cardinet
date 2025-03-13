"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import GroupHeader from "@/components/group/GroupHeader";
import GroupAbout from "@/components/group/GroupAbout";
import PostList from "@/components/post/PostList";

export default function GroupPage({ group }) {
  const [activeTab, setActiveTab] = useState("posts");

  if (!group) {
    notFound();
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <GroupHeader
        group={group}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className="mt-4">
        {activeTab === "posts" && <PostList groupId={group.id} />}
        {activeTab === "about" && <GroupAbout group={group} />}
      </div>
    </div>
  );
}
