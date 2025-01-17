
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import PostThread from "@/components/forms/PostThread";


const page = async () => {

    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
        return;
    };

    const userInfo = await fetchUser(user.id);

    if (!userInfo.onboarded) redirect("/onboarding");

  return (
    <>
        <h1 className="head-text">Create thread</h1>
        <PostThread userId={userInfo._id.toString()} />
    </>
  )
}

export default page