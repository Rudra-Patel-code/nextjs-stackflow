"use client";
import { deleteAnswer } from "@/actions/answer.actions";
import { deleteQuestion } from "@/actions/questions.actions";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

interface Props {
  itemId: string;
  type: string;
}

const EditDeleteAction = ({ itemId, type }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const handleEdit = () => {
    router.push(`/question/edit/${JSON.parse(itemId)}`);
  };
  const handleDelete = async () => {
    if (type === "Question") {
      await deleteQuestion({ questionId: JSON.parse(itemId), path: pathname });
    } else if (type === "Answer") {
      await deleteAnswer({ answerId: JSON.parse(itemId), path: pathname });
    }
  };

  return (
    <div className=" flex items-center justify-end  gap-3 max-sm:w-full ">
      {type === "Question" && (
        <Image
          src="/assets/icons/edit.svg"
          alt="edit"
          width={20}
          height={20}
          className=" cursor-pointer object-contain"
          onClick={handleEdit}
        />
      )}
      <Image
        src="/assets/icons/trash.svg"
        alt="delete"
        width={20}
        height={20}
        className=" cursor-pointer object-contain"
        onClick={handleDelete}
      />
    </div>
  );
};

export default EditDeleteAction;
