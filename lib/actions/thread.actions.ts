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
    connectToDB();

    const createThread = await Thread.create({
        text, author,
        community: null,

    });

    //  Update USER MODEEL
    await User.findByIdAndUpdate(author, {
        $push: { threads: createThread._id },
    })

    revalidatePath(path);
}
