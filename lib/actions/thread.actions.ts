"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../db";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connect } from "http2";


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
    });

    const posts = await postsQuery.exec();
    const isNext = totalPostsCount > pageNumber * pageSize;

    return { posts, isNext };
  } catch (err: any) {
    throw new Error(`Error fetching posts: ${err.message}`);
  }
}

export async function fetchThread(id: string) {
  connectToDB();

  try {
    // TODO POPULATE THE COMMUNITY
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err: any) {
    throw new Error(`Error fetching thread: ${err.message}`);
  }
}

export async function addComment({
  threadId,
  commentText,
  userId,
  path,
}: {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
}) {
  connectToDB();
  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) throw new Error("Thread not found");

    // Create the comment and add it to the original thread as a children
    const comment = await Thread.create({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedComment = await comment.save();

    originalThread.children.push(savedComment._id);
    await originalThread.save();

    revalidatePath(path);


  } catch (err: any) {
    throw new Error(`Error adding comment: ${err.message}`);
  }
}


export async function fetchUserThreads(userId: string) {
  
  try {
    connectToDB();
    
    // Fetch the user and populate the threads
    const threads = await User.findById(userId).populate({
      path: 'threads',
      model: Thread,
      populate: {
        path: 'children',
        model: Thread,
        populate: {
          path: 'author',
          model: User,
          select: 'name image id'
        }
      }
    })

    return threads;

  } catch(err: any) {
    throw new Error(`Error fetching user threads: ${err.message}`);
  }
}