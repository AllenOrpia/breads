
import { title } from "process";
import { Inter } from "next/font/google";
import '../globals.css'
import { ClerkProvider } from "@clerk/nextjs";

// Improve SEO
export const metadata = {
  title: "Breads",
  description: "A Next.js Meta Threads clone Application",
};

const inter = Inter({ subsets: ["latin"] });

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>
          <div className="w-full flex justify-center items-center min-h-screen">{children}</div>
        </body>
      </html>
    </ClerkProvider>
    
  );
};

export default layout;
