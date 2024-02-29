import { connectToDB } from "@/lib/mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import { User } from "@/database/user.model";
import { ITag, Tag } from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import { Question } from "@/database/question.model";
import Interaction from "@/database/interaction.model";

export const getTopInteractedTags = async (
  params: GetTopInteractedTagsParams
) => {
  try {
    connectToDB();

    const { userId } = params;

    const user = await User.findById(userId);

    if (!user) throw new Error("user not found");

    // TODO: find interactions of the user and group by tags to return array of tags
    const topInteractedTags = await Interaction.aggregate([
      { $match: { user: userId } }, // Filter interactions by user ID
      { $unwind: "$tags" }, // Unwind the tags array
      { $group: { _id: "$tags", count: { $sum: 1 } } }, // Group by tags and count occurrences
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tagDetails",
        },
      }, // Lookup tag details
      { $unwind: "$tagDetails" }, // Unwind the tag details array
      {
        $project: {
          name: "$tagDetails.name",
          description: "$tagDetails.description",
          count: 1,
        },
      }, // Project fields
      { $sort: { count: -1 } }, // Sort by count in descending order
    ]);

    return topInteractedTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllTags = async (params: GetAllTagsParams) => {
  try {
    connectToDB();
    const { searchQuery, filter, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Tag> = {};
    if (searchQuery) {
      query.$or = [
        {
          name: { $regex: new RegExp(searchQuery, "i") },
        },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "old":
        sortOptions = { createdAt: 1 };
        break;
      case "popular":
        sortOptions = { questions: -1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;

      default:
        sortOptions = { name: 1 };
        break;
    }

    const tags = await Tag.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalTags = await Tag.countDocuments(query);
    const isNext = totalTags > tags.length + skipAmount;

    if (!tags) {
      throw new Error("No Tags yet");
    }

    return { tags, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getQuestionsByTagId = async (
  params: GetQuestionsByTagIdParams
) => {
  try {
    connectToDB();

    const { tagId, searchQuery } = params;

    const tagFilter: FilterQuery<ITag> = { _id: tagId };

    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { createdAt: -1 },
        populate: [
          { path: "tags", model: Tag, select: "_id name" },
          { path: "author", model: User, select: "_id clerkId name picture" },
        ],
      },
    });

    if (!tag) {
      throw new Error("Tag not found");
    }

    const questions = tag.questions;

    return { tagTitle: tag.name, questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getPopularTags = async () => {
  try {
    connectToDB();
    // const popularTags = await Tag.find({}).sort({ questions: -1 }).limit(5);

    const popularTags = await Tag.aggregate([
      {
        $project: {
          name: 1,
          _id: 1,
          questions: {
            $size: "$questions",
          },
        },
      },
      {
        $sort: { questions: -1 },
      },
      { $limit: 5 },
    ]);

    // console.log(popularTags);
    return popularTags;
  } catch (error) {
    console.log(error);
  }
};
