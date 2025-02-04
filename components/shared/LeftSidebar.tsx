"use client";

import { sidebarLinks } from "@/constants";
import Link from "next/link";
import Image from "next/image";
import {  usePathname, useRouter } from "next/navigation";
import { SignOutButton, SignedIn, useAuth } from "@clerk/nextjs";



const LeftSidebar = () => {
  const router = useRouter();
  const pathName = usePathname();
  const { userId, isLoaded } = useAuth();
  
  
  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive =
            (pathName.includes(link.route) && link.route.length > 1) ||
            pathName === link.route;

            if (link.route === "/profile" && isLoaded) link.route = `${link.route}/${userId}`;
          
          return (
            <Link
              href={link.route}
              key={link.label}
              className={`leftsidebar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                alt="link image"
                width={24}
                height={24}
              />
              <span className="text-light-1 max-lg:hidden">{link.label}</span>
            </Link>
          );
        })}
      </div>
        <div className="mt-10 px-6">
          <SignedIn>
            <SignOutButton redirectUrl="/sign-in" >
              <div className="flex cursor-pointer gap-4 p-4">
                <Image
                  src="/assets/logout.svg"
                  alt="logout"
                  width={24}
                  height={24}
                />
                <span className="text-light-2 max-lg:hidden ">Log Out</span>
              </div>
            </SignOutButton>
          </SignedIn>

        </div>
    </section>
  );
};

export default LeftSidebar;
