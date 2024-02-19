"use server";

import { Question } from "@/database/question.model";
import { Tag } from "@/database/tag.model";
import { connectToDB } from "@/lib/mongoose";
import { CreateQuestionParams, GetQuestionsParams } from "./shared.types";
import { User } from "@/database/user.model";
import { revalidatePath } from "next/cache";

export const createQuestion = async (params: CreateQuestionParams) => {
  try {
    connectToDB();

    const { title, content, tags, author, path } = params;

    // create the question
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // create the tag or create theme
    for (const tag of tags) {
      const existingtag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        {
          $setOnInsert: { name: tag },
          $push: { questions: question._id },
        },
        { upsert: true, new: true }
      );

      tagDocuments.push(existingtag._id);
    }

    // update question

    await Question.findOneAndUpdate(
      { _id: question._id },
      { $push: { tags: { $each: tagDocuments } } }
    );

    revalidatePath(path);
    // TODO: something
  } catch (error) {
    console.log("create question error: " + error);
  }
};

export const getQuestions = async (params: GetQuestionsParams) => {
  try {
    connectToDB();

    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ createdAt: -1 });

    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
