import { redirect } from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThread } from "@/lib/actions/thread.actions";
import Comment from "@/components/forms/Comment";

const page = async ({ params }: { params: Promise<{id: string}> }) => {

    const { id } = await params;
    if (!id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);

    if (!userInfo.onboarded) redirect("/onboarding");

    const post = await fetchThread(id);
   
  

  return (
    <section className="relative">
      <div>
        <ThreadCard
          key={post._id}
          id={post._id}
          currentUserId={user?.id || ""}
          parentId={post.parentId}
          content={post.text}
          author={post.author}
          community={post.community}
          createdAt={post.createdAt}
          comments={post.children}
        />
      </div>

      <div className="mt-7">
            <Comment 
              threadId={id}
              currentUserImg={userInfo?.image}
              currentUserId={JSON.stringify(userInfo._id)}
            />

      </div>

      <div className="mt-10">
      {post.children.map((childItem: any) => (
          <ThreadCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
};

export default page;
