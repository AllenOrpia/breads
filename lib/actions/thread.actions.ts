"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../db";
import Thread from "../models/thread.model";
import User from "../models/user.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const createThread = await Thread.create({
      text,
      author,
      community: null,
    });

    //  Update USER MODEEL
    await User.findByIdAndUpdate(author, {
      $push: { threads: createThread._id },
    });

    revalidatePath(path);
  } catch (err: any) {
    throw new Error(`Error creating thread: ${err.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    // Calculate the skip value
    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch the posts that no parents (top-level threadds...)
    const postsQuery = Thread.find({
      parendId: {
        $in: [null, undefined],
      },
    })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "author",
        model: User,
      })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

      const totalPostsCount = await Thread.countDocuments({ 
        parentId: { $in: [null, undefined] },
      })

      const posts = await postsQuery.exec();
      const isNext = totalPostsCount > pageNumber * pageSize;

      return { posts, isNext }

  } catch (err: any) {
    throw new Error(`Error fetching posts: ${err.message}`);
  }
}
