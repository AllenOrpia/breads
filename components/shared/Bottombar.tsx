
'use client'

import { sidebarLinks } from '@/constants'
import Link from 'next/link'
import { usePathname, useRouter } from "next/navigation";
import Image from 'next/image';

const Bottombar = () => {
  const router = useRouter();
  const pathName = usePathname();
  return (
    <section className='bottombar'>
      <div className='bottombar_container'>
      {sidebarLinks.map((link) => {
          const isActive =
            (pathName.includes(link.route) && link.route.length > 1) ||
            pathName === link.route;

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`bottombar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                alt="link image"
                width={24}
                height={24}
              />
              <span className="text-subtle-medium text-light-1 max-sm:hidden">{link.label.split(/\s+./)[0]}</span>
            </Link>
          );
        })}
      </div>

    </section>
  )
}

export default Bottombar