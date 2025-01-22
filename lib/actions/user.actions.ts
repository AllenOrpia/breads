"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../db";
import User from "../models/user.model";
import { getJsPageSizeInKb } from "next/dist/build/utils";
import { FilterQuery, SortOrder } from "mongoose";
import { skip } from "node:test";
import Thread from "../models/thread.model";
import ThreadsTab from "@/components/shared/ThreadsTab";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true } // Create a new document if no document matches the query but if it exists it will just be a simple update
    );

    if (path === "/profile/edit") {
      revalidatePath(path); // Revalidate the path to update the user's profile
    }
  } catch (error: any) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId });
  } catch (err: any) {
    throw new Error(`Failed to fetch user: ${err.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        {
          username: { $regex: regex },
        },
        {
          name: { $regex: regex },
        },
      ];
    }

    const sortOptions = {
      createdAt: sortBy,
    };
    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

      const totalUsersCount = await User.countDocuments(query);

      const users = await usersQuery.exec();

      const isNext = totalUsersCount > skipAmount + users.length

      return { users, isNext}

    
  } catch (err: any) {
    throw new Error(`Failed to fetch users: ${err.message}`);
  }
}


export async function getNotifications(userId: string) {
  try {
    connectToDB();

    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userId })

    // Collect all the child thread ids (replies) from the children
    const childThreadIds = userThreads.reduce( (acc, userThread) => {
      return acc.concat(userThread.children)
    }, [])

    const replies = await Thread.find({
      _id : { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: 'author',
      model: 'User',
      select: 'name image _id'
    })

    return replies

  } catch(err: any) {
    throw new Error(`Error getting notifcations: ${err.message}`)
  }
}