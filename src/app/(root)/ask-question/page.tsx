import { getuserById } from "@/actions/user.actions";
import Question from "@/components/forms/Question";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const AskQuestion = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const mongoUser = await getuserById({ userId });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900 ">Ask a Question</h1>

      <div className="mt-9">
        <Question mongoUserId={JSON.stringify(mongoUser?._id)} type="Create" />
      </div>
    </div>
  );
};

export default AskQuestion;
