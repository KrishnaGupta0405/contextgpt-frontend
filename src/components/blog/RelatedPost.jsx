import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RelatedPost({ title, link }) {
  return (
    <Link
      href={link}
      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-md"
    >
      <h3 className="font-semibold leading-snug text-slate-900 group-hover:text-blue-600">
        {title}
      </h3>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
    </Link>
  );
}
