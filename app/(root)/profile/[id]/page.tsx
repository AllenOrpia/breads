import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import PostThread from "@/components/forms/PostThread";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";



const page = async ({ params }: { params: Promise<{id: string}> }) => {
    const user = await currentUser();
    const { id } = await params;

    if (!user) {
        redirect("/sign-in");
        return;
    };

    const profileInfo = await fetchUser(id);
    

    if (!profileInfo) {
        redirect("/404");
        return;
    }
 
    
    const currentUserInfo = await fetchUser(user.id);
    if (!currentUserInfo?.onboarded) redirect("/onboarding");

  return (
    <section>
        <ProfileHeader 
            accountId={profileInfo._id}
            authUserId={user.id}
            name={profileInfo.name}
            username={profileInfo.username}
            imgUrl={profileInfo.image}
            bio={profileInfo.bio}
        />

        <div className="mt-10 ">
            <Tabs defaultValue="threads" className="w-full">
                <TabsList className="tab">
                    { profileTabs.map( (tab) => (
                        <TabsTrigger 
                        key={tab.label}
                        value={tab.value}
                        className="tab"
                        >
                            
                            <Image 
                            src={tab.icon}
                            alt={tab.label}
                            width={24}
                            height={24}
                            className="objtext-contain"

                            />
                            <p className="max-sm:hidden">{tab.label}</p>

                            {tab.label === 'Threads' && (
                                <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
                                    {profileInfo?.threads?.length}
                                </p>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList> 

                { profileTabs.map( (tab) => (
                    <TabsContent
                        key={`content-${tab.label}`}
                        value={tab.value}
                        className="w-full text-light-1"
                    >
                        <ThreadsTab
                            currentUserId={user.id}
                            accountId={profileInfo._id}
                            accountType='User'
                        
                        />

                    </TabsContent>
                ))}
            </Tabs>
        </div>
    </section>
  )
}

export default page