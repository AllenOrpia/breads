import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser, getNotifications } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image";


const page = async () => {

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
    return;
  }

  const currentUserInfo = await fetchUser(user.id);
  if (!currentUserInfo?.onboarded) redirect("/onboarding");

  // GET NOTIFICATIONS

  const notifs = await getNotifications(currentUserInfo._id)

    return (
      <section>
          <h1 className="head-text mb-10">Activities</h1>

          <section className="mt-10 flex flex-col gap-4">
            {notifs.length > 0 ? (
              <>
                {notifs.map( (notif) => (
                  <Link
                    key={notif._id}
                    href={`/threads/${notif.parentId}`}
                  >
                    <article className="activity-card">
                        <Image 
                          src={notif.author.image}
                          alt="Profile picture"
                          width={20}
                          height={20}
                          className="rounded-full object-cover"
                        
                        />

                        <p className="!text-small-regular text-light-1">
                          <span className="mr-2 text-primary-500">
                            {notif.author.name}
                          </span>
                          replied to your thread
                        </p>
                    </article>
                  </Link>
                ))}
              </>
            ): 
            <p className="text-base-regular text-light-3">
              No notifications...
            </p>}
          </section>
      </section>
    )
  }
  
  export default page