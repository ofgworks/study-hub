import { Header } from "@/components/Header";
import { StudyCard } from "@/components/StudyCard";
import { courses, studies } from "@/data/studies";

type SearchParams = Promise<{
  course?: string;
  exam?: string;
  q?: string;
}>;

export default async function LibraryPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = await searchParams;
  const activeCourse = params?.course ?? "all";
  const activeExam = params?.exam ?? "all";
  const query = (params?.q ?? "").toLowerCase();

  const filtered = studies.filter((study) => {
    const matchesCourse = activeCourse === "all" || study.course === activeCourse;
    const matchesExam = activeExam === "all" || study.exam === activeExam;
    const searchable = [study.title, study.course, study.description, ...study.topics]
      .join(" ")
      .toLowerCase();
    return matchesCourse && matchesExam && searchable.includes(query);
  });

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <Header />
      <section className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Calisma kutuphanesi</p>
          <h1 className="mt-3 text-3xl font-semibold text-neutral-950">Ders materyalleri</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
            HTML calisma sitelerini ders, sinav turu ve konuya gore bul.
          </p>
        </div>

        <form className="mb-6 grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 md:grid-cols-[1fr_180px_180px_auto]">
          <input
            name="q"
            defaultValue={params?.q ?? ""}
            placeholder="Konu veya baslik ara"
            className="min-h-11 rounded-md border border-neutral-300 px-3 text-sm outline-none transition focus:border-sky-500"
          />
          <select
            name="course"
            defaultValue={activeCourse}
            className="min-h-11 rounded-md border border-neutral-300 px-3 text-sm outline-none transition focus:border-sky-500"
          >
            <option value="all">Tum dersler</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
          <select
            name="exam"
            defaultValue={activeExam}
            className="min-h-11 rounded-md border border-neutral-300 px-3 text-sm outline-none transition focus:border-sky-500"
          >
            <option value="all">Tum sinavlar</option>
            <option value="Vize">Vize</option>
            <option value="Final">Final</option>
            <option value="Genel">Genel</option>
          </select>
          <button className="min-h-11 rounded-md bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800">
            Filtrele
          </button>
        </form>

        {filtered.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((study) => (
              <StudyCard key={study.slug} study={study} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-sm text-neutral-600">
            Bu filtrelerle eslesen materyal yok.
          </div>
        )}
      </section>
    </main>
  );
}
