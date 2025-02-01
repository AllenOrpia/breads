
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { resourceUsage } from "process";
import UserCard from "@/components/cards/UserCard";
import { fetchCommunities } from "@/lib/actions/community.actions";
import CommunityCard from "@/components/cards/CommunityCard";

const page = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
    return;
  }

  const currentUserInfo = await fetchUser(user.id);
  if (!currentUserInfo?.onboarded) redirect("/onboarding");

  // FETCH Communities

  const res = await fetchCommunities({
    searchString: "",
    pageNumber: 1,
    pageSize: 25,
  });

  console.log(res)

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>

      <div className="mt-12 flex flex-col gap-10">
          {res.communities.length === 0 ? (
            <p className="text-white">No users found</p>
          ) : (
            res.communities.map((community) => (
              <>
                <CommunityCard 
                  key={community.id}
                  id={community.id}
                  name={community.name}
                  username={community.username}
                  imgUrl={community.image}
                  bio={community.bio}
                  members={community.members}
                />
              </>
            ))
          )}
      </div>
    </section>
  );
};

export default page;