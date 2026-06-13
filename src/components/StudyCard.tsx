import Link from "next/link";
import type { Study } from "@/data/studies";

export function StudyCard({ study }: { study: Study }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2 text-xs font-medium text-neutral-600">
        <span className="rounded-md bg-sky-50 px-2 py-1 text-sky-800">{study.course}</span>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-800">{study.exam}</span>
        <span className="rounded-md bg-neutral-100 px-2 py-1 text-neutral-700">{study.level}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-7 text-neutral-950">{study.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-neutral-600">{study.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {study.topics.map((topic) => (
          <span key={topic} className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-600">
            {topic}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
        <span className="text-xs text-neutral-500">{new Intl.DateTimeFormat("tr-TR").format(new Date(study.date))}</span>
        <Link
          href={`/study/${study.slug}`}
          className="rounded-md bg-neutral-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Ac
        </Link>
      </div>
    </article>
  );
}
