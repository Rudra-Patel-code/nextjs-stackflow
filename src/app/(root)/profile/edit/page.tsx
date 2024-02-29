// "use client";

import { getuserById } from "@/actions/user.actions";
import Profile from "@/components/forms/Profile";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");
  const mongoUser = await getuserById({ userId });

  return (
    <>
      <h1 className=" h1-bold">Edit Profile</h1>
      <div>
        <Profile mongoUser={JSON.stringify(mongoUser)} clerkId={userId} />
      </div>
    </>
  );
};

export default page;
