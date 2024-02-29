"use server";

import { connectToDB } from "@/lib/mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import Answer from "@/database/answer.model";
import { Question } from "@/database/question.model";
import { revalidatePath } from "next/cache";
import Interaction from "@/database/interaction.model";
import { User } from "@/database/user.model";

export const createAnswer = async (params: CreateAnswerParams) => {
  try {
    connectToDB();

    const { content, author, path, question } = params;

    const newAnswer = await Answer.create({
      content,
      author,
      path,
      question,
    });

    // add answer to the array of answer in question

    const questionDetails = await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    await Interaction.create({
      user: author,
      action: "answer",
      question,
      answer: newAnswer._id,
      tags: questionDetails.tags,
    });

    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAnswer = async (params: GetAnswersParams) => {
  try {
    connectToDB();

    const { questionId, sortBy, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    let sortOptions = {};

    switch (sortBy) {
      case "old":
        sortOptions = { createdAt: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "highestUpvotes":
        sortOptions = { upvotes: -1 };
        break;

      default:
        break;
    }

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalAnswers = await Answer.countDocuments({ question: questionId });

    const isNext = totalAnswers > skipAmount + answers.length;

    return { answers, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDB();
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    // Update Query to pass
    let updateQuery = {};

    // if already upvoted ---> remove from upvotes
    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } };
    }
    // if downvoted ---> remove from downvotes and add to upvote
    else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    }
    // If did not do anything yet---> just add to upvotes
    else {
      updateQuery = {
        $addToSet: { upvotes: userId },
      };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Increment author's reputation by +10 for upvoting a answer
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasupVoted ? -2 : 2 },
    });
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasupVoted ? -10 : 10 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDB();

    const { userId, answerId, hasdownVoted, hasupVoted, path } = params;

    let updateQuery = {};

    if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
      };
    } else {
      updateQuery = {
        $addToSet: { downvotes: userId },
      };
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });

    if (!answer) {
      throw new Error("Answer not found");
    }

    // Increment author's reputation by +10 for upvoting a answer
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasdownVoted ? -2 : 2 },
    });
    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasdownVoted ? -10 : 10 },
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export const deleteAnswer = async (params: DeleteAnswerParams) => {
  try {
    connectToDB();
    const { answerId, path } = params;

    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error(" Answer not found");
    }

    await Answer.deleteOne({ _id: answerId });
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } }
    );
    await Interaction.deleteMany({ answer: answerId });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
};
