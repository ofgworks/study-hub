export type Study = {
  slug: string;
  title: string;
  course: string;
  exam: "Vize" | "Final" | "Genel";
  level: "Temel" | "Orta" | "Ileri";
  type: "Ozet" | "Soru cozumu" | "Formul kagidi" | "Interaktif";
  topics: string[];
  path: string;
  date: string;
  description: string;
};

export const studies: Study[] = [
  {
    slug: "calculus-2-final-integrals",
    title: "Calculus 2 Final: Integral Teknikleri",
    course: "Calculus 2",
    exam: "Final",
    level: "Orta",
    type: "Interaktif",
    topics: ["Parcali integrasyon", "Trigonometrik integraller", "Uygunsuz integraller"],
    path: "/studies/calculus-2/final-integrals/index.html",
    date: "2026-06-09",
    description:
      "Final oncesi integral tekniklerini secme, kontrol etme ve kisa soru pratigi yapma sayfasi.",
  },
  {
    slug: "statik-denge-ozeti",
    title: "Statik: Denge Denklemleri Ozeti",
    course: "Statik",
    exam: "Vize",
    level: "Temel",
    type: "Ozet",
    topics: ["Serbest cisim diyagrami", "Moment", "Denge"],
    path: "/studies/statics/equilibrium/index.html",
    date: "2026-06-09",
    description:
      "Ornek kayit. HTML dosyasi eklendiginde karttan acilacak sekilde hazir.",
  },
  {
    slug: "termodinamik-birimler",
    title: "Termodinamik: Birim ve Ozellik Tablosu",
    course: "Termodinamik",
    exam: "Genel",
    level: "Temel",
    type: "Formul kagidi",
    topics: ["Birim donusumu", "Ozellikler", "Tablo okuma"],
    path: "/studies/thermodynamics/units/index.html",
    date: "2026-06-09",
    description:
      "Ornek kayit. Kendi HTML materyalini ayni klasor mantigiyla ekleyebilirsin.",
  },
];

export const courses = Array.from(new Set(studies.map((study) => study.course))).sort();

export function getStudy(slug: string) {
  return studies.find((study) => study.slug === slug);
}
