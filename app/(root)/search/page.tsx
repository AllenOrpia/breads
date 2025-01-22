import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { resourceUsage } from "process";
import UserCard from "@/components/cards/UserCard";

const page = async () => {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
    return;
  }

  const currentUserInfo = await fetchUser(user.id);
  if (!currentUserInfo?.onboarded) redirect("/onboarding");

  // FETCH USERS
  const res = await fetchUsers({
    userId: user.id,
    searchString: "",
    pageNumber: 1,
    pageSize: 25,
  });

  console.log(res)

  return (
    <section>
      <h1 className="head-text mb-10">Search</h1>

      <div className="mt-12 flex flex-col gap-10">
          {res.users.length === 0 ? (
            <p className="text-white">No users found</p>
          ) : (
            res.users.map((person) => (
              <>
                <UserCard 
                  key={person.id}
                  id={person.id}
                  name={person.name}
                  username={person.username}
                  imgUrl={person.image}
                  personType="User"
                />
              </>
            ))
          )}
      </div>
    </section>
  );
};

export default page;
