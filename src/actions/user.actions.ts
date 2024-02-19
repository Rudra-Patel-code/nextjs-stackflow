"use server";

import { User } from "@/database/user.model";
import { connectToDB } from "@/lib/mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import { Question } from "@/database/question.model";

// TODO: change params
export const getuserById = async (params: any) => {
  try {
    connectToDB();

    const { clerkId } = params;

    const user = await User.findOne({ clerkId });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createuser = async (params: CreateUserParams) => {
  try {
    connectToDB();

    const newUser = await User.create(params);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateuser = async (params: UpdateUserParams) => {
  try {
    connectToDB();

    const { clerkId, path, updateData } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, { new: true });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUser = async (params: DeleteUserParams) => {
  try {
    connectToDB();

    const { clerkId } = params;

    const user = await User.findOne({ clerkId });

    if (!user) {
      throw new Error("User not found!");
    }

    // delete user from database, and questions, answers, comments, etc.
    // const userQuestions = await Question.find({ author: user._id }).distinct(
    //   "_id"
    // );

    // delete user questions
    await Question.deleteMany({ author: user._id });

    const deleteduser = await User.findByIdAndDelete(user._id);

    return deleteduser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
