import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";
export const metadata = {
  title: "ContextGPT | Contact Us",
  description: "Get in touch with the ContextGPT team — support, sales, or partnerships.",
  alternates: { canonical: "https://contextgpt.co/contact" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ContextGPT",
    title: "ContextGPT | Contact Us",
    description: "Get in touch with the ContextGPT team — support, sales, or partnerships.",
    url: "https://contextgpt.co/contact",
    images: [{ url: "/icons/Contextgpt_icon.svg", width: 1200, height: 630, alt: "Contact ContextGPT" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContextGPT | Contact Us",
    description: "Get in touch with the ContextGPT team.",
    images: ["/icons/Contextgpt_icon.svg"],
  },
};

export default function Contact() { 
  return (
    <div className="bg-white">
          <div className="bg-linear-to-b from-indigo-50/70 to-white py-4 sm:py-8 md-py--16 px-4 sm:px-6 lg:px-4">
            <AnimatedGridPattern
                numSquares={10}
                maxOpacity={0.1}
                duration={2}
                repeatDelay={1}
                height={180}
                width={180}
                className={cn(
                  "mask-[radial-gradient(500px_circle_at_center,white,transparent)]",
                  "inset-x-0 inset-y-[-20%] h-full "
                )}
              />
              {/* Hero */}
            <div className="p-32 flex justify-center items-center flex-col gap-4 ">
              <p className="text-center text-sm font-bold text-blue-600">Contact Us</p>
              <h1 className="text-center text-6xl">Contact Us</h1>
              <p className="text-center text-xl pt-4 text-gray-500">
                You can contact us at any time you like. We will get back to you as soon as possible.
              </p>
            </div>
          </div>
        <div className="mx-auto max-w-4xl px-4 pb-32 pt-8 text-left sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">Email</h2>
          <p className="mt-6 text-slate-600 text-lg">
            You can contact{" "}
            <span className="text-slate-800 font-semibold underline underline-offset-4">
              Krishna Gupta
            </span>
            , the founder of ContextGPT, directly at{" "}
            <a
              href="mailto:support@contextgpt.co"
              className="text-slate-800 underline font-semibold underline-offset-4 hover:text-blue-600"
            >
              support@contextgpt.co
            </a>
            . You will get a response as soon as possible.
          </p>
        </div>
      </div>
  );
}
