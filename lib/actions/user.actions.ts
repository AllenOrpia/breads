"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../db";
import User from "../models/user.model";

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
