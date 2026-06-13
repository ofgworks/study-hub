import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { getStudy, studies } from "@/data/studies";

export function generateStaticParams() {
  return studies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getStudy(slug);

  return {
    title: study ? `${study.title} | Omer Study Hub` : "Calisma bulunamadi",
    description: study?.description,
  };
}

export default async function StudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getStudy(slug);

  if (!study) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <Header />
      <section className="mx-auto w-full max-w-6xl px-5 py-6">
        <Link href="/library" className="text-sm font-medium text-sky-700 hover:text-sky-900">
          Kutuphaneye don
        </Link>
        <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap gap-2 text-xs font-medium text-neutral-600">
            <span className="rounded-md bg-sky-50 px-2 py-1 text-sky-800">{study.course}</span>
            <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-800">{study.exam}</span>
            <span className="rounded-md bg-neutral-100 px-2 py-1 text-neutral-700">{study.type}</span>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold leading-tight text-neutral-950">{study.title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">{study.description}</p>
            </div>
            <a
              href={study.path}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-neutral-300 px-4 py-3 text-center text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
            >
              Yeni sekmede ac
            </a>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <iframe
            title={study.title}
            src={study.path}
            sandbox="allow-scripts allow-forms allow-popups"
            className="h-[78vh] w-full bg-white"
          />
        </div>
      </section>
    </main>
  );
}
