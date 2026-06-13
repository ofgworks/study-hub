import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { extractPdfImages } from "./pdf-images";
import { extractPdfText } from "./pdf-text";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  PageBreak,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

export type UserRole = "Admin" | "Takim Lideri" | "Uye";
export type DocumentKind = "sample_report" | "competition_brief" | "technical_doc" | "diagram" | "meeting_note";
export type ReportLanguage = "tr" | "en";
export type VisualCategory =
  | "block_diagram"
  | "flow_diagram"
  | "system_architecture"
  | "mechanical_design"
  | "electrical_design"
  | "software_architecture"
  | "test_setup"
  | "table_or_chart"
  | "cover_or_branding"
  | "other_visual";

export type Competition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
};

export type Team = {
  id: string;
  competitionId: string;
  name: string;
  slug: string;
  folderPath: string;
  createdAt: string;
  roles: UserRole[];
};

export type BrainDocument = {
  id: string;
  teamId: string;
  competitionId?: string;
  scope?: "team" | "competition";
  name: string;
  kind: DocumentKind;
  extension: string;
  sourcePath: string;
  storedPath?: string;
  size: number;
  importedAt: string;
  isSampleReport: boolean;
  summary: string;
  text: string;
  chunks: DocumentChunk[];
};

export type DocumentChunk = {
  id: string;
  documentId: string;
  heading: string;
  text: string;
  keywords: string[];
};

export type VisualAsset = {
  id: string;
  teamId: string;
  competitionId?: string;
  scope: "team" | "competition";
  documentId: string;
  documentName: string;
  title: string;
  category: VisualCategory;
  topic: string;
  summary: string;
  keywords: string[];
  sourcePath?: string;
  assetPath?: string;
  mimeType?: string;
  pageOrSection?: string;
  extractionMethod: "uploaded_image" | "docx_image" | "pdf_image" | "text_reference";
  confidence: "high" | "medium" | "low";
  extractedAt: string;
};

export type TemplateProfile = {
  teamId: string;
  language: ReportLanguage;
  sourceDocumentIds: string[];
  sourceDocumentNames: string[];
  headings: string[];
  toneRules: string[];
  evidenceRules: string[];
  layoutRules: string[];
  tableTemplates: ReportTableTemplate[];
  coverImagePath?: string;
  coverImageContentType?: string;
  updatedAt: string;
};

export type ReportTableTemplate = {
  title: string;
  headers: string[];
  sampleRows: string[][];
  sourceDocumentName: string;
};

export type ReportFormatProfile = {
  sourceDocumentIds: string[];
  sourceDocumentNames: string[];
  layoutRules: string[];
  tableTemplates: ReportTableTemplate[];
  coverImagePath?: string;
  coverImageContentType?: string;
};

export type ReportDraft = {
  id: string;
  teamId: string;
  title: string;
  competition: string;
  year: string;
  reportType: string;
  language: ReportLanguage;
  createdAt: string;
  status: "draft_needs_review";
  generationMode: "ai" | "fallback";
  sections: ReportSection[];
  missingInfo: string[];
  diagrams: DiagramSuggestion[];
  sources: SourceRef[];
  templateProfile?: ReportFormatProfile;
};

export type ReportSection = {
  title: string;
  body: string;
  sourceIds: string[];
};

export type SourceRef = {
  documentId: string;
  documentName: string;
  chunkId?: string;
  excerpt: string;
};

export type DiagramSuggestion = {
  title: string;
  type: "existing" | "mermaid";
  documentId?: string;
  path?: string;
  mermaid?: string;
  reason: string;
};

export type EngineeringDecision = {
  id: string;
  teamId: string;
  decision: string;
  previousState: string;
  newState: string;
  rationale: string;
  affectedSections: string[];
  dateOrVersion: string;
  createdAt: string;
};

export type QualityReview = {
  id: string;
  reportId: string;
  teamId: string;
  createdAt: string;
  overallScore: number;
  juryEvaluation: JuryEvaluationItem[];
  requirementMatches: RequirementMatch[];
  consistencyIssues: ConsistencyIssue[];
  decisionMemory: EngineeringDecision[];
  stageDifferences: StageDifference[];
  originalityRisks: OriginalityRisk[];
  deliveryChecklist: DeliveryChecklistItem[];
  sectionScores: SectionQualityScore[];
  technicalClaims: TechnicalClaimCheck[];
  testPlan: TestPlanItem[];
  riskAnalysis: RiskAnalysisItem[];
  visualQuality: VisualQualityItem[];
  teamResponsibilities: TeamResponsibilityItem[];
  scheduleItems: ScheduleItem[];
  languageImprovements: LanguageImprovement[];
  defenseQuestions: DefenseQuestion[];
  projectUpdateSummary: ProjectUpdateSummary;
  sourceConfidence: SourceConfidenceItem[];
  shorteningSuggestions: ShorteningSuggestion[];
};

export type JuryEvaluationItem = {
  title: string;
  score: number;
  strength: string;
  weakness: string;
  missingInfo: string;
  fixLocation: string;
  scoreBoostSuggestion: string;
  likelyQuestion: string;
  technicalAnswer: string;
};

export type RequirementMatch = {
  requirement: string;
  reportMatch: string;
  evidenceOrVisual: string;
  status: "Karsilanmis" | "Kismen karsilanmis" | "Raporda var ama kanit zayif" | "Projede var ama raporda anlatilmamis" | "Eksik" | "Sartnameyle celisiyor";
  missing: string;
};

export type ConsistencyIssue = {
  inconsistency: string;
  locations: string;
  risk: string;
  suggestedFix: string;
};

export type StageDifference = {
  section: string;
  previousState: string;
  currentState: string;
  reason: string;
  reportWording: string;
};

export type OriginalityRisk = {
  riskySection: string;
  riskType: string;
  whyRisky: string;
  suggestedRewrite: string;
};

export type DeliveryChecklistItem = {
  item: string;
  status: "Tamam" | "Eksik" | "Kontrol edilmeli" | "Riskli";
  note: string;
};

export type SectionQualityScore = {
  section: string;
  score: number;
  issue: string;
  strengtheningSuggestion: string;
};

export type TechnicalClaimCheck = {
  claim: string;
  hasEvidence: "Evet" | "Hayir" | "Kismen";
  hasTest: "Evet" | "Hayir" | "Kismen";
  risk: string;
  suggestion: string;
};

export type TestPlanItem = {
  testName: string;
  purpose: string;
  input: string;
  expectedOutput: string;
  successCriteria: string;
  measurementMethod: string;
  status: "Planlanan test" | "Belgelenmis test" | "Eksik";
};

export type RiskAnalysisItem = {
  risk: string;
  probability: "Dusuk" | "Orta" | "Yuksek";
  impact: "Dusuk" | "Orta" | "Yuksek";
  riskLevel: "Dusuk" | "Orta" | "Yuksek" | "Kritik";
  mitigation: string;
  verification: string;
};

export type VisualQualityItem = {
  visual: string;
  section: string;
  qualityNote: string;
  missing: string;
  suggestedCaption: string;
};

export type TeamResponsibilityItem = {
  member: string;
  responsibilityArea: string;
  workDone: string;
  contributionToEmphasize: string;
};

export type ScheduleItem = {
  work: string;
  priority: "Kritik" | "Yuksek" | "Orta" | "Dusuk";
  owner: string;
  status: string;
  deliveryImpact: string;
};

export type LanguageImprovement = {
  section: string;
  shortCompetitionLanguage: string;
  technicalEngineeringLanguage: string;
  strongJuryLanguage: string;
};

export type DefenseQuestion = {
  question: string;
  answerDraft: string;
  relatedSection: string;
};

export type ProjectUpdateSummary = {
  newInfo: string;
  affectedSections: string[];
  visualsToUpdate: string[];
  tablesToUpdate: string[];
  createsRiskOrInconsistency: string;
  shouldAddToDecisionMemory: "Evet" | "Hayir" | "Kontrol edilmeli";
};

export type SourceConfidenceItem = {
  section: string;
  source: string;
  confidence: "Yuksek" | "Orta" | "Dusuk";
  note: string;
};

export type ShorteningSuggestion = {
  section: string;
  priority: number;
  reason: string;
  suggestedAction: string;
};

export type FeedbackRecord = {
  id: string;
  teamId: string;
  competition: string;
  year: string;
  reportType: string;
  reportFileName: string;
  relatedDocumentIds: string[];
  relatedDocumentNames: string[];
  score: number | null;
  maxScore: number | null;
  passStatus: string;
  juryFeedback: string;
  scoreLossReasons: string;
  missingSections: string;
  strongSections: string;
  specNotes: string;
  userComment: string;
  learned: LearnedFeedback;
  createdAt: string;
};

export type LearnedFeedback = {
  resultSummary: string;
  scoreMeaning: string;
  strengths: string[];
  scoreLossCategories: ScoreLossCategory[];
  classifiedJuryFeedback: string[];
  mistakesToAvoid: string[];
  futureChecklistItems: string[];
  generalLesson: string;
  competitionSpecificLesson: string;
};

export type TeamJuryProfile = {
  teamId: string;
  updatedAt: string;
  recordCount: number;
  analysisMode: "ai" | "local";
  relatedDocumentIds: string[];
  evidenceComparisons: JuryEvidenceComparison[];
  likedPatterns: string[];
  dislikedPatterns: string[];
  priorityChecklist: string[];
  styleWarnings: string[];
  summary: string;
};

export type JuryEvidenceComparison = {
  feedbackRecordId: string;
  documentId: string;
  documentName: string;
  feedbackPoint: string;
  evidenceStatus: "Belgede var" | "Kismen var" | "Belgede yok" | "Kontrol edilmeli";
  evidenceExcerpt: string;
  recommendation: string;
};

export type ScoreLossCategory =
  | "Sartname uyumsuzlugu"
  | "Eksik teknik aciklama"
  | "Yetersiz sistem mimarisi"
  | "Zayif mekanik anlatim"
  | "Zayif elektronik anlatim"
  | "Zayif yazilim/algoritma anlatimi"
  | "Guvenlik eksikligi"
  | "Test/dogrulama eksikligi"
  | "Risk analizi eksikligi"
  | "Gorsel/sema/teknik cizim eksikligi"
  | "Takim plani veya is paketi eksikligi"
  | "Rapor dili ve duzen problemi"
  | "Kanitsiz iddia veya abartili ifade"
  | "Yarisma gorevleriyle zayif iliski";

export type FeedbackBasedReportReview = {
  id: string;
  reportId: string;
  teamId: string;
  createdAt: string;
  competitionProfile: CompetitionProfile;
  riskLevel: "Dusuk" | "Orta" | "Yuksek" | "Kritik";
  generalImpression: string;
  strongSections: string[];
  weakSections: string[];
  repeatedMistakes: string[];
  specGaps: string[];
  scoreRiskSections: string[];
  juryQuestions: string[];
  textsToFix: string[];
  visualsToAdd: string[];
  priorityFixes: string[];
  evaluationRange: {
    warning: string;
    strongPreparedRange: string;
    currentRiskRange: string;
    highestScoreLossRisks: string[];
  };
  checklist: string[];
  appliedFeedbackRecordIds: string[];
};

export type CompetitionProfile = {
  competition: string;
  year: string;
  reportType: string;
  maxScore: number | null;
  pageLimit: string;
  mainEvaluationTopics: string[];
  criticalTechnicalExpectations: string[];
  specialSpecItems: string[];
  learnedCompetitionMistakes: string[];
};

export type AiModelOption = {
  id: string;
  label: string;
  note: string;
};

export type AiSettings = {
  provider: "openai";
  openAiModel: string;
  defaultModel: string;
  apiKeyConfigured: boolean;
  modelOptions: AiModelOption[];
};

type StoredAiSettings = {
  openAiModel?: string;
};

type BrainStore = {
  competitions: Competition[];
  teams: Team[];
  documents: BrainDocument[];
  visuals: VisualAsset[];
  profiles: TemplateProfile[];
  reports: ReportDraft[];
  decisions: EngineeringDecision[];
  qualityReviews: QualityReview[];
  feedbackRecords: FeedbackRecord[];
  feedbackReviews: FeedbackBasedReportReview[];
  juryProfiles: TeamJuryProfile[];
  aiSettings: StoredAiSettings;
};

export type Snapshot = {
  competitions: Competition[];
  teams: Team[];
  documents: Omit<BrainDocument, "text" | "chunks">[];
  visuals: VisualAsset[];
  profiles: TemplateProfile[];
  reports: ReportDraft[];
  decisions: EngineeringDecision[];
  qualityReviews: QualityReview[];
  feedbackRecords: FeedbackRecord[];
  feedbackReviews: FeedbackBasedReportReview[];
  juryProfiles: TeamJuryProfile[];
  aiSettings: AiSettings;
  stats: {
    teamCount: number;
    competitionCount: number;
    documentCount: number;
    competitionDocumentCount: number;
    sampleReportCount: number;
    visualCount: number;
    visualImageCount: number;
    reportCount: number;
  };
};

type RankedChunk = {
  documentId: string;
  documentName: string;
  chunkId: string;
  heading: string;
  excerpt: string;
  score: number;
};

const allowedExtensions = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".mmd",
  ".mermaid",
  ".csv",
  ".json",
  ".html",
  ".htm",
  ".pdf",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".svg",
  ".webp",
]);

const textExtensions = new Set([".txt", ".md", ".markdown", ".mmd", ".mermaid", ".csv", ".json", ".html", ".htm", ".svg"]);
const diagramExtensions = new Set([".mmd", ".mermaid", ".png", ".jpg", ".jpeg", ".svg", ".webp"]);

const storeRoot = path.join(process.cwd(), "workspace", "workshop-brain");
const dbPath = path.join(storeRoot, "brain-store.json");
const uploadsRoot = path.join(storeRoot, "uploads");
const backupsRoot = path.join(storeRoot, "backups");
const visualAssetsRoot = path.join(storeRoot, "visual-assets");
const defaultOpenAiModel = "gpt-5.4-nano";
const defaultCompetitionId = "competition_general";

export const openAiModelOptions: AiModelOption[] = [
  { id: "gpt-5.4-nano", label: "GPT-5.4 nano", note: "En dusuk maliyetli gunluk rapor taslaklari" },
  { id: "gpt-5.4-mini", label: "GPT-5.4 mini", note: "Daha guclu yazim ve analiz dengesi" },
  { id: "gpt-5.4", label: "GPT-5.4", note: "Kritik teslimlerde daha yuksek kalite" },
];

function now() {
  return new Date().toISOString();
}

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function id(prefix: string, value = "") {
  const randomPart = Math.random().toString(16).slice(2, 10);
  const timePart = Date.now().toString(36);
  const readablePart = slugify(value).slice(0, 28);
  return `${prefix}_${timePart}_${randomPart}${readablePart ? `_${readablePart}` : ""}`;
}

function seedCompetition(createdAt = now()): Competition {
  return {
    id: defaultCompetitionId,
    name: "Genel Yarışma Havuzu",
    slug: "genel-yarisma-havuzu",
    description: "Mevcut takımlar için otomatik oluşturulan varsayılan yarışma.",
    createdAt,
  };
}

function ensureStore() {
  fs.mkdirSync(storeRoot, { recursive: true });
  fs.mkdirSync(uploadsRoot, { recursive: true });
  fs.mkdirSync(backupsRoot, { recursive: true });
  fs.mkdirSync(visualAssetsRoot, { recursive: true });

  if (!fs.existsSync(dbPath)) {
    const createdAt = now();
    const competition = seedCompetition(createdAt);
    const seed: BrainStore = {
      competitions: [competition],
      teams: [
        {
          id: "team_anka",
          competitionId: competition.id,
          name: "Anka Atolye Takimi",
          slug: "anka-atolye-takimi",
          folderPath: path.join(storeRoot, "teams", "anka-atolye-takimi"),
          createdAt,
          roles: ["Admin", "Takim Lideri", "Uye"],
        },
      ],
      documents: [],
      visuals: [],
      profiles: [seedProfile("team_anka", "tr", createdAt)],
      reports: [],
      decisions: [],
      qualityReviews: [],
      feedbackRecords: [],
      feedbackReviews: [],
      juryProfiles: [],
      aiSettings: {
        openAiModel: process.env.OPENAI_MODEL?.trim() || defaultOpenAiModel,
      },
    };
    writeStore(seed);
  }
}

function seedProfile(teamId: string, language: ReportLanguage, createdAt = now()): TemplateProfile {
  const tr = language === "tr";
  return {
    teamId,
    language,
    sourceDocumentIds: [],
    sourceDocumentNames: [],
    headings: tr
      ? [
          "Yonetici Ozeti",
          "Problem Tanimi",
          "Sistem Tasarimi",
          "Mekanik ve Elektronik Altyapi",
          "Yazilim Mimarisi",
          "Test ve Dogrulama",
          "Riskler ve Sonraki Adimlar",
        ]
      : [
          "Executive Summary",
          "Problem Definition",
          "System Design",
          "Mechanical and Electronic Infrastructure",
          "Software Architecture",
          "Testing and Validation",
          "Risks and Next Steps",
        ],
    toneRules: tr
      ? [
          "Teknik, kanita dayali ve sade anlatim kullan.",
          "Proje belgelerinde olmayan bilgiyi uydurma.",
          "Her kritik iddiayi kaynak belge ile destekle.",
        ]
      : [
          "Use clear, evidence-based technical language.",
          "Do not invent information that is not present in the project files.",
          "Support every critical claim with source evidence.",
        ],
    evidenceRules: tr
      ? [
          "Sayisal iddialar icin kaynak veya eksik bilgi uyarisi gerekli.",
          "Diagram ve tablolar sadece ilgili bolumde kullanilmali.",
        ]
      : [
          "Numerical claims require a source or a missing-information note.",
          "Diagrams and tables should be placed only in relevant sections.",
        ],
    layoutRules: tr
      ? [
          "Rapor kapak sayfasi, bolum sirasi ve tablo kullanimi yuklenen basarili rapor orneklerine gore kurulacak.",
          "Ornek raporda tablo varsa ayni tablo mantigi korunacak; veri yoksa ekip tarafindan doldurulacak alan acikca isaretlenecek.",
          "Ornek raporda kapak gorseli varsa DOCX ciktisinda kapak alaninda kullanilacak.",
        ]
      : [
          "Use uploaded successful report samples for cover page, section order, and table usage.",
          "Preserve table intent from sample reports; mark missing team data clearly.",
          "Use the sample cover image in DOCX export when available.",
        ],
    tableTemplates: [],
    updatedAt: createdAt,
  };
}

function readStore(): BrainStore {
  ensureStore();
  const parsed = JSON.parse(fs.readFileSync(dbPath, "utf8")) as BrainStore;
  parsed.competitions = parsed.competitions || [seedCompetition()];
  if (parsed.competitions.length === 0) {
    parsed.competitions.push(seedCompetition());
  }
  const fallbackCompetitionId = parsed.competitions[0].id;
  parsed.teams = (parsed.teams || []).map((team) => ({
    ...team,
    competitionId: team.competitionId || fallbackCompetitionId,
  }));
  parsed.documents = (parsed.documents || []).map((doc) => ({
    ...doc,
    scope: doc.scope || "team",
  }));
  parsed.visuals = (parsed.visuals || []).map((visual) => ({
    ...visual,
    scope: visual.scope || "team",
    keywords: visual.keywords || [],
    confidence: visual.confidence || "medium",
  }));
  parsed.decisions = parsed.decisions || [];
  parsed.qualityReviews = parsed.qualityReviews || [];
  parsed.feedbackRecords = parsed.feedbackRecords || [];
  parsed.feedbackReviews = parsed.feedbackReviews || [];
  parsed.juryProfiles = parsed.juryProfiles || [];
  parsed.aiSettings = parsed.aiSettings || {};
  parsed.aiSettings.openAiModel = normalizeOpenAiModel(parsed.aiSettings.openAiModel);
  parsed.juryProfiles = parsed.juryProfiles.map((profile) => ({
    ...profile,
    analysisMode: profile.analysisMode || "local",
    evidenceComparisons: profile.evidenceComparisons || [],
  }));
  parsed.profiles = parsed.profiles.map((profile) => ({
    ...profile,
    sourceDocumentNames: profile.sourceDocumentNames || [],
    layoutRules: profile.layoutRules || [],
    tableTemplates: profile.tableTemplates || [],
  }));
  parsed.reports = parsed.reports.map((report) => ({
    ...report,
    generationMode: report.generationMode || "fallback",
  }));
  parsed.feedbackRecords = parsed.feedbackRecords.map((record) => ({
    ...record,
    relatedDocumentIds: record.relatedDocumentIds || [],
    relatedDocumentNames: record.relatedDocumentNames || [],
    scoreLossReasons: record.scoreLossReasons || "",
    missingSections: record.missingSections || "",
    strongSections: record.strongSections || "",
    specNotes: record.specNotes || "",
  }));
  return parsed;
}

function writeStore(store: BrainStore) {
  fs.mkdirSync(storeRoot, { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(store, null, 2), "utf8");
}

function normalizeOpenAiModel(value: unknown) {
  const model = String(value || "").trim();
  return model || process.env.OPENAI_MODEL?.trim() || defaultOpenAiModel;
}

function getConfiguredOpenAiModel(store: BrainStore) {
  return normalizeOpenAiModel(store.aiSettings?.openAiModel);
}

function buildAiSettings(store: BrainStore): AiSettings {
  return {
    provider: "openai",
    openAiModel: getConfiguredOpenAiModel(store),
    defaultModel: defaultOpenAiModel,
    apiKeyConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    modelOptions: openAiModelOptions,
  };
}

export function getSnapshot(): Snapshot {
  const store = readStore();
  return {
    competitions: store.competitions.sort((a, b) => a.name.localeCompare(b.name, "tr")),
    teams: store.teams,
    documents: store.documents.map(({ text: _text, chunks: _chunks, ...doc }) => doc),
    visuals: store.visuals.sort((a, b) => b.extractedAt.localeCompare(a.extractedAt)),
    profiles: store.profiles,
    reports: store.reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    decisions: store.decisions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    qualityReviews: store.qualityReviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    feedbackRecords: store.feedbackRecords.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    feedbackReviews: store.feedbackReviews.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    juryProfiles: store.juryProfiles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    aiSettings: buildAiSettings(store),
    stats: {
      competitionCount: store.competitions.length,
      teamCount: store.teams.length,
      documentCount: store.documents.length,
      competitionDocumentCount: store.documents.filter((doc) => doc.scope === "competition").length,
      sampleReportCount: store.documents.filter((doc) => doc.scope !== "competition" && doc.isSampleReport).length,
      visualCount: store.visuals.length,
      visualImageCount: store.visuals.filter((visual) => Boolean(visual.assetPath)).length,
      reportCount: store.reports.length,
    },
  };
}

export function updateAiSettings(params: { openAiModel: string }) {
  const store = readStore();
  store.aiSettings = {
    openAiModel: normalizeOpenAiModel(params.openAiModel),
  };
  writeStore(store);
  return buildAiSettings(store);
}

export function createCompetition(params: { name: string; description?: string }) {
  const store = readStore();
  const slug = slugify(params.name);
  if (!slug) {
    throw new Error("Yarışma adı geçersiz.");
  }
  if (store.competitions.some((competition) => competition.slug === slug)) {
    throw new Error("Bu yarışma zaten var.");
  }
  const competition: Competition = {
    id: id("competition", params.name),
    name: params.name.trim(),
    slug,
    description: params.description?.trim() || "",
    createdAt: now(),
  };
  store.competitions.push(competition);
  writeStore(store);
  return competition;
}

export function deleteTeam(teamId: string) {
  const store = readStore();
  const index = store.teams.findIndex((t) => t.id === teamId);
  if (index === -1) throw new Error("Takım bulunamadı.");
  const [removed] = store.teams.splice(index, 1);
  store.documents = store.documents.filter((d) => d.teamId !== teamId);
  for (const visual of store.visuals.filter((item) => item.teamId === teamId)) {
    deleteVisualAssetFileIfSafe(visual);
  }
  store.visuals = store.visuals.filter((visual) => visual.teamId !== teamId);
  store.profiles = store.profiles.filter((p) => p.teamId !== teamId);
  store.reports = store.reports.filter((r) => r.teamId !== teamId);
  store.decisions = store.decisions.filter((d) => d.teamId !== teamId);
  store.qualityReviews = store.qualityReviews.filter((q) => q.teamId !== teamId);
  store.feedbackRecords = store.feedbackRecords.filter((f) => f.teamId !== teamId);
  store.feedbackReviews = store.feedbackReviews.filter((f) => f.teamId !== teamId);
  store.juryProfiles = store.juryProfiles.filter((profile) => profile.teamId !== teamId);
  writeStore(store);
  return { deleted: true, teamId, name: removed.name };
}

export function createTeam(name: string, competitionId?: string, folderPath?: string) {
  const store = readStore();
  const slug = slugify(name);
  if (!slug) {
    throw new Error("Takim adi gecersiz.");
  }
  const selectedCompetitionId = competitionId || store.competitions[0]?.id || defaultCompetitionId;
  if (!store.competitions.some((competition) => competition.id === selectedCompetitionId)) {
    throw new Error("Yarışma bulunamadı.");
  }
  if (store.teams.some((team) => team.slug === slug && team.competitionId === selectedCompetitionId)) {
    throw new Error("Bu yarışma altında bu takım zaten var.");
  }
  const team: Team = {
    id: id("team", name),
    competitionId: selectedCompetitionId,
    name,
    slug,
    folderPath: folderPath?.trim() || path.join(storeRoot, "teams", slug),
    createdAt: now(),
    roles: ["Admin", "Takim Lideri", "Uye"],
  };
  store.teams.push(team);
  store.profiles.push(seedProfile(team.id, "tr"));
  writeStore(store);
  return team;
}

export async function scanTeamFolder(teamId: string, folderPath?: string) {
  const store = readStore();
  const team = store.teams.find((item) => item.id === teamId);
  if (!team) {
    throw new Error("Takim bulunamadi.");
  }

  const targetFolder = folderPath?.trim() || team.folderPath;
  if (!fs.existsSync(targetFolder) || !fs.statSync(targetFolder).isDirectory()) {
    throw new Error("Klasor bulunamadi veya okunamadi.");
  }

  team.folderPath = targetFolder;
  const files = listFiles(targetFolder, 150);
  const imported: BrainDocument[] = [];

  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      continue;
    }

    const stats = fs.statSync(filePath);
    const existingIndex = store.documents.findIndex((doc) => doc.teamId === teamId && doc.sourcePath === filePath);
    const isSampleReport = /basarili|ornek|sample|final|rapor/i.test(filePath);
    const doc = await buildDocument({
      teamId,
      fileName: path.basename(filePath),
      sourcePath: filePath,
      size: stats.size,
      kind: inferKind(filePath, isSampleReport),
      isSampleReport,
      text: await extractText(filePath),
    });

    if (existingIndex >= 0) {
      store.documents[existingIndex] = doc;
    } else {
      store.documents.push(doc);
    }
    await refreshVisualAssetsForDocument(store, doc);
    imported.push(doc);
  }

  await refreshProfile(store, teamId);
  writeStore(store);
  return { importedCount: imported.length, documents: imported.map(({ text: _text, chunks: _chunks, ...doc }) => doc) };
}

export async function rescanTeamUploads(teamId: string) {
  const store = readStore();
  const team = store.teams.find((item) => item.id === teamId);
  if (!team) {
    throw new Error("Takim bulunamadi.");
  }
  const uploadPath = path.join(uploadsRoot, team.slug);
  if (!fs.existsSync(uploadPath)) {
    return { importedCount: 0, documents: [] };
  }
  return scanTeamFolder(teamId, uploadPath);
}

export async function saveUploadedDocument(params: {
  teamId: string;
  fileName: string;
  bytes: Buffer;
  kind: DocumentKind;
  isSampleReport: boolean;
}) {
  const store = readStore();
  const team = store.teams.find((item) => item.id === params.teamId);
  if (!team) {
    throw new Error("Takim bulunamadi.");
  }

  const extension = path.extname(params.fileName).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error("Bu dosya turu ilk surumde desteklenmiyor.");
  }

  const teamUploadRoot = path.join(uploadsRoot, team.slug);
  fs.mkdirSync(teamUploadRoot, { recursive: true });
  const storedPath = path.join(teamUploadRoot, `${Date.now()}-${slugify(path.basename(params.fileName, extension))}${extension}`);
  fs.writeFileSync(storedPath, params.bytes);

  // Backup: keep original file regardless of future deletes
  const teamBackupRoot = path.join(backupsRoot, team.slug);
  fs.mkdirSync(teamBackupRoot, { recursive: true });
  const backupPath = path.join(teamBackupRoot, `${Date.now()}-${params.fileName}`);
  fs.writeFileSync(backupPath, params.bytes);

  const doc = await buildDocument({
    teamId: params.teamId,
    scope: "team",
    fileName: params.fileName,
    sourcePath: storedPath,
    storedPath,
    size: params.bytes.byteLength,
    kind: params.kind,
    isSampleReport: params.isSampleReport || params.kind === "sample_report",
    text: await extractText(storedPath),
  });

  store.documents.push(doc);
  await refreshVisualAssetsForDocument(store, doc);
  await refreshProfile(store, params.teamId);
  writeStore(store);
  const { text: _text, chunks: _chunks, ...safeDoc } = doc;
  return safeDoc;
}

export async function saveUploadedCompetitionDocument(params: {
  competitionId: string;
  fileName: string;
  bytes: Buffer;
  kind: DocumentKind;
}) {
  const store = readStore();
  const competition = store.competitions.find((item) => item.id === params.competitionId);
  if (!competition) {
    throw new Error("Yarışma bulunamadı.");
  }

  const extension = path.extname(params.fileName).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error("Bu dosya turu ilk surumde desteklenmiyor.");
  }

  const competitionUploadRoot = path.join(uploadsRoot, "competitions", competition.slug);
  fs.mkdirSync(competitionUploadRoot, { recursive: true });
  const storedPath = path.join(competitionUploadRoot, `${Date.now()}-${slugify(path.basename(params.fileName, extension))}${extension}`);
  fs.writeFileSync(storedPath, params.bytes);

  const competitionBackupRoot = path.join(backupsRoot, "competitions", competition.slug);
  fs.mkdirSync(competitionBackupRoot, { recursive: true });
  const backupPath = path.join(competitionBackupRoot, `${Date.now()}-${params.fileName}`);
  fs.writeFileSync(backupPath, params.bytes);

  const doc = await buildDocument({
    teamId: "",
    competitionId: params.competitionId,
    scope: "competition",
    fileName: params.fileName,
    sourcePath: storedPath,
    storedPath,
    size: params.bytes.byteLength,
    kind: params.kind,
    isSampleReport: false,
    text: await extractText(storedPath),
  });

  store.documents.push(doc);
  await refreshVisualAssetsForDocument(store, doc);
  writeStore(store);
  const { text: _text, chunks: _chunks, ...safeDoc } = doc;
  return safeDoc;
}

export async function updateDocumentMetadata(params: {
  id: string;
  teamId?: string;
  competitionId?: string;
  name: string;
  kind: DocumentKind;
  isSampleReport: boolean;
}) {
  const store = readStore();
  const index = store.documents.findIndex((doc) =>
    params.competitionId
      ? doc.id === params.id && doc.scope === "competition" && doc.competitionId === params.competitionId
      : doc.id === params.id && doc.teamId === params.teamId,
  );
  if (index < 0) {
    throw new Error("Belge bulunamadi.");
  }
  const current = store.documents[index];
  const next: BrainDocument = {
    ...current,
    name: params.name.trim() || current.name,
    kind: params.kind,
    isSampleReport: current.scope === "competition" ? false : params.isSampleReport || params.kind === "sample_report",
    summary: summarize(current.text, params.name.trim() || current.name),
  };
  store.documents[index] = next;
  await refreshVisualAssetsForDocument(store, next);
  if (next.scope !== "competition" && params.teamId) {
    await refreshProfile(store, params.teamId);
  }
  writeStore(store);
  const { text: _text, chunks: _chunks, ...safeDoc } = next;
  return safeDoc;
}

export async function deleteDocument(params: { id: string; teamId?: string; competitionId?: string }) {
  const store = readStore();
  const index = store.documents.findIndex((item) =>
    params.competitionId
      ? item.id === params.id && item.scope === "competition" && item.competitionId === params.competitionId
      : item.id === params.id && item.teamId === params.teamId,
  );
  if (index < 0) {
    throw new Error("Belge bulunamadi.");
  }
  const [doc] = store.documents.splice(index, 1);
  removeVisualAssetsForDocument(store, doc.id);

  const affectedTeamIds =
    doc.scope === "competition"
      ? store.teams.filter((team) => team.competitionId === doc.competitionId).map((team) => team.id)
      : [params.teamId || ""];

  for (const report of store.reports.filter((item) => affectedTeamIds.includes(item.teamId))) {
    report.sources = report.sources.filter((source) => source.documentId !== params.id);
    report.sections = report.sections.map((section) => ({
      ...section,
      sourceIds: section.sourceIds.filter((sourceId) => sourceId !== params.id),
    }));
    report.diagrams = report.diagrams.filter((diagram) => diagram.documentId !== params.id);
  }
  for (const record of store.feedbackRecords.filter((item) => affectedTeamIds.includes(item.teamId))) {
    const keepIndexes = record.relatedDocumentIds.map((idValue, index) => (idValue === params.id ? -1 : index)).filter((index) => index >= 0);
    record.relatedDocumentIds = keepIndexes.map((index) => record.relatedDocumentIds[index]);
    record.relatedDocumentNames = keepIndexes.map((index) => record.relatedDocumentNames[index]).filter(Boolean);
  }

  deleteStoredUploadIfSafe(doc);
  if (doc.scope !== "competition" && params.teamId) {
    await refreshProfile(store, params.teamId);
    await refreshJuryProfileForTeam(store, params.teamId);
  }
  writeStore(store);
  return { deleted: true, id: params.id, name: doc.name };
}

function deleteStoredUploadIfSafe(doc: BrainDocument) {
  const target = doc.storedPath || "";
  if (!target || !fs.existsSync(target)) return;
  const resolvedTarget = path.resolve(target);
  const resolvedRoot = path.resolve(uploadsRoot);
  if (!resolvedTarget.startsWith(resolvedRoot + path.sep)) return;
  fs.unlinkSync(resolvedTarget);
}

async function refreshVisualAssetsForDocument(store: BrainStore, doc: BrainDocument) {
  removeVisualAssetsForDocument(store, doc.id);
  const visuals = await extractVisualAssets(doc);
  store.visuals.push(...visuals);
}

function removeVisualAssetsForDocument(store: BrainStore, documentId: string) {
  const removed = store.visuals.filter((visual) => visual.documentId === documentId);
  for (const visual of removed) {
    deleteVisualAssetFileIfSafe(visual);
  }
  store.visuals = store.visuals.filter((visual) => visual.documentId !== documentId);
}

function deleteVisualAssetFileIfSafe(visual: VisualAsset) {
  const target = visual.assetPath || "";
  if (!target || !fs.existsSync(target)) return;
  const resolvedTarget = path.resolve(target);
  const resolvedRoot = path.resolve(visualAssetsRoot);
  if (!resolvedTarget.startsWith(resolvedRoot + path.sep)) return;
  fs.unlinkSync(resolvedTarget);
}

async function extractVisualAssets(doc: BrainDocument): Promise<VisualAsset[]> {
  const extension = doc.extension.toLowerCase();
  const visuals: VisualAsset[] = [];

  if (isImageExtension(extension) && fs.existsSync(doc.sourcePath)) {
    const mimeType = contentTypeForExtension(extension);
    const assetPath = copyVisualAssetFile(doc.sourcePath, doc, 1, extension);
    visuals.push(buildVisualAsset(doc, {
      title: readableVisualTitle(doc.name, "Yuklenen gorsel"),
      text: `${doc.name} ${doc.summary}`,
      assetPath,
      sourcePath: doc.sourcePath,
      mimeType,
      extractionMethod: "uploaded_image",
      confidence: "high",
    }));
  }

  if (extension === ".docx" && fs.existsSync(doc.sourcePath)) {
    visuals.push(...(await extractDocxVisualAssets(doc)));
  }

  if (extension === ".pdf" && fs.existsSync(doc.sourcePath)) {
    visuals.push(...(await extractPdfVisualAssets(doc)));
  }

  // Gomulu gorsel bulunan belgelerde metin-ici aday cikarimini calistirmiyoruz:
  // gercek gorseller varken metin referanslari yalnizca gurultu ekler.
  if (!visuals.some((visual) => Boolean(visual.assetPath))) {
    visuals.push(...extractTextReferenceVisuals(doc));
  }
  return uniqueBy(visuals, (visual) => `${visual.documentId}:${visual.title}:${visual.assetPath || visual.pageOrSection || visual.summary}`);
}

async function extractDocxVisualAssets(doc: BrainDocument) {
  const visuals: VisualAsset[] = [];
  let imageIndex = 0;
  try {
    await mammoth.convertToHtml(
      { path: doc.sourcePath },
      {
        convertImage: mammoth.images.imgElement(async (image) => {
          imageIndex += 1;
          const contentType = image.contentType || "image/png";
          const ext = extensionForContentType(contentType);
          const bytes = Buffer.from(await image.read("base64"), "base64");
          const assetRoot = visualAssetOwnerRoot(doc);
          fs.mkdirSync(assetRoot, { recursive: true });
          const assetPath = path.join(assetRoot, `${doc.id}-image-${imageIndex}.${ext}`);
          fs.writeFileSync(assetPath, bytes);
          visuals.push(buildVisualAsset(doc, {
            title: readableVisualTitle(doc.name, `Gorsel ${imageIndex}`),
            text: `${doc.name} ${doc.summary} ${nearbyVisualReference(doc.text, imageIndex)}`,
            assetPath,
            sourcePath: doc.sourcePath,
            mimeType: contentType,
            pageOrSection: nearbyVisualReference(doc.text, imageIndex),
            extractionMethod: "docx_image",
            confidence: "high",
          }));
          return { src: "" };
        }),
      },
    );
  } catch (error) {
    console.error("Visual extraction failed", error);
  }
  return visuals;
}

async function extractPdfVisualAssets(doc: BrainDocument) {
  const visuals: VisualAsset[] = [];
  let images: Awaited<ReturnType<typeof extractPdfImages>> = [];
  try {
    images = await extractPdfImages(doc.sourcePath);
  } catch (error) {
    console.error("PDF visual extraction failed", error);
    return visuals;
  }
  if (!images.length) return visuals;

  const captions = collectVisualCaptions(doc.text, doc.name);
  // Altyazilari yalnizca gorsel sayisiyla bire bir ortustuğunde kullaniyoruz;
  // aksi halde yanlis eslesme yapmaktansa temiz genel baslik veriyoruz.
  const useCaptions = captions.length === images.length;
  const assetRoot = visualAssetOwnerRoot(doc);
  fs.mkdirSync(assetRoot, { recursive: true });

  images.forEach((image, position) => {
    const assetPath = path.join(assetRoot, `${doc.id}-pdf-${image.index}.${image.ext}`);
    fs.writeFileSync(assetPath, image.bytes);
    const caption = useCaptions ? captions[position] : "";
    const baseName = path.basename(doc.name, path.extname(doc.name)).replace(/[-_]+/g, " ").trim();
    visuals.push(
      buildVisualAsset(doc, {
        title: caption || `Görsel ${image.index}${baseName ? ` · ${baseName}` : ""}`.slice(0, 120),
        text: `${caption} ${doc.name} ${doc.summary}`,
        summary: caption || `${doc.name} belgesinden çıkarılan ${image.width}×${image.height} px görsel.`,
        assetPath,
        sourcePath: doc.sourcePath,
        mimeType: image.mimeType,
        pageOrSection: caption || undefined,
        extractionMethod: "pdf_image",
        confidence: "high",
      }),
    );
  });

  return visuals;
}

// Belge metninden sekil/sema/diyagram/tablo altyazi adaylarini sirayla toplar.
// Tekrar eden sayfa basligi/altbilgi metinleri (her gorselde ayni cikan) elenir.
function collectVisualCaptions(text: string, documentName: string): string[] {
  const captionRe = /(?:sekil|şekil|figure|fig\.?|diyagram|diagram|grafik|tablo|çizelge|cizelge|şema|sema)\s*[\d.]+\s*[:.\-)]?\s*([^\n.]{3,90})/gi;
  const docTitle = path.basename(documentName, path.extname(documentName)).replace(/[-_]+/g, " ").toLowerCase();
  const seen = new Map<string, number>();
  const raw: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = captionRe.exec(text)) && raw.length < 80) {
    const caption = match[1].replace(/\s+/g, " ").trim().slice(0, 110);
    if (caption.length < 3) continue;
    const key = caption.toLowerCase();
    seen.set(key, (seen.get(key) || 0) + 1);
    raw.push(caption);
  }
  // 2'den fazla tekrar eden veya belge basligini tekrarlayan altyazilar sayfa basligidir.
  return raw.filter((caption) => {
    const key = caption.toLowerCase();
    if ((seen.get(key) || 0) > 2) return false;
    if (docTitle && (key.includes(docTitle) || docTitle.includes(key))) return false;
    return true;
  });
}

function extractTextReferenceVisuals(doc: BrainDocument) {
  const lines = doc.text
    .split(/\r?\n|(?<=\.)\s+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length >= 8 && line.length <= 220)
    .filter(isVisualReferenceLine);

  return unique(lines)
    .slice(0, 16)
    .map((line, index) =>
      buildVisualAsset(doc, {
        title: extractVisualTitle(line) || readableVisualTitle(doc.name, `Diagram adayi ${index + 1}`),
        text: `${line} ${doc.name}`,
        summary: line,
        pageOrSection: extractHeading(line),
        extractionMethod: "text_reference",
        confidence: "medium",
      }),
    );
}

function isVisualReferenceLine(line: string) {
  // Tablo satirlari ve liste maddeleri gorsel adayi degildir.
  if (/^\s*\|/.test(line) || /^[-*]\s/.test(line)) return false;

  // Net altyazi: "Sekil 3.2 ...", "Diyagram 1: ...", "Tablo 4 - ..." gibi numarali referanslar.
  const numberedCaption = /\b(?:şekil|sekil|figure|fig\.?|diyagram|diagram|grafik|tablo|çizelge|cizelge|şema|sema)\s*\d/i;
  if (numberedCaption.test(line)) return true;

  // "... Şeması" / "... Diyagramı" / "... Mimarisi" / "... Akışı" ile biten kisa basliklar.
  const clean = line.replace(/^#+\s*/, "").replace(/^\d+[\).\s-]*/, "").trim();
  const looksLikeHeading = clean.length >= 6 && clean.length <= 70 && !/[.!?,:;]$/.test(clean);
  if (!looksLikeHeading) return false;
  if (/şekilde|sekilde|amac|amaç|mevcut|sonras/i.test(clean)) return false;
  return /(?:şema(?:s[ıi])?|şeması|diyagram[ıi]?|mimari(?:si)?|ak[ıi]ş[ıi]?)$/i.test(clean);
}

function buildVisualAsset(
  doc: BrainDocument,
  params: {
    title: string;
    text: string;
    summary?: string;
    sourcePath?: string;
    assetPath?: string;
    mimeType?: string;
    pageOrSection?: string;
    extractionMethod: VisualAsset["extractionMethod"];
    confidence: VisualAsset["confidence"];
  },
): VisualAsset {
  const classification = classifyVisual(`${params.text} ${params.title}`);
  return {
    id: id("visual", `${doc.id}-${params.title}`),
    teamId: doc.teamId,
    competitionId: doc.competitionId,
    scope: doc.scope || "team",
    documentId: doc.id,
    documentName: doc.name,
    title: params.title.slice(0, 120),
    category: classification.category,
    topic: classification.topic,
    summary: (params.summary || classification.summary || doc.summary || doc.name).slice(0, 260),
    keywords: unique([...classification.keywords, ...topKeywords(`${params.text} ${params.title}`).slice(0, 5)]).slice(0, 10),
    sourcePath: params.sourcePath,
    assetPath: params.assetPath,
    mimeType: params.mimeType,
    pageOrSection: params.pageOrSection,
    extractionMethod: params.extractionMethod,
    confidence: params.confidence,
    extractedAt: now(),
  };
}

function classifyVisual(text: string): { category: VisualCategory; topic: string; summary: string; keywords: string[] } {
  const normalized = text.toLocaleLowerCase("tr-TR");
  const rules: { category: VisualCategory; topic: string; keywords: string[]; pattern: RegExp }[] = [
    { category: "block_diagram", topic: "Blok semasi", keywords: ["blok", "sema", "alt sistem"], pattern: /blok|block|alt sistem|subsystem/i },
    { category: "flow_diagram", topic: "Akis diyagrami", keywords: ["akis", "surec", "flow"], pattern: /ak[Ä±i]s|flow|surec|sÃ¼reÃ§|algoritma|pipeline/i },
    { category: "system_architecture", topic: "Sistem mimarisi", keywords: ["mimari", "sistem", "entegrasyon"], pattern: /mimari|architecture|entegrasyon|sistem tasar/i },
    { category: "mechanical_design", topic: "Mekanik tasarim", keywords: ["mekanik", "gövde", "montaj"], pattern: /mekanik|mechanic|gÃ¶vde|govde|montaj|solidworks|cad|tasar[Ä±i]m/i },
    { category: "electrical_design", topic: "Elektronik/donanim", keywords: ["elektronik", "devre", "pcb"], pattern: /elektronik|donan[Ä±i]m|devre|pcb|sens[oÃ¶]r|kart|batarya|guc|gÃ¼Ã§/i },
    { category: "software_architecture", topic: "Yazilim mimarisi", keywords: ["yazilim", "modul", "kod"], pattern: /yaz[Ä±i]l[Ä±i]m|software|mod[Ã¼u]l|kod|ros|kontrol algorit/i },
    { category: "test_setup", topic: "Test ve dogrulama", keywords: ["test", "doğrulama", "deney"], pattern: /test|do[ÄŸg]rulama|validasyon|deney|sim[Ã¼u]lasyon|kalibrasyon/i },
    { category: "table_or_chart", topic: "Tablo/grafik", keywords: ["tablo", "grafik", "chart"], pattern: /tablo|grafik|chart|plot|puan|sonu[Ãçc]/i },
    { category: "cover_or_branding", topic: "Kapak/logo", keywords: ["kapak", "logo", "marka"], pattern: /kapak|logo|cover|afis|afi[Åşs]|poster/i },
  ];
  const match = rules.find((rule) => rule.pattern.test(normalized));
  if (match) {
    return {
      category: match.category,
      topic: match.topic,
      summary: `${match.topic} olarak siniflandirildi.`,
      keywords: match.keywords,
    };
  }
  return {
    category: "other_visual",
    topic: "Diger gorsel",
    summary: "Belgeden cikarilan gorsel veya diagram adayi.",
    keywords: ["gorsel"],
  };
}

function copyVisualAssetFile(sourcePath: string, doc: BrainDocument, index: number, extension: string) {
  const assetRoot = visualAssetOwnerRoot(doc);
  fs.mkdirSync(assetRoot, { recursive: true });
  const safeExtension = extension.startsWith(".") ? extension : `.${extension}`;
  const assetPath = path.join(assetRoot, `${doc.id}-uploaded-${index}${safeExtension}`);
  fs.copyFileSync(sourcePath, assetPath);
  return assetPath;
}

function visualAssetOwnerRoot(doc: BrainDocument) {
  const owner = doc.scope === "competition" ? doc.competitionId || "competition" : doc.teamId || "team";
  return path.join(visualAssetsRoot, slugify(owner) || "general");
}

function readableVisualTitle(documentName: string, fallback: string) {
  const base = path.basename(documentName, path.extname(documentName)).replace(/[-_]+/g, " ").trim();
  return base ? `${fallback}: ${base}` : fallback;
}

function extractVisualTitle(line: string) {
  const match = line.match(/(?:Åžekil|Sekil|Figure|Fig\.?|Diagram|Diyagram|GÃ¶rsel|Gorsel)\s*[\d.: -]*\s*(.+)/i);
  return (match?.[1] || line).replace(/\s+/g, " ").trim().slice(0, 120);
}

function nearbyVisualReference(text: string, index: number) {
  const lines = text
    .split(/\r?\n|(?<=\.)\s+/)
    .map((line) => line.trim())
    .filter((line) => /(?:sekil|ÅŸekil|figure|diagram|diyagram|gorsel|gÃ¶rsel|sema|ÅŸema|blok|akis|akÄ±ÅŸ)/i.test(line));
  return lines[index - 1] || lines[0] || "";
}

/**
 * Tum belgelerin metnini kaynak dosyadan yeniden cikarir (gelistirilen PDF
 * metin cikarimi sonrasi eski belgeleri tazelemek icin). Ozet, chunk'lar,
 * gorsel adaylari ve sablon profilleri yeniden hesaplanir.
 */
export async function reindexDocuments(params: { teamId?: string; competitionId?: string } = {}) {
  const store = readStore();
  const targets = store.documents.filter((doc) => {
    if (!params.teamId && !params.competitionId) return true;
    if (params.competitionId && doc.scope === "competition") return doc.competitionId === params.competitionId;
    if (params.teamId && doc.scope !== "competition") return doc.teamId === params.teamId;
    return false;
  });

  let reextracted = 0;
  for (const doc of targets) {
    const source = doc.storedPath && fs.existsSync(doc.storedPath) ? doc.storedPath : doc.sourcePath;
    if (!source || !fs.existsSync(source)) continue;
    const text = (await extractText(source)).trim();
    doc.text = text;
    doc.summary = summarize(text, doc.name);
    doc.chunks = chunkText(doc.id, text || doc.name);
    await refreshVisualAssetsForDocument(store, doc);
    reextracted += 1;
  }

  const teamIds = unique(targets.filter((doc) => doc.scope !== "competition").map((doc) => doc.teamId).filter(Boolean));
  const competitionTeamIds = targets.some((doc) => doc.scope === "competition")
    ? store.teams.map((team) => team.id)
    : [];
  for (const teamId of unique([...teamIds, ...competitionTeamIds])) {
    await refreshProfile(store, teamId);
  }

  writeStore(store);
  return { reextractedDocumentCount: reextracted, visualCount: store.visuals.length };
}

export async function rescanVisualAssets(params: { teamId?: string; competitionId?: string }) {
  const store = readStore();
  const documents = store.documents.filter((doc) => {
    if (params.competitionId && doc.scope === "competition") return doc.competitionId === params.competitionId;
    if (params.teamId && doc.scope !== "competition") return doc.teamId === params.teamId;
    return false;
  });
  for (const doc of documents) {
    await refreshVisualAssetsForDocument(store, doc);
  }
  writeStore(store);
  return { visualCount: store.visuals.length, rescannedDocumentCount: documents.length };
}

export function getVisualAssetFile(visualId: string) {
  const store = readStore();
  const visual = store.visuals.find((item) => item.id === visualId);
  if (!visual?.assetPath || !fs.existsSync(visual.assetPath)) {
    throw new Error("Gorsel dosyasi bulunamadi.");
  }
  const resolvedTarget = path.resolve(visual.assetPath);
  const resolvedRoot = path.resolve(visualAssetsRoot);
  if (!resolvedTarget.startsWith(resolvedRoot + path.sep)) {
    throw new Error("Gorsel yolu guvenli degil.");
  }
  return {
    bytes: fs.readFileSync(resolvedTarget),
    mimeType: visual.mimeType || contentTypeForExtension(path.extname(resolvedTarget).toLowerCase()),
    name: visual.title,
  };
}

function competitionDocumentsForTeam(store: BrainStore, teamId: string) {
  const team = store.teams.find((item) => item.id === teamId);
  if (!team) return [];
  return store.documents.filter((doc) => doc.scope === "competition" && doc.competitionId === team.competitionId);
}

export function searchBrain(teamId: string, query: string, limit = 6): RankedChunk[] {
  const store = readStore();
  return searchStore(store, teamId, query, limit);
}

export async function generateReportDraft(params: {
  teamId: string;
  title: string;
  competition: string;
  year: string;
  reportType: string;
  language: ReportLanguage;
  brief: string;
}) {
  const store = readStore();
  const team = store.teams.find((item) => item.id === params.teamId);
  if (!team) {
    throw new Error("Takim bulunamadi.");
  }

  await refreshProfile(store, params.teamId);
  const profile = store.profiles.find((item) => item.teamId === params.teamId && item.language === params.language) || seedProfile(params.teamId, params.language);
  const headings = profile.headings.length > 0 ? profile.headings.slice(0, 8) : seedProfile(params.teamId, params.language).headings;
  const templateProfile = buildReportFormatProfile(profile);
  const sourceRefs = [...selectSourcesForReport(store, params.teamId, params, headings), ...decisionSources(store, params.teamId)];
  const diagrams = suggestDiagrams(store, params.teamId, params.title, params.brief);
  const aiResult = await generateSectionsWithAi(store, params, profile, headings, sourceRefs, diagrams);
  const fallbackSections = headings.map((heading, index) => buildFallbackSection(heading, index, params, sourceRefs));

  const sections = aiResult?.sections?.length ? normalizeAiSections(aiResult.sections, headings, sourceRefs, fallbackSections) : fallbackSections;
  const missingInfo = unique([
    ...(aiResult?.missingInfo || []),
    ...buildMissingInfo(params, sourceRefs, diagrams.length),
  ]).slice(0, 10);

  const draft: ReportDraft = {
    id: id("report", params.title),
    teamId: params.teamId,
    title: params.title,
    competition: params.competition,
    year: params.year,
    reportType: params.reportType,
    language: params.language,
    createdAt: now(),
    status: "draft_needs_review",
    generationMode: aiResult ? "ai" : "fallback",
    sections,
    missingInfo,
    diagrams,
    sources: sourceRefs,
    templateProfile,
  };

  store.reports.push(draft);
  writeStore(store);
  return draft;
}

export function getReport(reportId: string) {
  const store = readStore();
  return store.reports.find((report) => report.id === reportId);
}

export function deleteReportDraft(params: { id: string; teamId: string }) {
  const store = readStore();
  const report = store.reports.find((item) => item.id === params.id && item.teamId === params.teamId);
  if (!report) {
    throw new Error("Rapor taslagi bulunamadi.");
  }

  store.reports = store.reports.filter((item) => item.id !== params.id);
  store.qualityReviews = store.qualityReviews.filter((review) => review.reportId !== params.id);
  store.feedbackReviews = store.feedbackReviews.filter((review) => review.reportId !== params.id);
  writeStore(store);
  return { deleted: true, id: params.id, title: report.title };
}

export function createDecision(params: {
  teamId: string;
  decision: string;
  previousState: string;
  newState: string;
  rationale: string;
  affectedSections: string[];
  dateOrVersion: string;
}) {
  const store = readStore();
  if (!store.teams.some((team) => team.id === params.teamId)) {
    throw new Error("Takim bulunamadi.");
  }
  const decision: EngineeringDecision = {
    id: id("decision", params.decision),
    teamId: params.teamId,
    decision: params.decision,
    previousState: params.previousState,
    newState: params.newState,
    rationale: params.rationale,
    affectedSections: params.affectedSections.filter(Boolean),
    dateOrVersion: params.dateOrVersion || now().slice(0, 10),
    createdAt: now(),
  };
  store.decisions.push(decision);
  writeStore(store);
  return decision;
}

export function listDecisions(teamId: string) {
  const store = readStore();
  return store.decisions.filter((decision) => decision.teamId === teamId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteDecision(params: { id: string; teamId: string }) {
  const store = readStore();
  const index = store.decisions.findIndex((decision) => decision.id === params.id && decision.teamId === params.teamId);
  if (index === -1) {
    throw new Error("Karar kaydı bulunamadı.");
  }
  store.decisions.splice(index, 1);
  writeStore(store);
  return { deleted: true, id: params.id };
}

export function listFeedbackRecords(teamId: string) {
  const store = readStore();
  return store.feedbackRecords.filter((record) => record.teamId === teamId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createFeedbackRecord(params: {
  teamId: string;
  competition: string;
  year: string;
  reportType: string;
  reportFileName: string;
  relatedDocumentIds?: string[];
  score?: number | null;
  maxScore?: number | null;
  passStatus: string;
  juryFeedback: string;
  scoreLossReasons: string;
  missingSections: string;
  strongSections: string;
  specNotes: string;
  userComment: string;
}) {
  const store = readStore();
  if (!store.teams.some((team) => team.id === params.teamId)) {
    throw new Error("Takim bulunamadi.");
  }
  const relatedDocuments = resolveFeedbackDocuments(store, params.teamId, params.relatedDocumentIds || []);
  const learned = learnFromFeedback(params);
  const record: FeedbackRecord = {
    id: id("feedback", `${params.competition}-${params.reportType}`),
    teamId: params.teamId,
    competition: params.competition,
    year: params.year,
    reportType: params.reportType,
    reportFileName: params.reportFileName || relatedDocuments[0]?.name || "",
    relatedDocumentIds: relatedDocuments.map((doc) => doc.id),
    relatedDocumentNames: relatedDocuments.map((doc) => doc.name),
    score: Number.isFinite(params.score) ? Number(params.score) : null,
    maxScore: Number.isFinite(params.maxScore) ? Number(params.maxScore) : null,
    passStatus: params.passStatus,
    juryFeedback: params.juryFeedback,
    scoreLossReasons: params.scoreLossReasons,
    missingSections: params.missingSections,
    strongSections: params.strongSections,
    specNotes: params.specNotes,
    userComment: params.userComment,
    learned,
    createdAt: now(),
  };
  store.feedbackRecords.push(record);
  await refreshJuryProfileForTeam(store, params.teamId);
  writeStore(store);
  return record;
}

export async function updateFeedbackRecord(params: {
  id: string;
  teamId: string;
  competition: string;
  year: string;
  reportType: string;
  reportFileName: string;
  relatedDocumentIds?: string[];
  score?: number | null;
  maxScore?: number | null;
  passStatus: string;
  juryFeedback: string;
  scoreLossReasons: string;
  missingSections: string;
  strongSections: string;
  specNotes: string;
  userComment: string;
}) {
  const store = readStore();
  const index = store.feedbackRecords.findIndex((record) => record.id === params.id && record.teamId === params.teamId);
  if (index < 0) {
    throw new Error("Geri bildirim kaydi bulunamadi.");
  }

  const current = store.feedbackRecords[index];
  const relatedDocuments = resolveFeedbackDocuments(store, params.teamId, params.relatedDocumentIds || []);
  const learned = learnFromFeedback(params);
  const updated: FeedbackRecord = {
    ...current,
    competition: params.competition,
    year: params.year,
    reportType: params.reportType,
    reportFileName: params.reportFileName || relatedDocuments[0]?.name || "",
    relatedDocumentIds: relatedDocuments.map((doc) => doc.id),
    relatedDocumentNames: relatedDocuments.map((doc) => doc.name),
    score: Number.isFinite(params.score) ? Number(params.score) : null,
    maxScore: Number.isFinite(params.maxScore) ? Number(params.maxScore) : null,
    passStatus: params.passStatus,
    juryFeedback: params.juryFeedback,
    scoreLossReasons: params.scoreLossReasons,
    missingSections: params.missingSections,
    strongSections: params.strongSections,
    specNotes: params.specNotes,
    userComment: params.userComment,
    learned,
  };

  store.feedbackRecords[index] = updated;
  await refreshJuryProfileForTeam(store, params.teamId);
  store.feedbackReviews = store.feedbackReviews.filter((review) => !review.appliedFeedbackRecordIds.includes(params.id));
  writeStore(store);
  return updated;
}

export async function deleteFeedbackRecord(params: { id: string; teamId: string }) {
  const store = readStore();
  const before = store.feedbackRecords.length;
  store.feedbackRecords = store.feedbackRecords.filter((record) => !(record.id === params.id && record.teamId === params.teamId));
  if (store.feedbackRecords.length === before) {
    throw new Error("Geri bildirim kaydi bulunamadi.");
  }

  store.feedbackReviews = store.feedbackReviews.filter((review) => !review.appliedFeedbackRecordIds.includes(params.id));
  await refreshJuryProfileForTeam(store, params.teamId);
  writeStore(store);
  return { deleted: true, id: params.id };
}

function resolveFeedbackDocuments(store: BrainStore, teamId: string, documentIds: string[]) {
  const allowed = new Set(documentIds.filter(Boolean));
  return uniqueBy(store.documents.filter((doc) => doc.teamId === teamId && allowed.has(doc.id)), (doc) => doc.id);
}

async function refreshJuryProfileForTeam(store: BrainStore, teamId: string) {
  const records = store.feedbackRecords.filter((record) => record.teamId === teamId);
  store.juryProfiles = store.juryProfiles.filter((profile) => profile.teamId !== teamId);
  if (records.length === 0) {
    return;
  }

  const relatedDocumentIds = unique(records.flatMap((record) => record.relatedDocumentIds));
  const relatedDocuments = store.documents.filter((doc) => doc.teamId === teamId && relatedDocumentIds.includes(doc.id));
  const aiProfile = await buildJuryProfileWithAi(store, teamId, records, relatedDocuments);
  if (aiProfile) {
    store.juryProfiles.push(aiProfile);
    return;
  }

  const categories = records.flatMap((record) => record.learned.scoreLossCategories);
  const evidenceComparisons = buildLocalEvidenceComparisons(records, relatedDocuments);
  const dislikedPatterns = unique([
    ...categories.map((category) => mistakeForCategory(category)),
    ...records.flatMap((record) => record.learned.mistakesToAvoid),
    ...records.flatMap((record) => record.learned.classifiedJuryFeedback),
    ...evidenceComparisons.filter((item) => item.evidenceStatus !== "Belgede var").map((item) => item.recommendation),
  ]).slice(0, 12);
  const likedPatterns = unique(records.flatMap((record) => record.learned.strengths).filter((item) => !/belirtilmedi|netlestirilmeli/i.test(item))).slice(0, 10);
  const priorityChecklist = unique(records.flatMap((record) => record.learned.futureChecklistItems)).slice(0, 14);
  const styleWarnings = inferJuryStyleWarnings(records).slice(0, 8);

  store.juryProfiles.push({
    teamId,
    updatedAt: now(),
    recordCount: records.length,
    analysisMode: "local",
    relatedDocumentIds,
    evidenceComparisons,
    likedPatterns: likedPatterns.length ? likedPatterns : ["Juri begeni kalibi henuz yeterince net degil."],
    dislikedPatterns: dislikedPatterns.length ? dislikedPatterns : ["Juri olumsuz kalibi henuz yeterince net degil."],
    priorityChecklist: priorityChecklist.length ? priorityChecklist : ["Yeni feedback geldikce kontrol listesi guclenecek."],
    styleWarnings,
    summary: buildJuryProfileSummary(records, likedPatterns, dislikedPatterns),
  });
}

function inferJuryStyleWarnings(records: FeedbackRecord[]) {
  const text = records.map((record) => `${record.juryFeedback}\n${record.userComment}`).join("\n");
  const warnings = [];
  if (/detay|detaylandir|nasil|hangi/i.test(text)) warnings.push("Juri teknik detay, secim gerekcesi ve nasil calistigi anlatimini onemsiyor.");
  if (/gorsel|sema|blok|diagram|cizim/i.test(text)) warnings.push("Juri blok/sema/gorsel anlatim eksigini hizli fark ediyor.");
  if (/test|dogrulama|sonuc|olcum/i.test(text)) warnings.push("Juri test sonucu ve dogrulama kaniti bekliyor.");
  if (/sartname|format|sablon|sayfa/i.test(text)) warnings.push("Juri sartname ve sablon uyumunu puan riski olarak goruyor.");
  if (/abarti|kanit|iddia/i.test(text)) warnings.push("Juri kanitsiz veya abartili iddialari sevmiyor.");
  return warnings;
}

async function buildJuryProfileWithAi(store: BrainStore, teamId: string, records: FeedbackRecord[], documents: BrainDocument[]): Promise<TeamJuryProfile | null> {
  if (records.length === 0) {
    return null;
  }

  try {
    const prompt = buildJuryProfilePrompt(records, documents);
    const jsonText = await createOpenAiJsonResponse(store, {
      instructions:
        "You analyze Turkish engineering competition jury feedback against uploaded team documents. Use only provided feedback and document excerpts. Return strict JSON with no extra text.",
      input: prompt,
      maxOutputTokens: 2200,
    });
    if (!jsonText) return null;
    const parsed = JSON.parse(jsonText) as Partial<TeamJuryProfile>;
    const relatedDocumentIds = unique(records.flatMap((record) => record.relatedDocumentIds));
    return {
      teamId,
      updatedAt: now(),
      recordCount: records.length,
      analysisMode: "ai",
      relatedDocumentIds,
      evidenceComparisons: normalizeEvidenceComparisons(parsed.evidenceComparisons, records, documents),
      likedPatterns: normalizeStringList(parsed.likedPatterns, ["Juri begeni kalibi AI tarafindan net cikarilamadi."]),
      dislikedPatterns: normalizeStringList(parsed.dislikedPatterns, ["Juri olumsuz kalibi AI tarafindan net cikarilamadi."]),
      priorityChecklist: normalizeStringList(parsed.priorityChecklist, ["Yeni raporda feedback-belge uyumu tekrar kontrol edilmeli."]),
      styleWarnings: normalizeStringList(parsed.styleWarnings, []),
      summary: String(parsed.summary || buildJuryProfileSummary(records, [], [])),
    };
  } catch (error) {
    console.error("AI jury profile generation failed", error);
    return null;
  }
}

function buildJuryProfilePrompt(records: FeedbackRecord[], documents: BrainDocument[]) {
  const docMap = new Map(documents.map((doc) => [doc.id, doc]));
  const feedbackBlock = records
    .map((record, index) => {
      const relatedDocs = record.relatedDocumentIds
        .map((docId) => docMap.get(docId))
        .filter(Boolean)
        .map((doc) => `${doc?.id} - ${doc?.name}`)
        .join(", ");
      return `[F${index + 1}] id=${record.id}
Competition=${record.competition} ${record.year} ${record.reportType}
Score=${record.score ?? "unknown"} / ${record.maxScore ?? "unknown"}
Related documents=${relatedDocs || "none selected"}
Jury feedback:
${record.juryFeedback || "-"}
User interpretation:
${record.userComment || "-"}`;
    })
    .join("\n\n");
  const documentBlock = documents
    .map((doc) => `[D] id=${doc.id} name=${doc.name} kind=${doc.kind}\n${doc.text.slice(0, 4500)}`)
    .join("\n\n");

  return `Analyze the jury feedback memory for ONE TEAM ONLY.

Tasks:
1. Interpret each feedback in context.
2. Compare feedback points with the selected uploaded document excerpts.
3. Decide whether the document already contains the expected evidence.
4. Build a jury profile: what this jury/team context rewards, dislikes, and what future reports must check.

Feedback records:
${feedbackBlock}

Uploaded document excerpts:
${documentBlock || "No document text was selected or extractable."}

Return JSON only:
{
  "summary": "short Turkish summary",
  "likedPatterns": ["what jury seems to like, Turkish"],
  "dislikedPatterns": ["what jury dislikes or penalizes, Turkish"],
  "priorityChecklist": ["future report checklist item, Turkish"],
  "styleWarnings": ["writing/evidence warning, Turkish"],
  "evidenceComparisons": [
    {
      "feedbackRecordId": "record id",
      "documentId": "document id",
      "documentName": "document name",
      "feedbackPoint": "specific feedback point",
      "evidenceStatus": "Belgede var | Kismen var | Belgede yok | Kontrol edilmeli",
      "evidenceExcerpt": "short excerpt or empty if absent",
      "recommendation": "what to fix in future report"
    }
  ]
}

Rules:
- Do not mix other teams; use only records/documents above.
- Do not invent document evidence. If not found, say Belgede yok or Kontrol edilmeli.
- Keep arrays concise; max 8 items each, evidenceComparisons max 12.`;
}

async function createOpenAiJsonResponse(
  store: BrainStore,
  params: {
    instructions: string;
    input: string;
    maxOutputTokens: number;
  },
) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });
  const model = getConfiguredOpenAiModel(store);
  const request = {
    model,
    instructions: params.instructions,
    input: params.input,
    max_output_tokens: params.maxOutputTokens,
    text: {
      format: { type: "json_object" as const },
      verbosity: "low" as const,
    },
    store: false,
  };
  const response = await client.responses.create(
    modelSupportsReasoningEffort(model) ? { ...request, reasoning: { effort: "low" as const } } : request,
  );

  return extractOpenAiResponseText(response);
}

function modelSupportsReasoningEffort(model: string) {
  return /^gpt-5|^o[1-9]/i.test(model);
}

function extractOpenAiResponseText(response: unknown) {
  const outputText = (response as { output_text?: unknown }).output_text;
  if (typeof outputText === "string" && outputText.trim()) {
    return cleanJsonText(outputText);
  }

  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";
  const text = output
    .flatMap((item) => {
      const content = (item as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => (content as { text?: unknown }).text)
    .filter((value): value is string => typeof value === "string")
    .join("\n")
    .trim();
  return cleanJsonText(text);
}

function cleanJsonText(text: string) {
  return text.trim().replace(/^```json\s*/i, "").replace(/\s*```$/, "");
}

function normalizeEvidenceComparisons(
  value: unknown,
  records: FeedbackRecord[],
  documents: BrainDocument[],
): JuryEvidenceComparison[] {
  if (!Array.isArray(value)) return buildLocalEvidenceComparisons(records, documents);
  const recordIds = new Set(records.map((record) => record.id));
  const docs = new Map(documents.map((doc) => [doc.id, doc]));
  return value
    .map((item) => item as Partial<JuryEvidenceComparison>)
    .filter((item) => item.feedbackRecordId && item.documentId && recordIds.has(item.feedbackRecordId) && docs.has(item.documentId))
    .map((item) => ({
      feedbackRecordId: String(item.feedbackRecordId),
      documentId: String(item.documentId),
      documentName: String(item.documentName || docs.get(String(item.documentId))?.name || ""),
      feedbackPoint: String(item.feedbackPoint || "").slice(0, 220),
      evidenceStatus: normalizeEvidenceStatus(item.evidenceStatus),
      evidenceExcerpt: String(item.evidenceExcerpt || "").slice(0, 360),
      recommendation: String(item.recommendation || "").slice(0, 260),
    }))
    .slice(0, 12);
}

function normalizeStringList(value: unknown, fallback: string[]) {
  const items = Array.isArray(value) ? value.map(String).map((item) => item.trim()).filter(Boolean) : [];
  return (items.length ? unique(items) : fallback).slice(0, 12);
}

function normalizeEvidenceStatus(value: unknown): JuryEvidenceComparison["evidenceStatus"] {
  const text = String(value || "");
  if (text === "Belgede var" || text === "Kismen var" || text === "Belgede yok" || text === "Kontrol edilmeli") return text;
  if (/var/i.test(text)) return "Kismen var";
  if (/yok/i.test(text)) return "Belgede yok";
  return "Kontrol edilmeli";
}

function buildLocalEvidenceComparisons(records: FeedbackRecord[], documents: BrainDocument[]): JuryEvidenceComparison[] {
  const docs = new Map(documents.map((doc) => [doc.id, doc]));
  const comparisons: JuryEvidenceComparison[] = [];
  for (const record of records) {
    const feedbackPoints = splitSentences(`${record.juryFeedback}\n${record.userComment}`).slice(0, 4);
    for (const docId of record.relatedDocumentIds) {
      const doc = docs.get(docId);
      if (!doc) continue;
      for (const point of feedbackPoints) {
        const terms = tokenize(point);
        const score = scoreText(doc.text, terms);
        const excerpt = bestEvidenceExcerpt(doc.text, terms);
        comparisons.push({
          feedbackRecordId: record.id,
          documentId: doc.id,
          documentName: doc.name,
          feedbackPoint: point.slice(0, 220),
          evidenceStatus: score >= 5 ? "Belgede var" : score >= 2 ? "Kismen var" : "Belgede yok",
          evidenceExcerpt: excerpt,
          recommendation:
            score >= 5
              ? "Bu nokta belgede destekleniyor; raporda daha gorunur ve kaynakli anlatilmali."
              : "Bu juri beklentisi icin belgeye/rapora daha acik teknik kanit eklenmeli.",
        });
      }
    }
  }
  return comparisons.slice(0, 12);
}

function bestEvidenceExcerpt(text: string, terms: string[]) {
  if (!text.trim() || terms.length === 0) return "";
  const sentences = splitSentences(text).slice(0, 120);
  const best = sentences
    .map((sentence) => ({ sentence, score: scoreText(sentence, terms) }))
    .sort((a, b) => b.score - a.score)[0];
  return best && best.score > 0 ? best.sentence.slice(0, 320) : "";
}

function buildJuryProfileSummary(records: FeedbackRecord[], likedPatterns: string[], dislikedPatterns: string[]) {
  const latest = records.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const dislikes = dislikedPatterns.slice(0, 3).join(" ");
  const likes = likedPatterns.slice(0, 3).join(", ");
  return `${records.length} takim ici feedback kaydindan profil olustu. Son kayit: ${latest.competition} ${latest.year} ${latest.reportType}. Juri sevdikleri: ${likes || "henuz net degil"}. Juri sevmedikleri: ${dislikes || "henuz net degil"}`;
}

export function reviewReportWithFeedback(reportId: string) {
  const store = readStore();
  const report = store.reports.find((item) => item.id === reportId);
  if (!report) {
    throw new Error("Rapor bulunamadi.");
  }
  const relatedRecords = store.feedbackRecords.filter((record) => record.teamId === report.teamId);
  const sameCompetition = relatedRecords.filter((record) => sameCompetitionName(record.competition, report.competition));
  const applicableRecords = sameCompetition.length ? sameCompetition : relatedRecords.filter((record) => isGeneralFeedback(record));
  const learnedCategories = applicableRecords.flatMap((record) => record.learned.scoreLossCategories);
  const repeatedMistakes = findRepeatedFeedbackMistakes(report, applicableRecords);
  const specGaps = findFeedbackSpecGaps(report, applicableRecords);
  const weakSections = findFeedbackWeakSections(report, learnedCategories);
  const scoreRiskSections = unique([...weakSections, ...repeatedMistakes.map((item) => item.split(":")[0])]).slice(0, 10);
  const riskLevel = feedbackRiskLevel(repeatedMistakes.length, specGaps.length, weakSections.length);
  const maxScore = bestKnownMaxScore(applicableRecords);
  const profile = buildCompetitionProfileFromFeedback(report, applicableRecords, maxScore);
  const range = buildEvaluationRange(riskLevel, maxScore, learnedCategories);

  const review: FeedbackBasedReportReview = {
    id: id("feedback-review", report.title),
    reportId: report.id,
    teamId: report.teamId,
    createdAt: now(),
    competitionProfile: profile,
    riskLevel,
    generalImpression: buildFeedbackGeneralImpression(report, applicableRecords, riskLevel),
    strongSections: report.sections.filter((section) => section.sourceIds.length > 0 && tokenize(section.body).length > 60).map((section) => section.title).slice(0, 8),
    weakSections,
    repeatedMistakes,
    specGaps,
    scoreRiskSections,
    juryQuestions: buildFeedbackJuryQuestions(report, learnedCategories),
    textsToFix: buildTextsToFix(report, learnedCategories),
    visualsToAdd: buildFeedbackVisualNeeds(report, learnedCategories),
    priorityFixes: buildFeedbackPriorityFixes(repeatedMistakes, specGaps, weakSections),
    evaluationRange: range,
    checklist: buildFeedbackChecklist(applicableRecords, learnedCategories, report),
    appliedFeedbackRecordIds: applicableRecords.map((record) => record.id),
  };
  store.feedbackReviews.push(review);
  writeStore(store);
  return review;
}

export function getQualityReview(reviewId: string) {
  const store = readStore();
  return store.qualityReviews.find((review) => review.id === reviewId);
}

export function generateQualityReview(reportId: string) {
  const store = readStore();
  const report = store.reports.find((item) => item.id === reportId);
  if (!report) {
    throw new Error("Rapor bulunamadi.");
  }

  const teamDocs = [
    ...competitionDocumentsForTeam(store, report.teamId),
    ...store.documents.filter((doc) => doc.scope !== "competition" && doc.teamId === report.teamId),
  ];
  const decisions = store.decisions.filter((decision) => decision.teamId === report.teamId);
  const reportText = report.sections.map((section) => `${section.title}\n${section.body}`).join("\n\n");
  const requirementMatches = buildRequirementMatches(report, teamDocs);
  const consistencyIssues = buildConsistencyIssues(report, teamDocs);
  const sectionScores = buildSectionScores(report);
  const technicalClaims = buildTechnicalClaims(report, teamDocs);
  const testPlan = buildTestPlan(report, teamDocs);
  const riskAnalysis = buildRiskAnalysis(report, teamDocs);
  const visualQuality = buildVisualQuality(report);
  const deliveryChecklist = buildDeliveryChecklist(report, requirementMatches, consistencyIssues, testPlan, riskAnalysis, decisions);
  const juryEvaluation = buildJuryEvaluation(report, requirementMatches, consistencyIssues, sectionScores, testPlan, riskAnalysis, visualQuality);
  const originalityRisks = buildOriginalityRisks(report, teamDocs);
  const stageDifferences = buildStageDifferences(report, teamDocs, decisions);
  const teamResponsibilities = buildTeamResponsibilities(report, teamDocs);
  const scheduleItems = buildScheduleItems(report, teamDocs, deliveryChecklist);
  const languageImprovements = buildLanguageImprovements(report);
  const defenseQuestions = buildDefenseQuestions(report, juryEvaluation);
  const projectUpdateSummary = buildProjectUpdateSummary(report, decisions, consistencyIssues);
  const sourceConfidence = buildSourceConfidence(report, teamDocs);
  const shorteningSuggestions = buildShorteningSuggestions(report);
  const overallScore = Math.round(
    average([
      average(juryEvaluation.map((item) => item.score)),
      average(sectionScores.map((item) => item.score)),
      checklistScore(deliveryChecklist),
      Math.max(35, 100 - consistencyIssues.length * 12 - originalityRisks.length * 8),
    ]),
  );

  const review: QualityReview = {
    id: id("quality", report.title),
    reportId: report.id,
    teamId: report.teamId,
    createdAt: now(),
    overallScore,
    juryEvaluation,
    requirementMatches,
    consistencyIssues,
    decisionMemory: decisions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    stageDifferences,
    originalityRisks,
    deliveryChecklist,
    sectionScores,
    technicalClaims,
    testPlan,
    riskAnalysis,
    visualQuality,
    teamResponsibilities,
    scheduleItems,
    languageImprovements,
    defenseQuestions,
    projectUpdateSummary,
    sourceConfidence,
    shorteningSuggestions,
  };

  store.qualityReviews.push(review);
  writeStore(store);
  return review;
}

export function renderReportHtml(report: ReportDraft, format: "doc" | "pdf") {
  const label = format === "doc" ? "Word taslagi" : "PDF icin yazdirilabilir taslak";
  const template = report.templateProfile;
  const coverImage = template?.coverImagePath ? imageDataUri(template.coverImagePath, template.coverImageContentType) : null;
  const sections = report.sections
    .map(
      (section) => `
        <h2>${escapeHtml(section.title)}</h2>
        <p>${escapeHtml(section.body)}</p>
      `,
    )
    .join("");
  const diagrams = report.diagrams
    .map((diagram) => {
      const body = diagram.type === "mermaid" ? `<pre>${escapeHtml(diagram.mermaid || "")}</pre>` : `<p>${escapeHtml(diagram.path || "")}</p>`;
      return `<li><strong>${escapeHtml(diagram.title)}</strong><br/>${body}<em>${escapeHtml(diagram.reason)}</em></li>`;
    })
    .join("");
  const missing = report.missingInfo.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const sources = report.sources.map((source) => `<li>${escapeHtml(source.documentName)}: ${escapeHtml(source.excerpt)}</li>`).join("");
  const templateSources = template?.sourceDocumentNames?.length ? template.sourceDocumentNames.map((name) => `<li>${escapeHtml(name)}</li>`).join("") : "";
  const templateTables = template?.tableTemplates?.length
    ? template.tableTemplates.map((table) => renderHtmlTemplateTable(table)).join("")
    : "<p>Yuklenen ornek raporda okunabilir tablo iskeleti bulunamadi.</p>";

  return `<!doctype html>
<html lang="${report.language}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(report.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.55; color: #171717; margin: 40px; }
    .cover { text-align: center; margin-bottom: 32px; page-break-after: always; }
    .cover img { max-width: 520px; max-height: 300px; object-fit: contain; margin: 20px auto; display: block; }
    h1 { font-size: 30px; margin-bottom: 4px; }
    h2 { border-bottom: 1px solid #ddd; font-size: 20px; margin-top: 28px; padding-bottom: 6px; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0 22px; }
    th, td { border: 1px solid #bbb; padding: 7px; font-size: 12px; vertical-align: top; }
    th { background: #f1f5f9; }
    p, li { font-size: 13px; }
    pre { background: #f5f5f5; border: 1px solid #ddd; padding: 12px; white-space: pre-wrap; }
    .meta { color: #555; font-size: 12px; }
    @media print { body { margin: 20mm; } }
  </style>
</head>
<body>
  <div class="cover">
    ${coverImage ? `<img src="${coverImage}" alt="Sablon kapak gorseli" />` : ""}
    <p class="meta">${escapeHtml(label)} - ${escapeHtml(report.competition)} - ${escapeHtml(report.year)} - ${escapeHtml(report.generationMode.toUpperCase())}</p>
    <h1>${escapeHtml(report.title)}</h1>
    <p>${escapeHtml(report.reportType)}</p>
    ${templateSources ? `<p class="meta">Format kaynaklari:</p><ul>${templateSources}</ul>` : ""}
  </div>
  ${sections}
  <h2>Sablondan Gelen Tablo Iskeletleri</h2>
  ${templateTables}
  <h2>Diagram Onerileri</h2>
  <ul>${diagrams || "<li>Diagram onerisi yok.</li>"}</ul>
  <h2>Eksik Bilgi Listesi</h2>
  <ul>${missing}</ul>
  <h2>Kullanilan Kaynaklar</h2>
  <ul>${sources || "<li>Kaynak eslesmesi yok.</li>"}</ul>
</body>
</html>`;
}

export async function renderReportDocx(report: ReportDraft) {
  const children: (Paragraph | Table)[] = [];
  const coverImage = buildCoverImageRun(report.templateProfile);

  if (coverImage) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [coverImage],
        spacing: { after: 360 },
      }),
    );
  }

  children.push(
    new Paragraph({
      text: report.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun(`${report.competition} - ${report.year} - ${report.reportType}`),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun(`Uretim modu: ${report.generationMode === "ai" ? "AI destekli" : "Kaynakli fallback"}`)],
    }),
  );

  if (report.templateProfile?.sourceDocumentNames.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun(`Format kaynaklari: ${report.templateProfile.sourceDocumentNames.join(", ")}`)],
      }),
    );
  }

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    }),
    new Paragraph(""),
  );

  const placedTables = new Set<string>();

  for (const section of report.sections) {
    children.push(
      new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1 }),
      ...section.body.split(/\n+/).map((part) => new Paragraph({ text: part.trim(), spacing: { after: 180 } })),
    );
    for (const table of templateTablesForSection(section.title, report.templateProfile)) {
      children.push(...renderDocxTemplateTable(table));
      placedTables.add(tableKey(table));
    }
  }

  const remainingTables = (report.templateProfile?.tableTemplates || []).filter((table) => !placedTables.has(tableKey(table)));
  if (remainingTables.length > 0) {
    children.push(new Paragraph({ text: "Sablondan Gelen Tablo Iskeletleri", heading: HeadingLevel.HEADING_1 }));
    for (const table of remainingTables) {
      children.push(...renderDocxTemplateTable(table));
    }
  }

  children.push(new Paragraph({ text: "Diagram Onerileri", heading: HeadingLevel.HEADING_1 }));
  for (const diagram of report.diagrams) {
    children.push(
      new Paragraph({ text: diagram.title, heading: HeadingLevel.HEADING_2 }),
      new Paragraph(diagram.reason),
      new Paragraph(diagram.type === "mermaid" ? diagram.mermaid || "" : diagram.path || ""),
    );
  }

  children.push(new Paragraph({ text: "Eksik Bilgi Listesi", heading: HeadingLevel.HEADING_1 }));
  for (const item of report.missingInfo) {
    children.push(new Paragraph({ text: item, bullet: { level: 0 } }));
  }

  children.push(new Paragraph({ text: "Kullanilan Kaynaklar", heading: HeadingLevel.HEADING_1 }));
  for (const source of report.sources) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: source.documentName, bold: true }),
          new TextRun(`: ${source.excerpt}`),
        ],
        bullet: { level: 0 },
      }),
    );
  }

  const doc = new Document({
    creator: "Atolye Beyni",
    title: report.title,
    description: "Kaynakli rapor taslagi",
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

function buildCoverImageRun(template?: ReportFormatProfile): ImageRun | null {
  if (!template?.coverImagePath || !fs.existsSync(template.coverImagePath)) {
    return null;
  }
  const imageType = imageRunType(template.coverImagePath, template.coverImageContentType);
  if (!imageType) {
    return null;
  }
  return new ImageRun({
    type: imageType,
    data: fs.readFileSync(template.coverImagePath),
    transformation: {
      width: 440,
      height: 250,
    },
    altText: {
      title: "Sablon kapak gorseli",
      description: "Yuklenen basarili rapor orneginden alinan kapak gorseli",
      name: "template-cover",
    },
  });
}

function renderDocxTemplateTable(table: ReportTableTemplate): (Paragraph | Table)[] {
  const rows = [
    table.headers,
    ...(table.sampleRows.length > 0 ? table.sampleRows : [table.headers.map(() => "Ekip verisi eklenecek")]),
  ];

  return [
    new Paragraph({
      text: `${table.title} (${table.sourceDocumentName})`,
      heading: HeadingLevel.HEADING_2,
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rows.map(
        (row, rowIndex) =>
          new TableRow({
            children: table.headers.map(
              (_header, cellIndex) =>
                new TableCell({
                  shading: rowIndex === 0 ? { fill: "E2E8F0" } : undefined,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: row[cellIndex] || (rowIndex === 0 ? `Alan ${cellIndex + 1}` : "Ekip verisi eklenecek"),
                          bold: rowIndex === 0,
                        }),
                      ],
                    }),
                  ],
                }),
            ),
          }),
      ),
    }),
    new Paragraph(""),
  ];
}

function renderHtmlTemplateTable(table: ReportTableTemplate) {
  const rows = table.sampleRows.length > 0 ? table.sampleRows : [table.headers.map(() => "Ekip verisi eklenecek")];
  return `<h3>${escapeHtml(table.title)} (${escapeHtml(table.sourceDocumentName)})</h3>
  <table>
    <thead><tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>${rows
      .map((row) => `<tr>${table.headers.map((_, index) => `<td>${escapeHtml(row[index] || "Ekip verisi eklenecek")}</td>`).join("")}</tr>`)
      .join("")}</tbody>
  </table>`;
}

function templateTablesForSection(sectionTitle: string, template?: ReportFormatProfile) {
  const sectionTerms = tokenize(sectionTitle);
  return (template?.tableTemplates || []).filter((table) => {
    const target = tokenize(`${table.title} ${table.headers.join(" ")}`);
    return sectionTerms.some((term) => target.includes(term));
  });
}

function tableKey(table: ReportTableTemplate) {
  return `${table.sourceDocumentName}:${table.title}:${table.headers.join("|")}`;
}

function imageDataUri(filePath: string, contentType?: string) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const type = contentType || contentTypeForExtension(path.extname(filePath).toLowerCase());
  return `data:${type};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

function imageRunType(filePath: string, contentType?: string): "jpg" | "png" | "gif" | "bmp" | null {
  const target = `${contentType || ""} ${path.extname(filePath).toLowerCase()}`;
  if (/jpe?g/i.test(target)) return "jpg";
  if (/gif/i.test(target)) return "gif";
  if (/bmp/i.test(target)) return "bmp";
  if (/png/i.test(target)) return "png";
  return null;
}

function decisionSources(store: BrainStore, teamId: string): SourceRef[] {
  return store.decisions
    .filter((decision) => decision.teamId === teamId)
    .slice(-12)
    .map((decision) => ({
      documentId: decision.id,
      documentName: "Karar Hafizasi",
      chunkId: decision.id,
      excerpt: `Karar: ${decision.decision}. Onceki durum: ${decision.previousState}. Yeni durum: ${decision.newState}. Gerekce: ${decision.rationale}. Etkilenen bolumler: ${decision.affectedSections.join(", ")}. Tarih/surum: ${decision.dateOrVersion}.`,
    }));
}

function buildRequirementMatches(report: ReportDraft, docs: BrainDocument[]): RequirementMatch[] {
  const requirements = extractRequirements(docs);
  return requirements.map((requirement) => {
    const terms = tokenize(requirement);
    const matchedSection = bestSectionMatch(report, terms);
    const evidence = report.sources.find((source) => scoreText(source.excerpt, terms) > 0);
    const hasVisual = report.diagrams.some((diagram) => scoreText(`${diagram.title} ${diagram.reason}`, terms) > 0);
    let status: RequirementMatch["status"] = "Eksik";
    if (matchedSection && evidence && hasVisual) status = "Karsilanmis";
    else if (matchedSection && evidence) status = "Kismen karsilanmis";
    else if (matchedSection) status = "Raporda var ama kanit zayif";
    else if (evidence) status = "Projede var ama raporda anlatilmamis";
    if (isContradicting(requirement, sectionBody(matchedSection))) status = "Sartnameyle celisiyor";

    return {
      requirement,
      reportMatch: matchedSection ? matchedSection.title : "Rapor bolumu bulunamadi",
      evidenceOrVisual: evidence ? evidence.documentName : hasVisual ? "Diagram/gorsel onerisi var" : "Kanit bulunamadi",
      status,
      missing: status === "Karsilanmis" ? "-" : "Gereksinim icin net kanit, test sonucu veya ilgili bolum anlatimi guclendirilmeli.",
    };
  });
}

function buildConsistencyIssues(report: ReportDraft, docs: BrainDocument[]): ConsistencyIssue[] {
  const text = report.sections.map((section) => `${section.title}: ${section.body}`).join("\n");
  const issues: ConsistencyIssue[] = [];
  const contradictionPairs = [
    ["manuel", "tam otonom", "Manuel ve tam otonom ifadeleri ayni kapsamda geciyor."],
    ["planlanan test", "dogrulanmistir", "Planlanan test ile tamamlanmis test dili karisiyor."],
    ["eski", "guncel", "Eski/guncel karar anlatimi net ayrilmamis olabilir."],
    ["yapilacak", "yapildi", "Gelecek zaman ve tamamlanmis is ayni teknik konu icin karisiyor olabilir."],
  ];
  for (const [a, b, label] of contradictionPairs) {
    if (contains(text, a) && contains(text, b)) {
      issues.push({
        inconsistency: label,
        locations: findSectionsContaining(report, [a, b]).join(", ") || "Genel rapor metni",
        risk: "Juri, projenin mevcut durumunu ve teslim olgunlugunu belirsiz gorebilir.",
        suggestedFix: "Yapilan, planlanan ve iptal edilen isleri ayri cumlelerle ve tarih/surum bilgisiyle yaz.",
      });
    }
  }

  const metricIssues = findMetricConflicts(report);
  issues.push(...metricIssues);

  const decisionTerms = docs
    .filter((doc) => doc.kind === "meeting_note")
    .flatMap((doc) => doc.chunks)
    .filter((chunk) => /degisti|guncellendi|revize|iptal|yeni/i.test(chunk.text))
    .slice(0, 5);
  for (const chunk of decisionTerms) {
    if (scoreText(text, tokenize(chunk.text)) === 0) {
      issues.push({
        inconsistency: "Toplanti/karar notundaki guncel bilgi raporda gorunmuyor.",
        locations: chunk.heading,
        risk: "Eski teknik karar rapora tasinabilir.",
        suggestedFix: `Karar notunu ilgili bolume isle: ${chunk.text.slice(0, 220)}`,
      });
    }
  }
  return issues.slice(0, 16);
}

function buildSectionScores(report: ReportDraft): SectionQualityScore[] {
  return report.sections.map((section) => {
    const words = tokenize(section.body);
    const evidencePenalty = section.sourceIds.length === 0 ? 18 : 0;
    const lengthPenalty = words.length < 45 ? 18 : words.length > 220 ? 6 : 0;
    const testBonus = /test|dogrulama|olcum|basari kriteri/i.test(section.body) ? 6 : 0;
    const riskBonus = /risk|onlem|guvenlik/i.test(section.body) ? 4 : 0;
    const score = clamp(72 - evidencePenalty - lengthPenalty + testBonus + riskBonus, 35, 96);
    return {
      section: section.title,
      score,
      issue: score >= 80 ? "Bolum okunabilir ve kaynakla desteklenmis." : "Bolumde kanit, test veya teknik ayrinti zayif.",
      strengtheningSuggestion: section.sourceIds.length === 0
        ? "Bu bolume proje belgesi, test sonucu veya gorsel kanit bagla."
        : "Sayisal kriter, karar gerekcesi ve dogrulama sonucu ekleyerek puani artir.",
    };
  });
}

function buildTechnicalClaims(report: ReportDraft, docs: BrainDocument[]): TechnicalClaimCheck[] {
  const claimPatterns = [
    "gercek zamanli",
    "yuksek dogruluk",
    "guvenli calisma",
    "hassas",
    "hizli tepki",
    "kullanici dostu",
    "dusuk gecikme",
    "otonom",
    "kararli",
    "verimli",
  ];
  const docText = docs.map((doc) => doc.text).join("\n");
  const claims = splitSentences(report.sections.map((section) => section.body).join(" "))
    .filter((sentence) => claimPatterns.some((pattern) => contains(sentence, pattern)))
    .slice(0, 14);

  return (claims.length ? claims : claimPatterns.slice(0, 5).map((pattern) => `${pattern} iddiasi raporda aranmalidir.`)).map((claim) => {
    const terms = tokenize(claim);
    const evidenceScore = scoreText(docText, terms);
    const testMention = /test|olcum|dogrulama|sonuc|metrik/i.test(claim) || /test|olcum|dogrulama|sonuc|metrik/i.test(docText);
    const hasEvidence = evidenceScore > 4 ? "Evet" : evidenceScore > 1 ? "Kismen" : "Hayir";
    return {
      claim,
      hasEvidence,
      hasTest: testMention ? "Kismen" : "Hayir",
      risk: hasEvidence === "Hayir" ? "Bu ifade kanitlanmamis gorunuyor." : "Kanita dayali anlatim guclendirilebilir.",
      suggestion:
        hasEvidence === "Hayir"
          ? "Test sonucu yoksa daha dikkatli ve hedef odakli bir ifadeye cevrilmeli."
          : "Iddiayi ilgili test, metrik veya kaynak dosya ile ayni bolumde destekle.",
    };
  });
}

function buildTestPlan(report: ReportDraft, docs: BrainDocument[]): TestPlanItem[] {
  const text = `${report.sections.map((section) => section.body).join(" ")} ${docs.map((doc) => doc.text).join(" ")}`;
  const tests = [
    "Mekanik hareket testi",
    "Motor hassasiyet testi",
    "Guc dagitim testi",
    "Haberlesme testi",
    "Arayuz kontrol testi",
    "Otonom mod testi",
    "Manuel mod testi",
    "Acil durdurma testi",
    "Goruntu isleme testi",
    "Hedef takip testi",
    "Sistem entegrasyon testi",
  ];
  return tests.map((testName) => {
    const mentioned = scoreText(text, tokenize(testName)) > 0;
    const done = mentioned && /dogrulandi|tamamlandi|olculdu|sonuc/i.test(text);
    return {
      testName,
      purpose: `${testName} ile ilgili alt sistemin yarisma kosullarinda dogrulanmasi.`,
      input: "Proje belgelerindeki senaryo, ekipman ve test verisi.",
      expectedOutput: "Basari kriterini saglayan olcum veya gozlem sonucu.",
      successCriteria: mentioned ? "Rapordaki kriter sayisal hale getirilmeli." : "Basari kriteri tanimlanmali.",
      measurementMethod: "Olcum tablosu, log kaydi, video kaniti veya kontrol listesi.",
      status: done ? "Belgelenmis test" : mentioned ? "Planlanan test" : "Eksik",
    };
  });
}

function buildRiskAnalysis(report: ReportDraft, docs: BrainDocument[]): RiskAnalysisItem[] {
  const text = `${report.sections.map((section) => section.body).join(" ")} ${docs.map((doc) => doc.text).join(" ")}`;
  const risks = [
    ["Mekanik risk", "Aktarim, baglanti veya govde dayanimi beklenen kosullarda yetersiz kalabilir."],
    ["Elektronik risk", "Guc dagitimi, surucu veya kablolama arizasi sistem davranisini etkileyebilir."],
    ["Yazilim riski", "Kontrol algoritmasi veya durum yonetimi yarisma senaryosunda karar gecikmesi olusturabilir."],
    ["Haberlesme riski", "Moduller arasi veri gecikmesi veya paket kaybi kontrol kalitesini dusurebilir."],
    ["Guvenlik riski", "Acil durdurma veya hata durumlari yeterince dogrulanmazsa teslim riski artar."],
    ["Yarisma gorevi riski", "Gorev sartlariyla test senaryolari birebir eslesmeyebilir."],
    ["Takvim riski", "Test ve rapor revizyonu teslim tarihine sikisabilir."],
    ["Uretim riski", "Parca uretimi veya montaj toleranslari tekrar isleme gerektirebilir."],
    ["Malzeme tedarik riski", "Kritik bilesenlerin temini gecikirse entegrasyon aksayabilir."],
  ];
  return risks.map(([risk, description]) => {
    const mentioned = scoreText(text, tokenize(risk)) > 0;
    return {
      risk,
      probability: mentioned ? "Orta" : "Yuksek",
      impact: /guvenlik|guc|acil|otonom/i.test(risk) ? "Yuksek" : "Orta",
      riskLevel: mentioned ? "Orta" : "Yuksek",
      mitigation: mentioned ? "Rapordaki onlemi sayisal dogrulama veya sorumlu kisiyle netlestir." : description,
      verification: "Test sonucu, kontrol listesi veya entegrasyon denemesiyle dogrulanmali.",
    };
  });
}

function buildVisualQuality(report: ReportDraft): VisualQualityItem[] {
  if (report.diagrams.length === 0) {
    return [
      {
        visual: "Gorsel bulunamadi",
        section: "Sistem Tasarimi",
        qualityNote: "Rapor teknik gorsel destegi acisindan zayif.",
        missing: "Mimari, mekanik, elektronik veya test duzeni gorseli eklenmeli.",
        suggestedCaption: "Sekil 1. Sistem mimarisi ve alt sistem iliskileri.",
      },
    ];
  }
  return report.diagrams.map((diagram, index) => ({
    visual: diagram.title,
    section: guessSectionForVisual(report, diagram),
    qualityNote: diagram.type === "mermaid" ? "Akis/mimari anlatimi icin uygun; teknik detay seviyesi kontrol edilmeli." : "Mevcut gorsel raporda kullanilabilir; netlik ve etiketler kontrol edilmeli.",
    missing: "Alt aciklama, sekil numarasi, olcu/etiket ihtiyaci ve sartnameyle iliski kontrol edilmeli.",
    suggestedCaption: `Sekil ${index + 1}. ${diagram.title} - ${diagram.reason}`,
  }));
}

function buildDeliveryChecklist(
  report: ReportDraft,
  requirements: RequirementMatch[],
  issues: ConsistencyIssue[],
  tests: TestPlanItem[],
  risks: RiskAnalysisItem[],
  decisions: EngineeringDecision[],
): DeliveryChecklistItem[] {
  const hasSources = report.sources.length > 0;
  const hasRequirements = requirements.some((item) => item.status === "Karsilanmis" || item.status === "Kismen karsilanmis");
  const hasTests = tests.some((item) => item.status !== "Eksik");
  const hasRisk = risks.some((item) => item.riskLevel !== "Yuksek");
  const checks: [string, DeliveryChecklistItem["status"], string][] = [
    ["Sayfa siniri kontrol edildi mi?", "Kontrol edilmeli", "DOCX/PDF cikti uzerinden son kontrol gerekir."],
    ["Kapak bilgileri dogru mu?", report.title ? "Kontrol edilmeli" : "Eksik", "Takim, yarisma ve yil bilgileri kapakta net olmali."],
    ["Takim adi dogru mu?", "Kontrol edilmeli", "Aktif takim bilgisiyle karsilastirilmali."],
    ["Danisman bilgisi dogru mu?", "Kontrol edilmeli", "Belgelerde danisman bilgisi aranip dogrulanmali."],
    ["Gorseller numaralandirildi mi?", report.diagrams.length ? "Kontrol edilmeli" : "Eksik", "Sekil numarasi ve alt aciklama gerekir."],
    ["Tablolar numaralandirildi mi?", "Kontrol edilmeli", "DOCX son hali uzerinden kontrol edilmeli."],
    ["Kaynakca var mi?", hasSources ? "Kontrol edilmeli" : "Eksik", "Kullanilan kaynaklar listesi mevcut ama formatlanmali."],
    ["Sartnameye aykiri ifade var mi?", issues.length ? "Riskli" : hasRequirements ? "Tamam" : "Kontrol edilmeli", "Sartname eslestirme tablosu incelenmeli."],
    ["Eksik bolum var mi?", report.missingInfo.length ? "Riskli" : "Tamam", report.missingInfo.join("; ") || "Eksik bilgi yok."],
    ["Gorseller metinle uyumlu mu?", report.diagrams.length ? "Kontrol edilmeli" : "Eksik", "Gorsel kalite denetimi yapildi."],
    ["Test plani var mi?", hasTests ? "Kontrol edilmeli" : "Eksik", "Eksik testler planlanan test olarak yazilmali."],
    ["Risk analizi var mi?", hasRisk ? "Kontrol edilmeli" : "Eksik", "Riskler teknik onlem ve dogrulama ile yazilmali."],
    ["Guncel teknik kararlar rapora islendi mi?", decisions.length ? "Kontrol edilmeli" : "Eksik", "Karar hafizasi raporla eslestirilmeli."],
    ["Eski bilgiler temizlendi mi?", issues.length ? "Riskli" : "Kontrol edilmeli", "Teknik tutarlilik denetimi sonuclari uygulanmali."],
    ["DOCX formati bozulmamis mi?", "Kontrol edilmeli", "Indirilen DOCX Word ile acilip baslik/gorsel kontrol edilmeli."],
    ["PDF ciktisi kontrol edildi mi?", "Kontrol edilmeli", "HTML/PDF onizleme yazdirma akisi kontrol edilmeli."],
  ];
  return checks.map(([item, status, note]) => ({ item, status, note }));
}

function buildJuryEvaluation(
  report: ReportDraft,
  requirements: RequirementMatch[],
  issues: ConsistencyIssue[],
  sectionScores: SectionQualityScore[],
  tests: TestPlanItem[],
  risks: RiskAnalysisItem[],
  visuals: VisualQualityItem[],
): JuryEvaluationItem[] {
  const categories = [
    "Sartnameye uygunluk",
    "Teknik derinlik",
    "Sistem mimarisi acikligi",
    "Mekanik tasarim yeterliligi",
    "Elektronik tasarim yeterliligi",
    "Yazilim mimarisi yeterliligi",
    "Goruntu isleme / yapay zeka anlatimi",
    "Test ve dogrulama plani",
    "Risk analizi",
    "Gorsel ve diyagram kullanimi",
    "Rapor dili",
    "Teknik tutarlilik",
    "Teslim edilebilirlik",
  ];
  return categories.map((title) => {
    const relatedScore = categoryScore(title, report, requirements, issues, sectionScores, tests, risks, visuals);
    const relatedSection = bestSectionByTitle(report, title);
    return {
      title,
      score: relatedScore,
      strength: relatedScore >= 75 ? "Bolum genel olarak anlasilir ve kaynaklarla iliskili." : "Temel taslak var; gelistirmeye acik.",
      weakness: relatedScore >= 75 ? "Puan artisi icin daha fazla metrik ve kanit eklenebilir." : "Juri icin kanit, test veya teknik ayrinti zayif kalabilir.",
      missingInfo: missingForCategory(title, requirements, tests, risks, visuals),
      fixLocation: relatedSection?.title || "Ilgili rapor bolumu",
      scoreBoostSuggestion: scoreBoostForCategory(title),
      likelyQuestion: likelyQuestionForCategory(title),
      technicalAnswer: technicalAnswerForCategory(title),
    };
  });
}

function buildOriginalityRisks(report: ReportDraft, docs: BrainDocument[]): OriginalityRisk[] {
  const sampleSentences = docs.filter((doc) => doc.isSampleReport).flatMap((doc) => splitSentences(doc.text));
  const risks: OriginalityRisk[] = [];
  for (const section of report.sections) {
    for (const sentence of splitSentences(section.body)) {
      const similar = sampleSentences.find((sample) => sample.length > 60 && sentenceSimilarity(sentence, sample) > 0.82);
      if (similar) {
        risks.push({
          riskySection: section.title,
          riskType: "Gecmis rapora fazla benzer cumle",
          whyRisky: `Yeni rapor cumlesi ornek rapordaki cumleye cok benziyor: ${similar.slice(0, 160)}`,
          suggestedRewrite: "Ayni fikri yeni projenin guncel teknik karari, test verisi ve bilesen adlariyla yeniden yaz.",
        });
        break;
      }
    }
  }
  if (risks.length === 0 && report.generationMode === "fallback") {
    risks.push({
      riskySection: "Genel rapor",
      riskType: "Sablon dili riski",
      whyRisky: "Fallback metin kaynaklari dogrudan ozetledigi icin uslup tekrar edebilir.",
      suggestedRewrite: "AI destekli modda veya manuel revizyonda cumleleri proje ozelinde yeniden akit.",
    });
  }
  return risks.slice(0, 10);
}

function buildStageDifferences(report: ReportDraft, docs: BrainDocument[], decisions: EngineeringDecision[]): StageDifference[] {
  const stagedDocs = docs.filter((doc) => /otr|on tasarim|ktr|kritik|final|sunum|planlanan|uretilen/i.test(doc.name));
  const rows = decisions.slice(0, 10).map((decision) => ({
    section: decision.affectedSections.join(", ") || "Genel tasarim",
    previousState: decision.previousState,
    currentState: decision.newState,
    reason: decision.rationale,
    reportWording: `${decision.decision} degisikligi ${decision.rationale} gerekcesiyle raporda guncel durum olarak anlatilmali.`,
  }));
  if (rows.length) return rows;
  return stagedDocs.slice(0, 6).map((doc) => ({
    section: inferStageFromName(doc.name),
    previousState: "Onceki teslim dokumani incelenmeli.",
    currentState: report.title,
    reason: doc.summary || "Belge fark analizi icin kaynak olarak bulundu.",
    reportWording: "Planlanan ve gerceklesen sistem farklari neden-sonuc diliyle anlatilmali.",
  }));
}

function buildTeamResponsibilities(report: ReportDraft, docs: BrainDocument[]): TeamResponsibilityItem[] {
  const text = `${report.sections.map((section) => section.body).join(" ")} ${docs.map((doc) => doc.text).join(" ")}`;
  const roles = [
    ["Mekanik sorumlusu", "Mekanik tasarim", "Tasarim, uretim ve montaj sureci"],
    ["Elektronik sorumlusu", "Elektronik ve guc", "Kart, sensor, surucu ve guc dagitimi"],
    ["Yazilim sorumlusu", "Yazilim ve gomulu sistem", "Kontrol, haberlesme ve arayuz gelistirme"],
    ["Test sorumlusu", "Test ve dogrulama", "Test senaryolari, olcum ve raporlama"],
    ["Raporlama sorumlusu", "Rapor ve teslim", "Kaynak toplama, DOCX/PDF kontrolu ve teslim"],
  ];
  return roles.map(([member, area, work]) => ({
    member: contains(text, area) ? member : `${member} belirtilmemis`,
    responsibilityArea: area,
    workDone: contains(text, area) ? work : "Belgelerde net sorumlu bulunamadi.",
    contributionToEmphasize: contains(text, area)
      ? `${area} kapsamindaki teknik katkilar rapor/sunumda kanitla vurgulanmali.`
      : `${area} icin sorumlu kisi ve yapilan isler tanimlanmali.`,
  }));
}

function buildScheduleItems(report: ReportDraft, docs: BrainDocument[], checklist: DeliveryChecklistItem[]): ScheduleItem[] {
  const text = `${report.sections.map((section) => section.body).join(" ")} ${docs.map((doc) => doc.text).join(" ")}`;
  const riskyChecks = checklist.filter((item) => item.status === "Eksik" || item.status === "Riskli").slice(0, 8);
  const items = riskyChecks.map((check) => ({
    work: check.item,
    priority: check.status === "Riskli" ? "Kritik" : "Yuksek",
    owner: "Takim lideri",
    status: "Acik",
    deliveryImpact: check.note,
  })) satisfies ScheduleItem[];
  if (items.length) return items;
  return [
    {
      work: "Son DOCX/PDF teslim kontrolu",
      priority: contains(text, "teslim") ? "Yuksek" : "Kritik",
      owner: "Raporlama sorumlusu",
      status: "Kontrol edilmeli",
      deliveryImpact: "Format hatasi veya eksik kanit teslim puanini dusurebilir.",
    },
  ];
}

function buildLanguageImprovements(report: ReportDraft): LanguageImprovement[] {
  return report.sections.slice(0, 8).map((section) => {
    const first = splitSentences(section.body)[0] || section.body.slice(0, 180);
    return {
      section: section.title,
      shortCompetitionLanguage: `${section.title} bolumunde proje hedefi, kullanilan cozum ve dogrulama sonucu kisa ve net verilmelidir. ${first}`,
      technicalEngineeringLanguage: `${section.title} kapsaminda sistem gereksinimi, tasarim karari, uygulanan yontem ve dogrulama kriteri teknik terimlerle aciklanmalidir. ${first}`,
      strongJuryLanguage: `${section.title} bolumu, karar gerekcesini ve yarisma gorevine katkisini kanita dayali bicimde vurgulamalidir; kanitsiz basari iddiasi kullanilmamalidir. ${first}`,
    };
  });
}

function buildDefenseQuestions(report: ReportDraft, jury: JuryEvaluationItem[]): DefenseQuestion[] {
  const categoryQuestions = jury.slice(0, 10).map((item) => ({
    question: item.likelyQuestion,
    answerDraft: item.technicalAnswer,
    relatedSection: item.fixLocation,
  }));
  const sectionQuestions = report.sections.slice(0, 6).map((section) => ({
    question: `${section.title} bolumundeki tasarim kararinin en kritik teknik gerekcesi nedir?`,
    answerDraft: section.sourceIds.length
      ? "Karar, ilgili proje kaynaklarindaki gereksinim ve dogrulama bulgularina dayandirilmali; sayisal kanit varsa cevapta belirtilmelidir."
      : "Bu bolum icin kaynak zayif; cevap oncesi proje belgesi veya test sonucu eklenmelidir.",
    relatedSection: section.title,
  }));
  return uniqueBy([...categoryQuestions, ...sectionQuestions], (item) => item.question).slice(0, 16);
}

function buildProjectUpdateSummary(report: ReportDraft, decisions: EngineeringDecision[], issues: ConsistencyIssue[]): ProjectUpdateSummary {
  const latest = decisions[0];
  return {
    newInfo: latest ? `${latest.decision}: ${latest.newState}` : "Yeni karar kaydi bulunmuyor.",
    affectedSections: latest?.affectedSections.length ? latest.affectedSections : report.sections.slice(0, 3).map((section) => section.title),
    visualsToUpdate: report.diagrams.map((diagram) => diagram.title).slice(0, 4),
    tablesToUpdate: ["Gereksinim eslestirme", "Test plani", "Risk analizi"],
    createsRiskOrInconsistency: issues.length ? `${issues.length} tutarlilik riski bulundu.` : "Belirgin yeni tutarsizlik bulunmadi.",
    shouldAddToDecisionMemory: latest ? "Hayir" : "Kontrol edilmeli",
  };
}

function buildSourceConfidence(report: ReportDraft, docs: BrainDocument[]): SourceConfidenceItem[] {
  const rows: SourceConfidenceItem[] = [];
  for (const section of report.sections) {
    const sectionSources = section.sourceIds
      .map((sourceId) => docs.find((doc) => doc.id === sourceId))
      .filter((doc): doc is BrainDocument => Boolean(doc));
    if (sectionSources.length === 0) {
      rows.push({
        section: section.title,
        source: "Kaynak yok",
        confidence: "Dusuk",
        note: "Bu bolum kesin ifade kullanmamalı; kaynak veya test sonucu eklenmeli.",
      });
      continue;
    }
    for (const source of sectionSources.slice(0, 3)) {
      rows.push({
        section: section.title,
        source: source.name,
        confidence: confidenceForSource(source),
        note: source.kind === "competition_brief" ? "Resmi gereksinim kaynagi." : source.kind === "sample_report" ? "Stil icin kullanilmali, teknik bilgi dogrulanmali." : "Proje kaynagi olarak bolumle eslestirildi.",
      });
    }
  }
  return rows.slice(0, 24);
}

function buildShorteningSuggestions(report: ReportDraft): ShorteningSuggestion[] {
  return report.sections
    .map((section) => {
      const wordCount = tokenize(section.body).length;
      const protectedSection = /sartname|mimari|guvenlik|test|risk|karar/i.test(section.title);
      return {
        section: section.title,
        priority: protectedSection ? 5 : wordCount > 180 ? 1 : wordCount > 120 ? 2 : 4,
        reason: wordCount > 180 ? "Bolum uzun; tekrar ve genel ifadeler kisaltilabilir." : "Bolum sayfa siniri icin kontrol edilmeli.",
        suggestedAction: protectedSection
          ? "Bu bolumu gereksiz yere kisaltma; tablo veya sekille daha yogun anlat."
          : "Tekrar eden cumleleri sil, genel girisi kisalt, uygun kisimlari tabloya cevir.",
      };
    })
    .sort((a, b) => a.priority - b.priority);
}

function listFiles(root: string, maxFiles: number) {
  const results: string[] = [];
  const queue = [root];
  while (queue.length && results.length < maxFiles) {
    const current = queue.shift() as string;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!["node_modules", ".git", ".next", "workspace"].includes(entry.name)) {
          queue.push(fullPath);
        }
      } else {
        results.push(fullPath);
      }
      if (results.length >= maxFiles) {
        break;
      }
    }
  }
  return results;
}

function inferKind(filePath: string, isSampleReport: boolean): DocumentKind {
  const extension = path.extname(filePath).toLowerCase();
  if (isSampleReport) return "sample_report";
  if (diagramExtensions.has(extension)) return "diagram";
  if (/sartname|brief|yarism|competition/i.test(filePath)) return "competition_brief";
  if (/toplanti|meeting|karar/i.test(filePath)) return "meeting_note";
  return "technical_doc";
}

async function extractText(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (textExtensions.has(extension)) {
    return fs.readFileSync(filePath, "utf8").slice(0, 120000);
  }
  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.slice(0, 120000);
  }
  if (extension === ".pdf") {
    const parsed = await extractPdfText(filePath);
    if (parsed.trim().length >= 40) {
      return parsed;
    }
    // unpdf metin cikaramazsa (taranmis/gorsel PDF) eski ham yontem yedek kalir.
    const raw = fs.readFileSync(filePath).toString("latin1");
    return raw
      .replace(/[^\x20-\x7E\n\r\t]+/g, " ")
      .split(/\s+/)
      .join(" ")
      .slice(0, 80000);
  }
  if (diagramExtensions.has(extension)) {
    return `Diagram veya gorsel dosyasi: ${path.basename(filePath)}`;
  }
  return "";
}

async function buildDocument(params: {
  teamId: string;
  competitionId?: string;
  scope?: "team" | "competition";
  fileName: string;
  sourcePath: string;
  storedPath?: string;
  size: number;
  kind: DocumentKind;
  isSampleReport: boolean;
  text: string;
}): Promise<BrainDocument> {
  const extension = path.extname(params.fileName).toLowerCase();
  const ownerId = params.scope === "competition" ? params.competitionId || "competition" : params.teamId;
  const docId = id("doc", `${ownerId}-${params.fileName}`);
  const cleanText = params.text.trim();
  return {
    id: docId,
    teamId: params.teamId,
    competitionId: params.competitionId,
    scope: params.scope || "team",
    name: params.fileName,
    kind: params.kind,
    extension,
    sourcePath: params.sourcePath,
    storedPath: params.storedPath,
    size: params.size,
    importedAt: now(),
    isSampleReport: params.isSampleReport,
    summary: summarize(cleanText, params.fileName),
    text: cleanText,
    chunks: chunkText(docId, cleanText || params.fileName),
  };
}

function summarize(text: string, fallback: string) {
  const firstSentence = text.split(/(?<=[.!?])\s+/).find((item) => item.trim().length > 20);
  return (firstSentence || fallback).replace(/\s+/g, " ").slice(0, 240);
}

function chunkText(documentId: string, text: string): DocumentChunk[] {
  const parts = text
    .split(/\n{2,}|(?=^#{1,3}\s)|(?=^\d+[\).\s])/m)
    .map((item) => item.trim())
    .filter(Boolean);
  const chunks: DocumentChunk[] = [];

  for (const part of parts.length ? parts : [text]) {
    const heading = extractHeading(part);
    const paragraphs = part.match(/[\s\S]{1,1400}(\s|$)/g) || [part];
    for (const paragraph of paragraphs) {
      const clean = paragraph.trim();
      if (!clean) continue;
      chunks.push({
        id: id("chunk", `${documentId}-${chunks.length}`),
        documentId,
        heading,
        text: clean,
        keywords: topKeywords(clean),
      });
    }
  }

  return chunks.slice(0, 100);
}

function extractHeading(text: string) {
  const firstLine = text.split(/\r?\n/)[0].replace(/^#+\s*/, "").trim();
  if (firstLine.length <= 80) {
    return firstLine;
  }
  return "Belge parcasi";
}

// Yuklenen rapor metninden numarali bolum basliklarini belge sirasinda cikarir.
// "1. PROJE OZETI (5 PUAN)" / "3.1. Sistem Blok Semasi (5 Puan)" gibi
// puan etiketli basliklar en guvenilir yapisal sinyaldir.
function extractReportHeadings(text: string): string[] {
  const re = /(?<![\d.])(\d{1,2}(?:\.\d{1,2})*)\.\s+([A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü ]{2,55}?)\s*\(\s*\d+\s*(?:PUAN|Puan|puan)\s*\)/g;
  const out: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) && out.length < 16) {
    const title = match[2].replace(/\s+/g, " ").trim();
    if (title.length >= 3 && !out.includes(title)) out.push(title);
  }
  return out;
}

async function refreshProfile(store: BrainStore, teamId: string) {
  const sampleDocs = store.documents.filter((doc) => doc.scope !== "competition" && doc.teamId === teamId && doc.isSampleReport);
  const language: ReportLanguage = "tr";
  const analyses = await Promise.all(sampleDocs.map((doc) => analyzeTemplateDocument(doc)));
  const tableTemplates = analyses.flatMap((analysis) => analysis.tableTemplates).slice(0, 8);
  const coverImage = analyses.find((analysis) => analysis.coverImagePath);

  // Once: yuklenen raporun gercek numarali baslik yapisini cikar (en guclu sinyal).
  const numberedHeadings = unique(sampleDocs.flatMap((doc) => extractReportHeadings(doc.text)));
  // Yedek: satir bazli sezgisel baslik yakalama.
  const lineHeadings = unique(
    sampleDocs
      .flatMap((doc) => doc.text.split(/\r?\n/))
      .map((line) => line.replace(/^#+\s*/, "").replace(/^\d+[\).\s-]*/, "").trim())
      .filter((line) => line.length >= 5 && line.length <= 80)
      .filter((line) => isLikelyHeading(line)),
  );
  const extractedHeadings = numberedHeadings.length >= 4 ? numberedHeadings : lineHeadings;

  const profile = store.profiles.find((item) => item.teamId === teamId && item.language === language);
  const base = profile || seedProfile(teamId, language);
  const nextProfile = {
    ...base,
    sourceDocumentIds: sampleDocs.map((doc) => doc.id),
    sourceDocumentNames: sampleDocs.map((doc) => doc.name),
    headings: extractedHeadings.slice(0, 8).length >= 4 ? extractedHeadings.slice(0, 8) : base.headings,
    layoutRules: inferLayoutRules(sampleDocs, tableTemplates, Boolean(coverImage)),
    tableTemplates,
    coverImagePath: coverImage?.coverImagePath,
    coverImageContentType: coverImage?.coverImageContentType,
    updatedAt: now(),
  };

  if (profile) {
    Object.assign(profile, nextProfile);
  } else {
    store.profiles.push(nextProfile);
  }
}

type TemplateDocumentAnalysis = {
  tableTemplates: ReportTableTemplate[];
  coverImagePath?: string;
  coverImageContentType?: string;
};

async function analyzeTemplateDocument(doc: BrainDocument): Promise<TemplateDocumentAnalysis> {
  const analysis: TemplateDocumentAnalysis = { tableTemplates: [] };
  const extension = doc.extension.toLowerCase();

  if (isRasterImageExtension(extension)) {
    return {
      tableTemplates: extractTextTableTemplates(doc.text, doc.name),
      coverImagePath: doc.sourcePath,
      coverImageContentType: contentTypeForExtension(extension),
    };
  }

  if (extension === ".docx" && fs.existsSync(doc.sourcePath)) {
    try {
      let extractedCover: Pick<TemplateDocumentAnalysis, "coverImagePath" | "coverImageContentType"> = {};
      const options = {
        convertImage: mammoth.images.imgElement(async (image) => {
          if (!extractedCover.coverImagePath) {
            const contentType = image.contentType || "image/png";
            const ext = extensionForContentType(contentType);
            const bytes = Buffer.from(await image.read("base64"), "base64");
            const assetRoot = path.join(storeRoot, "template-assets", doc.teamId);
            fs.mkdirSync(assetRoot, { recursive: true });
            const assetPath = path.join(assetRoot, `${doc.id}-cover.${ext}`);
            fs.writeFileSync(assetPath, bytes);
            extractedCover = { coverImagePath: assetPath, coverImageContentType: contentType };
          }
          return { src: "" };
        }),
      };
      const html = await mammoth.convertToHtml({ path: doc.sourcePath }, options);
      return {
        tableTemplates: extractHtmlTableTemplates(html.value, doc.name),
        ...extractedCover,
      };
    } catch (error) {
      console.error("Template document analysis failed", error);
    }
  }

  return {
    tableTemplates: extractTextTableTemplates(doc.text, doc.name),
  };
}

function buildReportFormatProfile(profile: TemplateProfile): ReportFormatProfile {
  return {
    sourceDocumentIds: profile.sourceDocumentIds || [],
    sourceDocumentNames: profile.sourceDocumentNames || [],
    layoutRules: profile.layoutRules || [],
    tableTemplates: (profile.tableTemplates || []).map((table) => ({
      ...table,
      headers: [...table.headers],
      sampleRows: table.sampleRows.map((row) => [...row]),
    })),
    coverImagePath: profile.coverImagePath,
    coverImageContentType: profile.coverImageContentType,
  };
}

function inferLayoutRules(sampleDocs: BrainDocument[], tableTemplates: ReportTableTemplate[], hasCoverImage: boolean) {
  if (sampleDocs.length === 0) {
    return seedProfile("template", "tr").layoutRules;
  }

  const rules = [
    `Format kaynagi olarak ${sampleDocs.map((doc) => doc.name).join(", ")} kullanildi.`,
    "Bolum sirasi ve baslik mantigi yuklenen basarili rapor orneklerinden alindi.",
    "DOCX ciktisinda rapor kapagi, tablo iskeletleri ve kaynakli bolum duzeni sablon profiline gore kurulur.",
  ];
  if (hasCoverImage) {
    rules.push("Ornek raporda bulunan ilk gorsel kapak gorseli olarak kullanilir.");
  }
  if (tableTemplates.length > 0) {
    rules.push(`${tableTemplates.length} tablo iskeleti ornek rapordan alindi; eksik proje verisi olan hucreler doldurulacak alan olarak birakilir.`);
  } else {
    rules.push("Ornek raporda okunabilir tablo bulunamazsa rapor bolumleri kaynakli metin ve gorsel onerilerle duzenlenir.");
  }
  return rules;
}

function extractHtmlTableTemplates(html: string, sourceDocumentName: string): ReportTableTemplate[] {
  const tables = html.match(/<table[\s\S]*?<\/table>/gi) || [];
  return tables
    .map((tableHtml, index) => {
      const rows = (tableHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [])
        .map((rowHtml) =>
          (rowHtml.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [])
            .map((cell) => cleanHtml(cell))
            .filter(Boolean),
        )
        .filter((row) => row.length > 0);
      return buildTableTemplate(rows, sourceDocumentName, index + 1);
    })
    .filter(Boolean)
    .slice(0, 8) as ReportTableTemplate[];
}

function extractTextTableTemplates(text: string, sourceDocumentName: string): ReportTableTemplate[] {
  const lines = text.split(/\r?\n/);
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isTableLine = line.includes("|") && line.split("|").filter((cell) => cell.trim()).length >= 2;
    if (isTableLine) {
      current.push(line);
    } else if (current.length > 0) {
      blocks.push(current);
      current = [];
    }
  }
  if (current.length > 0) blocks.push(current);

  return blocks
    .map((block, index) => {
      const rows = block
        .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean))
        .filter((row) => row.length > 1)
        .filter((row) => !row.every((cell) => /^-+$/.test(cell.replace(/:/g, ""))));
      return buildTableTemplate(rows, sourceDocumentName, index + 1);
    })
    .filter(Boolean)
    .slice(0, 8) as ReportTableTemplate[];
}

function buildTableTemplate(rows: string[][], sourceDocumentName: string, index: number): ReportTableTemplate | null {
  if (rows.length === 0) return null;
  const headers = rows[0].map((header, headerIndex) => sanitizeCell(header) || `Alan ${headerIndex + 1}`).slice(0, 8);
  if (headers.length < 2) return null;
  const sampleRows = rows.slice(1, 4).map((row) => headers.map((_, cellIndex) => sanitizeCell(row[cellIndex] || "")));
  return {
    title: `Tablo ${index}`,
    headers,
    sampleRows,
    sourceDocumentName,
  };
}

function cleanHtml(value: string) {
  return sanitizeCell(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"'),
  );
}

function sanitizeCell(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 120);
}

function isRasterImageExtension(extension: string) {
  return [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"].includes(extension);
}

function isImageExtension(extension: string) {
  return [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg"].includes(extension);
}

function contentTypeForExtension(extension: string) {
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".gif") return "image/gif";
  if (extension === ".bmp") return "image/bmp";
  if (extension === ".webp") return "image/webp";
  if (extension === ".svg") return "image/svg+xml";
  return "image/png";
}

function extensionForContentType(contentType: string) {
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("bmp")) return "bmp";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("svg")) return "svg";
  return "png";
}

function isLikelyHeading(line: string) {
  if (/[:.;,]$/.test(line)) return false;
  const words = line.split(/\s+/);
  if (words.length > 10) return false;
  return /ozet|problem|tasarim|sistem|mekanik|elektronik|yazilim|test|dogrulama|risk|sonuc|analiz|butce|takvim|gereksinim/i.test(
    line,
  );
}

function searchStore(store: BrainStore, teamId: string, query: string, limit = 6): RankedChunk[] {
  const terms = tokenize(query);
  if (terms.length === 0) {
    return [];
  }

  const docs = [
    ...store.documents.filter((doc) => doc.scope !== "competition" && doc.teamId === teamId),
    ...competitionDocumentsForTeam(store, teamId),
  ];

  return docs
    .flatMap((doc) =>
      doc.chunks.map((chunk) => ({
        documentId: doc.id,
        documentName: doc.scope === "competition" ? `[Yarışma] ${doc.name}` : doc.name,
        chunkId: chunk.id,
        heading: chunk.heading,
        excerpt: chunk.text.slice(0, 700),
        score: scoreText(`${doc.name} ${doc.kind} ${chunk.heading} ${chunk.text} ${chunk.keywords.join(" ")}`, terms),
      })),
    )
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function selectSourcesForReport(
  store: BrainStore,
  teamId: string,
  params: { title: string; competition: string; reportType: string; brief: string },
  headings: string[],
): SourceRef[] {
  const queryBase = [params.title, params.competition, params.reportType, params.brief].join(" ");
  const perHeading = headings.flatMap((heading) => searchStore(store, teamId, `${heading} ${queryBase}`, 4));
  const broad = searchStore(store, teamId, queryBase, 16);
  const merged = uniqueBy([...perHeading, ...broad], (item) => item.chunkId).slice(0, 24);
  return merged.map((match) => ({
    documentId: match.documentId,
    documentName: match.documentName,
    chunkId: match.chunkId,
    excerpt: match.excerpt,
  }));
}

async function generateSectionsWithAi(
  store: BrainStore,
  params: { title: string; competition: string; year: string; reportType: string; language: ReportLanguage; brief: string },
  profile: TemplateProfile,
  headings: string[],
  sources: SourceRef[],
  diagrams: DiagramSuggestion[],
): Promise<{ sections: ReportSection[]; missingInfo: string[] } | null> {
  if (!process.env.OPENAI_API_KEY || sources.length === 0) {
    return null;
  }

  try {
    const prompt = buildAiPrompt(params, profile, headings, sources, diagrams);
    const content = await createOpenAiJsonResponse(store, {
      instructions:
        "You are a senior engineering report writer. Use only provided source excerpts. Do not invent facts. Return strict JSON.",
      input: prompt,
      maxOutputTokens: 5000,
    });
    if (!content) return null;
    const parsed = JSON.parse(content) as {
      sections?: { title?: string; body?: string; sourceIds?: string[] }[];
      missingInfo?: string[];
    };
    return {
      sections:
        parsed.sections?.map((section) => ({
          title: String(section.title || ""),
          body: String(section.body || ""),
          sourceIds: Array.isArray(section.sourceIds) ? section.sourceIds.map(String) : [],
        })) || [],
      missingInfo: Array.isArray(parsed.missingInfo) ? parsed.missingInfo.map(String) : [],
    };
  } catch (error) {
    console.error("AI report generation failed", error);
    return null;
  }
}

function buildAiPrompt(
  params: { title: string; competition: string; year: string; reportType: string; language: ReportLanguage; brief: string },
  profile: TemplateProfile,
  headings: string[],
  sources: SourceRef[],
  diagrams: DiagramSuggestion[],
) {
  const sourceBlock = sources
    .map(
      (source, index) =>
        `[S${index + 1}] documentId=${source.documentId} chunkId=${source.chunkId} name=${source.documentName}\n${source.excerpt}`,
    )
    .join("\n\n");
  const diagramBlock = diagrams.map((diagram) => `${diagram.title}: ${diagram.reason}`).join("\n");
  const formatBlock = [
    ...profile.layoutRules.map((rule) => `- ${rule}`),
    ...(profile.tableTemplates.length > 0
      ? [
          "",
          "Template table structures:",
          ...profile.tableTemplates.map(
            (table, index) =>
              `${index + 1}. ${table.title} from ${table.sourceDocumentName}: columns = ${table.headers.join(" | ")}`,
          ),
        ]
      : []),
  ].join("\n");

  return `Write a polished ${params.language === "tr" ? "Turkish" : "English"} engineering competition report draft.

Report:
- Title: ${params.title}
- Competition: ${params.competition}
- Year: ${params.year}
- Type: ${params.reportType}
- User brief: ${params.brief || "No extra brief"}

Required section titles, in this order:
${headings.map((heading, index) => `${index + 1}. ${heading}`).join("\n")}

Style rules:
${profile.toneRules.map((rule) => `- ${rule}`).join("\n")}

Evidence rules:
${profile.evidenceRules.map((rule) => `- ${rule}`).join("\n")}

Format/template rules from uploaded successful report samples:
${formatBlock || "- No uploaded template profile is available; use the default engineering report structure."}

Available diagram hints:
${diagramBlock || "No diagram hints."}

Source excerpts:
${sourceBlock}

Return JSON only:
{
  "sections": [
    { "title": "same title from required list", "body": "well-written paragraph(s), no invented facts", "sourceIds": ["document ids used"] }
  ],
  "missingInfo": ["specific missing information the team must provide before final submission"]
}

Rules:
- Put each fact in the most relevant section.
- Do not mention a source excerpt unless it actually supports the sentence.
- Follow the uploaded sample report's section order, table intent, cover/formality, and evidence style.
- If the template has tables, write the surrounding section text so those tables can be filled with project evidence.
- If a required section has weak evidence, write a short cautious draft and add a missingInfo item.
- Do not include markdown fences.`;
}

function normalizeAiSections(
  aiSections: ReportSection[],
  headings: string[],
  sources: SourceRef[],
  fallbackSections: ReportSection[],
): ReportSection[] {
  return headings.map((heading, index) => {
    const ai = aiSections.find((section) => section.title.toLocaleLowerCase("tr-TR") === heading.toLocaleLowerCase("tr-TR"));
    if (!ai?.body.trim()) {
      return fallbackSections[index];
    }
    const validSourceIds = unique(ai.sourceIds.filter((sourceId) => sources.some((source) => source.documentId === sourceId)));
    return {
      title: heading,
      body: ai.body.trim(),
      sourceIds: validSourceIds,
    };
  });
}

function buildFallbackSection(
  heading: string,
  index: number,
  params: { title: string; competition: string; year: string; reportType: string; language: ReportLanguage; brief: string },
  sources: SourceRef[],
): ReportSection {
  const related = sources.slice(index * 2, index * 2 + 3);
  const sourceText = related.map((source) => source.excerpt).join(" ");
  const intro =
    params.language === "tr"
      ? `${params.title} kapsaminda ${params.competition} ${params.year} ${params.reportType} icin bu bolum kaynak belgeler kullanilarak taslaklandi.`
      : `This section was drafted for ${params.competition} ${params.year} ${params.reportType} using indexed project sources.`;
  const evidence =
    sourceText.length > 40
      ? params.language === "tr"
        ? ` Kaynaklarda bu bolumle iliskili olarak su bilgiler one cikiyor: ${sourceText.slice(0, 900)}`
        : ` The relevant project sources indicate: ${sourceText.slice(0, 900)}`
      : params.language === "tr"
        ? " Bu bolum icin proje belgelerinde yeterli ayrinti bulunamadi; ekip tarafindan teknik veri eklenmelidir."
        : "The indexed project files do not include enough detail for this section; the team must add technical evidence.";

  return {
    title: heading,
    body: `${intro} ${params.brief ? `Kullanici notu: ${params.brief}.` : ""}${evidence}`,
    sourceIds: related.map((source) => source.documentId),
  };
}

function suggestDiagrams(store: BrainStore, teamId: string, title: string, brief: string): DiagramSuggestion[] {
  const docs = store.documents.filter((doc) => doc.teamId === teamId && doc.kind === "diagram").slice(0, 4);
  const suggestions: DiagramSuggestion[] = docs.map((doc) => ({
    title: doc.name,
    type: "existing",
    documentId: doc.id,
    path: doc.sourcePath,
    reason: "Takim klasorunde mevcut diagram/gorsel olarak bulundu.",
  }));

  suggestions.push({
    title: "Sistem akisi taslagi",
    type: "mermaid",
    mermaid: `flowchart LR
  A[Yarisma ihtiyaci] --> B[Alt sistem tasarimi]
  B --> C[Prototip]
  C --> D[Test ve dogrulama]
  D --> E[Rapor ve teslim]`,
    reason: brief || title ? "Rapor taslaginda surec anlatimi icin basit Mermaid akisi onerildi." : "Genel rapor akisi icin basit Mermaid onerisi.",
  });

  return suggestions.slice(0, 5);
}

function buildMissingInfo(params: { brief: string; language: ReportLanguage }, sources: SourceRef[], diagramCount: number) {
  const tr = params.language === "tr";
  const missing = [
    tr ? "Sayisal performans metrikleri ve test sonuclari dogrulanmali." : "Numerical performance metrics and test results must be verified.",
    tr ? "Kritik tasarim kararlarinin tarih, sorumlu ve kaynak bilgisi eklenmeli." : "Critical design decisions need date, owner, and source details.",
  ];
  if (sources.length < 3) {
    missing.push(tr ? "Bu taslak icin indekslenmis kaynak sayisi dusuk; daha fazla proje belgesi eklenmeli." : "The draft has limited indexed evidence; add more project documents.");
  }
  if (diagramCount === 0) {
    missing.push(tr ? "Rapor bolumlerine uygun diagram veya gorsel eklenmeli." : "Add diagrams or figures for the relevant report sections.");
  }
  if (!params.brief.trim()) {
    missing.push(tr ? "Yeni sezon hedefleri ve teknik degisiklikler kisa not olarak girilmeli." : "Add a short note about current season goals and technical changes.");
  }
  return missing;
}

function tokenize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9ıüğşöçİĞÜŞÖÇ]+/i)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

function topKeywords(text: string) {
  const counts = new Map<string, number>();
  for (const term of tokenize(text)) {
    counts.set(term, (counts.get(term) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([term]) => term);
}

function scoreText(text: string, terms: string[]) {
  const target = tokenize(text).join(" ");
  return terms.reduce((score, term) => score + (target.includes(term) ? 1 : 0), 0);
}

function contains(text: string, pattern: string) {
  return text.toLocaleLowerCase("tr-TR").includes(pattern.toLocaleLowerCase("tr-TR"));
}

function extractRequirements(docs: BrainDocument[]) {
  const requirementDocs = docs.filter((doc) => doc.kind === "competition_brief" || /sartname|brief|yarism/i.test(doc.name));
  const lines = requirementDocs
    .flatMap((doc) => doc.text.split(/\r?\n|(?<=\.)\s+/))
    .map((line) => line.trim())
    .filter((line) => line.length >= 25 && line.length <= 260)
    .filter((line) => /gereklidir|zorunlu|olmalidir|olmalı|shall|must|teslim|sayfa|guvenlik|boyut|agirlik|puan|test|rapor/i.test(line));

  const extracted = unique(lines).slice(0, 18);
  if (extracted.length) return extracted;

  return [
    "Rapor, sistem mimarisini ve alt sistem iliskilerini acik sekilde anlatmalidir.",
    "Mekanik tasarim, elektronik tasarim ve yazilim mimarisi ayri bolumlerde sunulmalidir.",
    "Test ve dogrulama plani basari kriterleriyle birlikte verilmelidir.",
    "Risk analizi uygulanabilir onlemler ve dogrulama yontemleriyle yazilmalidir.",
    "Gorseller numaralandirilmali ve teknik aciklama ile desteklenmelidir.",
    "Teslim dosyasi yarisma formatina uygun ve eksiksiz olmalidir.",
  ];
}

function bestSectionMatch(report: ReportDraft, terms: string[]) {
  const scored = report.sections
    .map((section) => ({ section, score: scoreText(`${section.title} ${section.body}`, terms) }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0].section : undefined;
}

function bestSectionByTitle(report: ReportDraft, category: string) {
  return bestSectionMatch(report, tokenize(category)) || report.sections.find((section) => scoreText(section.title, tokenize(category)) > 0);
}

function sectionBody(section?: ReportSection) {
  return section ? `${section.title} ${section.body}` : "";
}

function isContradicting(requirement: string, reportText: string) {
  if (!reportText) return false;
  if (/maksimum|en fazla|asamaz|ust sinir/i.test(requirement) && /asildi|daha fazla|ustunde/i.test(reportText)) return true;
  if (/zorunlu|gereklidir|olmalidir/i.test(requirement) && /yok|bulunmuyor|kullanilmadi/i.test(reportText)) return true;
  return false;
}

function findSectionsContaining(report: ReportDraft, terms: string[]) {
  return report.sections
    .filter((section) => terms.some((term) => contains(`${section.title} ${section.body}`, term)))
    .map((section) => section.title);
}

function findMetricConflicts(report: ReportDraft): ConsistencyIssue[] {
  const all = report.sections.flatMap((section) => {
    const matches = section.body.match(/\b\d+(?:[.,]\d+)?\s?(?:mm|cm|m|kg|g|v|a|w|rpm|mah|ms|s|hz)\b/gi) || [];
    return matches.map((value) => ({ section: section.title, value: value.toLocaleLowerCase("tr-TR") }));
  });
  const byUnit = new Map<string, { section: string; value: string }[]>();
  for (const item of all) {
    const unit = item.value.replace(/[0-9.,\s]/g, "");
    byUnit.set(unit, [...(byUnit.get(unit) || []), item]);
  }
  const issues: ConsistencyIssue[] = [];
  for (const [unit, values] of byUnit) {
    const uniqueValues = unique(values.map((item) => item.value));
    if (uniqueValues.length > 3 && values.length > 5) {
      issues.push({
        inconsistency: `${unit} biriminde birden fazla teknik deger geciyor.`,
        locations: unique(values.map((item) => item.section)).join(", "),
        risk: "Olcu, guc veya performans degerleri farkli bolumlerde karisabilir.",
        suggestedFix: "Ayni parametreye ait degerleri tek tabloda topla; eski ve guncel degerleri ayir.",
      });
    }
  }
  return issues.slice(0, 4);
}

function categoryScore(
  category: string,
  report: ReportDraft,
  requirements: RequirementMatch[],
  issues: ConsistencyIssue[],
  sectionScores: SectionQualityScore[],
  tests: TestPlanItem[],
  risks: RiskAnalysisItem[],
  visuals: VisualQualityItem[],
) {
  const base = average(sectionScores.map((item) => item.score));
  if (contains(category, "Sartname")) {
    return clamp(55 + requirements.filter((item) => item.status === "Karsilanmis").length * 8 - requirements.filter((item) => item.status === "Eksik").length * 6, 25, 95);
  }
  if (contains(category, "Test")) {
    return clamp(45 + tests.filter((item) => item.status !== "Eksik").length * 5, 25, 95);
  }
  if (contains(category, "Risk")) {
    return clamp(45 + risks.filter((item) => item.riskLevel !== "Yuksek").length * 5, 25, 92);
  }
  if (contains(category, "Gorsel")) {
    return clamp(50 + visuals.length * 8, 25, 92);
  }
  if (contains(category, "tutarlilik")) {
    return clamp(90 - issues.length * 12, 25, 95);
  }
  const section = bestSectionByTitle(report, category);
  const sectionScore = sectionScores.find((item) => item.section === section?.title)?.score;
  return clamp(sectionScore || base, 25, 95);
}

function missingForCategory(category: string, requirements: RequirementMatch[], tests: TestPlanItem[], risks: RiskAnalysisItem[], visuals: VisualQualityItem[]) {
  if (contains(category, "Sartname")) return requirements.find((item) => item.status !== "Karsilanmis")?.missing || "Sartname eslestirmesi korunmali.";
  if (contains(category, "Test")) return tests.find((item) => item.status === "Eksik")?.testName || "Testlerin olcum yontemi netlestirilmeli.";
  if (contains(category, "Risk")) return risks.find((item) => item.riskLevel === "Yuksek")?.risk || "Risk dogrulamasi guclendirilmeli.";
  if (contains(category, "Gorsel")) return visuals.find((item) => item.missing)?.missing || "Gorsel alt aciklamalari kontrol edilmeli.";
  return "Kaynak, metrik veya dogrulama kaniti eklenmeli.";
}

function scoreBoostForCategory(category: string) {
  if (contains(category, "Sartname")) return "Her sartname maddesini raporda bir bolum, kanit ve gorselle eslestir.";
  if (contains(category, "Test")) return "Her test icin girdi, beklenen cikti, basari kriteri ve olcum yontemi ekle.";
  if (contains(category, "Risk")) return "Riskleri olasilik-etki-onlem-dogrulama yapisiyla tabloya cevir.";
  if (contains(category, "Gorsel")) return "Sekil numarasi, alt aciklama, etiket ve olcu bilgisi ekle.";
  return "Teknik karari gerekce, kaynak ve dogrulama sonucu ile destekle.";
}

function likelyQuestionForCategory(category: string) {
  if (contains(category, "Sartname")) return "Bu tasarim sartnamenin hangi maddelerini nasil karsiliyor?";
  if (contains(category, "Mekanik")) return "Mekanik tasarimda bu aktarma/govde kararini neden sectiniz?";
  if (contains(category, "Elektronik")) return "Guc dagitimi ve guvenlik arizalarina karsi hangi onlemler var?";
  if (contains(category, "Yazilim")) return "Yazilim mimarisi hata durumlarini ve haberlesme gecikmesini nasil yonetiyor?";
  if (contains(category, "Test")) return "Bu sistemin basari kriterlerini hangi testlerle kanitladiniz?";
  if (contains(category, "Risk")) return "Yarismada en kritik riskiniz nedir ve nasil azaltildi?";
  return "Bu bolumdeki iddianin teknik kaniti nedir?";
}

function technicalAnswerForCategory(category: string) {
  if (contains(category, "Sartname")) return "Cevap, sartname maddesi, rapordaki ilgili bolum ve varsa test/gorsel kaniti birlikte referans vermelidir.";
  if (contains(category, "Test")) return "Cevap, test amaci, girdi, basari kriteri, olcum yontemi ve mevcut sonucu kisa bicimde vermelidir.";
  if (contains(category, "Risk")) return "Cevap, riskin olasilik-etki seviyesini, uygulanan onlemi ve dogrulama yontemini belirtmelidir.";
  return "Cevap, tasarim kararinin gerekcesini, alternatifleri ve kanitlanan sonucu teknik ama abartisiz anlatmalidir.";
}

function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 20);
}

function sentenceSimilarity(a: string, b: string) {
  const aTerms = new Set(tokenize(a));
  const bTerms = new Set(tokenize(b));
  const intersection = Array.from(aTerms).filter((term) => bTerms.has(term)).length;
  const union = new Set([...aTerms, ...bTerms]).size || 1;
  return intersection / union;
}

function inferStageFromName(name: string) {
  if (/otr|on tasarim/i.test(name)) return "On Tasarim Raporu";
  if (/ktr|kritik/i.test(name)) return "Kritik Tasarim Raporu";
  if (/final|sunum/i.test(name)) return "Final Sunumu";
  return "Proje gelisimi";
}

function guessSectionForVisual(report: ReportDraft, diagram: DiagramSuggestion) {
  return bestSectionMatch(report, tokenize(`${diagram.title} ${diagram.reason}`))?.title || "Sistem Tasarimi";
}

function confidenceForSource(source: BrainDocument): SourceConfidenceItem["confidence"] {
  if (source.kind === "competition_brief" || source.kind === "technical_doc") return "Yuksek";
  if (source.kind === "sample_report" || source.kind === "meeting_note") return "Orta";
  return "Dusuk";
}

function checklistScore(items: DeliveryChecklistItem[]) {
  if (!items.length) return 0;
  const total = items.reduce((sum, item) => {
    if (item.status === "Tamam") return sum + 100;
    if (item.status === "Kontrol edilmeli") return sum + 65;
    if (item.status === "Riskli") return sum + 35;
    return sum + 10;
  }, 0);
  return total / items.length;
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function learnFromFeedback(params: {
  competition: string;
  year: string;
  reportType: string;
  score?: number | null;
  maxScore?: number | null;
  passStatus: string;
  juryFeedback: string;
  scoreLossReasons: string;
  missingSections: string;
  strongSections: string;
  specNotes: string;
  userComment: string;
}): LearnedFeedback {
  const allFeedback = [
    params.juryFeedback,
    params.scoreLossReasons,
    params.missingSections,
    params.specNotes,
    params.userComment,
  ].join("\n");
  const categories = categorizeScoreLoss(allFeedback);
  const ratio = params.score && params.maxScore ? params.score / params.maxScore : null;
  const strengths = splitList(params.strongSections).length ? splitList(params.strongSections) : inferStrengths(allFeedback);
  const mistakes = categories.map((category) => mistakeForCategory(category));
  const checklist = categories.map((category) => checklistForCategory(category));

  return {
    resultSummary: `${params.competition} ${params.year} ${params.reportType}: ${params.score ?? "puan bilinmiyor"} / ${params.maxScore ?? "maksimum bilinmiyor"} - ${params.passStatus || "sonuc belirtilmedi"}`,
    scoreMeaning: scoreMeaning(ratio),
    strengths,
    scoreLossCategories: categories,
    classifiedJuryFeedback: classifyJuryFeedback(params.juryFeedback, categories),
    mistakesToAvoid: unique(mistakes),
    futureChecklistItems: unique(checklist),
    generalLesson: categories.length
      ? `Yeni raporlarda en cok ${categories.slice(0, 3).join(", ")} basliklari kontrol edilmeli.`
      : "Geri bildirim sinirli; kesin puan kaybi sebebi uydurulmadan ek kanit istenmeli.",
    competitionSpecificLesson: competitionSpecificLesson(params.competition, categories, params.specNotes),
  };
}

function categorizeScoreLoss(text: string): ScoreLossCategory[] {
  const categoryKeywords: [ScoreLossCategory, string[]][] = [
    ["Sartname uyumsuzlugu", ["sartname", "format", "sablon", "sayfa", "teslim", "uygun"]],
    ["Eksik teknik aciklama", ["eksik teknik", "aciklama", "detay", "nasil", "gerekce"]],
    ["Yetersiz sistem mimarisi", ["mimari", "blok", "sistem yapisi", "alt sistem"]],
    ["Zayif mekanik anlatim", ["mekanik", "govde", "pan", "tilt", "aktarma", "cizim"]],
    ["Zayif elektronik anlatim", ["elektronik", "guc", "surucu", "esp32", "kart", "sensor"]],
    ["Zayif yazilim/algoritma anlatimi", ["yazilim", "algoritma", "python", "yolo", "model", "websocket", "uart"]],
    ["Guvenlik eksikligi", ["guvenlik", "acil", "durdurma", "yasak", "emniyet"]],
    ["Test/dogrulama eksikligi", ["test", "dogrulama", "olcum", "basari kriteri", "sonuc"]],
    ["Risk analizi eksikligi", ["risk", "onlem", "olasilik", "etki"]],
    ["Gorsel/sema/teknik cizim eksikligi", ["gorsel", "sema", "diagram", "cizim", "sekil"]],
    ["Takim plani veya is paketi eksikligi", ["takim", "is paketi", "sorumlu", "gorev dagilimi", "takvim"]],
    ["Rapor dili ve duzen problemi", ["dil", "duzen", "tekrar", "anlatim", "yazi"]],
    ["Kanitsiz iddia veya abartili ifade", ["kanit", "iddia", "abarti", "yuksek dogruluk", "hizli", "kararli"]],
    ["Yarisma gorevleriyle zayif iliski", ["gorev", "asama", "hedef", "senaryo", "yarism"]],
  ];
  const found = categoryKeywords.filter(([, keywords]) => keywords.some((keyword) => contains(text, keyword))).map(([category]) => category);
  return Array.from(new Set(found));
}

function classifyJuryFeedback(feedback: string, categories: ScoreLossCategory[]) {
  if (!feedback.trim()) return ["Juri geri bildirimi girilmedi; analiz kullanici notlari ve puan bilgisiyle sinirli."];
  if (!categories.length) return [`Genel juri yorumu: ${feedback}`];
  return categories.map((category) => `${category}: ${feedback.slice(0, 220)}`);
}

function inferStrengths(text: string) {
  const strengths = [];
  if (/mimari|blok|sistem/i.test(text)) strengths.push("Sistem mimarisi");
  if (/test|dogrulama/i.test(text)) strengths.push("Test ve dogrulama");
  if (/gorsel|diagram|cizim/i.test(text)) strengths.push("Gorsel anlatim");
  return strengths.length ? strengths : ["Gucu belirtilmedi; kullanici tarafindan netlestirilmeli."];
}

function scoreMeaning(ratio: number | null) {
  if (ratio === null) return "Puan bilgisi eksik; kesin bant yorumu yapilamaz.";
  if (ratio >= 0.85) return "Guçlu sonuc; puan kayiplari buyuk olasilikla ince format, kanit veya bolum derinligi kaynakli olabilir.";
  if (ratio >= 0.65) return "Orta-guçlu sonuc; teknik kanit, sartname eslesmesi ve test plani puan artirabilir.";
  if (ratio >= 0.45) return "Riskli sonuc; temel bolumlerde eksik veya juri beklentisiyle zayif eslesme olabilir.";
  return "Kritik sonuc; rapor yapisi, gorev uyumu ve teknik kanitlar bastan kontrol edilmeli.";
}

function competitionSpecificLesson(competition: string, categories: ScoreLossCategory[], specNotes: string) {
  if (isCelikkubbe(competition)) {
    return "Celikkubbe icin hedef tespit, dost/dusman ayrimi, manuel/otonom mod, ESP32, WebSocket/UART, pan-tilt ve 5/10/15 m senaryolari ayri ayri kontrol edilmeli.";
  }
  if (specNotes.trim()) return `Yarismaya ozel not: ${specNotes.slice(0, 260)}`;
  if (categories.includes("Sartname uyumsuzlugu")) return "Bu ders yarisma/sablon ozelidir; baska yarismaya dogrudan kopyalanmamalidir.";
  return "Bu ders genel teknik rapor kalitesiyle ilgilidir; benzer yarismalarda da kontrol maddesi olarak kullanilabilir.";
}

function mistakeForCategory(category: ScoreLossCategory) {
  const map: Record<ScoreLossCategory, string> = {
    "Sartname uyumsuzlugu": "Sablon, sayfa siniri ve sartname maddeleri son teslimden once tek tek eslestirilmeli.",
    "Eksik teknik aciklama": "Sadece yapilacak demek yerine nasil, hangi parca/yontemle ve neden sorulari cevaplanmali.",
    "Yetersiz sistem mimarisi": "Alt sistemler, veri akisi ve kontrol akisi blok diyagramla anlatilmali.",
    "Zayif mekanik anlatim": "Mekanik kararlar teknik cizim, olcu, malzeme ve gerekceyle desteklenmeli.",
    "Zayif elektronik anlatim": "Guc, sensor, surucu ve kontrol karti iliskisi sema ile anlatilmali.",
    "Zayif yazilim/algoritma anlatimi": "Algoritma, moduller, haberlesme ve hata durumlari net yazilmali.",
    "Guvenlik eksikligi": "Acil durdurma, hata durumu ve yarisma guvenligi kritik risk olarak ele alinmali.",
    "Test/dogrulama eksikligi": "Her iddia icin olculebilir test ve basari kriteri eklenmeli.",
    "Risk analizi eksikligi": "Riskler olasilik, etki, onlem ve dogrulama ile tabloya alinmali.",
    "Gorsel/sema/teknik cizim eksikligi": "Teknik cizim, blok diyagram ve akış semasi dogru bolumlere yerlestirilmeli.",
    "Takim plani veya is paketi eksikligi": "Sorumlular, is paketleri ve takvim raporda net olmali.",
    "Rapor dili ve duzen problemi": "Tekrar eden, genel ve kanitsiz cumleler kisaltilmali.",
    "Kanitsiz iddia veya abartili ifade": "Kesin basari iddialari test sonucu yoksa temkinli hedef ifadesine cevrilmeli.",
    "Yarisma gorevleriyle zayif iliski": "Her teknik cozum yarisma gorevi veya asamasiyla baglanmali.",
  };
  return map[category];
}

function checklistForCategory(category: ScoreLossCategory) {
  return `${category}: ${mistakeForCategory(category)}`;
}

function sameCompetitionName(a: string, b: string) {
  return slugify(a) === slugify(b) || slugify(a).includes(slugify(b)) || slugify(b).includes(slugify(a));
}

function isGeneralFeedback(record: FeedbackRecord) {
  return record.learned.scoreLossCategories.some((category) =>
    ["Test/dogrulama eksikligi", "Risk analizi eksikligi", "Kanitsiz iddia veya abartili ifade", "Rapor dili ve duzen problemi"].includes(category),
  );
}

function findRepeatedFeedbackMistakes(report: ReportDraft, records: FeedbackRecord[]) {
  const text = report.sections.map((section) => `${section.title} ${section.body}`).join(" ");
  const repeated: string[] = [];
  for (const category of Array.from(new Set(records.flatMap((record) => record.learned.scoreLossCategories)))) {
    if (categoryStillRisky(category, text, report)) {
      repeated.push(`${category}: ${mistakeForCategory(category)}`);
    }
  }
  return repeated.slice(0, 12);
}

function categoryStillRisky(category: ScoreLossCategory, text: string, report: ReportDraft) {
  if (category === "Test/dogrulama eksikligi") return !/test|dogrulama|basari kriteri|olcum/i.test(text);
  if (category === "Risk analizi eksikligi") return !/risk|olasilik|etki|onlem/i.test(text);
  if (category === "Gorsel/sema/teknik cizim eksikligi") return report.diagrams.length < 2;
  if (category === "Kanitsiz iddia veya abartili ifade") return /yuksek dogruluk|hizli|kararli|guvenli|gercek zamanli/i.test(text) && report.sources.length < 4;
  if (category === "Yetersiz sistem mimarisi") return !/mimari|blok|veri akisi|alt sistem/i.test(text);
  if (category === "Guvenlik eksikligi") return !/guvenlik|acil durdurma|emniyet/i.test(text);
  if (category === "Yarisma gorevleriyle zayif iliski") return !/asama|gorev|senaryo|hedef/i.test(text);
  return scoreText(text, tokenize(category)) === 0;
}

function findFeedbackSpecGaps(report: ReportDraft, records: FeedbackRecord[]) {
  const recordNotes = records.flatMap((record) => splitList(`${record.specNotes},${record.missingSections}`));
  const gaps = recordNotes.filter((note) => scoreText(report.sections.map((section) => section.body).join(" "), tokenize(note)) === 0);
  const celikkubbe = isCelikkubbe(report.competition) ? celikkubbeChecks(report) : [];
  return unique([...gaps, ...celikkubbe]).slice(0, 14);
}

function findFeedbackWeakSections(report: ReportDraft, categories: ScoreLossCategory[]) {
  const weak = new Set<string>();
  for (const category of categories) {
    const section = bestSectionByTitle(report, category);
    if (!section || section.sourceIds.length === 0 || tokenize(section.body).length < 55) {
      weak.add(section?.title || category);
    }
  }
  return Array.from(weak).slice(0, 10);
}

function feedbackRiskLevel(repeated: number, gaps: number, weak: number): FeedbackBasedReportReview["riskLevel"] {
  const score = repeated * 3 + gaps * 2 + weak;
  if (score >= 18) return "Kritik";
  if (score >= 10) return "Yuksek";
  if (score >= 4) return "Orta";
  return "Dusuk";
}

function bestKnownMaxScore(records: FeedbackRecord[]) {
  return records.find((record) => record.maxScore)?.maxScore || null;
}

function buildCompetitionProfileFromFeedback(report: ReportDraft, records: FeedbackRecord[], maxScore: number | null): CompetitionProfile {
  const learnedMistakes = unique(records.flatMap((record) => record.learned.mistakesToAvoid)).slice(0, 8);
  return {
    competition: report.competition,
    year: report.year,
    reportType: report.reportType,
    maxScore,
    pageLimit: records.find((record) => /sayfa/i.test(record.specNotes))?.specNotes || "Sayfa siniri sartname/sablon dosyasindan dogrulanmali.",
    mainEvaluationTopics: ["Sartname uyumu", "Teknik icerik", "Yarisma gorevi uyumu", "Test/dogrulama", "Rapor dili"],
    criticalTechnicalExpectations: isCelikkubbe(report.competition)
      ? ["Hedef tespit", "Dost/dusman ayrimi", "Manuel/otonom mod", "Pan-tilt takip", "ESP32 kontrol", "WebSocket/UART", "5/10/15 m senaryolari"]
      : ["Sistem mimarisi", "Alt sistem dengesi", "Test plani", "Risk analizi", "Teknik kanit"],
    specialSpecItems: unique(records.flatMap((record) => splitList(record.specNotes))).slice(0, 8),
    learnedCompetitionMistakes: learnedMistakes,
  };
}

function buildEvaluationRange(riskLevel: FeedbackBasedReportReview["riskLevel"], maxScore: number | null, categories: ScoreLossCategory[]) {
  const max = maxScore || 100;
  const riskMap = {
    Dusuk: [0.78, 0.92],
    Orta: [0.62, 0.82],
    Yuksek: [0.45, 0.68],
    Kritik: [0.25, 0.52],
  } as const;
  const [low, high] = riskMap[riskLevel];
  return {
    warning: "Juri puanlama anahtari elimizde yoksa kesin puan verilemez; bu sadece gecmis veriye dayali risk bandidir.",
    strongPreparedRange: `${Math.round(max * Math.max(high, 0.82))}-${max} / ${max}`,
    currentRiskRange: `${Math.round(max * low)}-${Math.round(max * high)} / ${max}`,
    highestScoreLossRisks: unique(categories).slice(0, 5),
  };
}

function buildFeedbackGeneralImpression(report: ReportDraft, records: FeedbackRecord[], risk: FeedbackBasedReportReview["riskLevel"]) {
  if (!records.length) {
    return "Bu takim/yarisma icin gecmis geri bildirim kaydi yok; degerlendirme genel teknik rapor risklerine gore yapildi.";
  }
  return `${records.length} gecmis geri bildirim kaydi dikkate alindi. Mevcut risk seviyesi: ${risk}. Kesin puan tahmini yapilamaz; tekrar eden hatalar oncelikli duzeltilmeli.`;
}

function buildFeedbackJuryQuestions(report: ReportDraft, categories: ScoreLossCategory[]) {
  const questions = categories.map((category) => `${category} basliginda onceki puan kaybi tekrar etmemesi icin bu raporda hangi kaniti eklediniz?`);
  if (isCelikkubbe(report.competition)) {
    questions.push("YOLOv8 hedef tespiti, dost/dusman ayrimi ve pan-tilt takip sistemi 5/10/15 m senaryolarinda nasil dogrulandi?");
  }
  return unique(questions).slice(0, 10);
}

function buildTextsToFix(report: ReportDraft, categories: ScoreLossCategory[]) {
  return report.sections
    .filter((section) => categories.some((category) => categoryStillRisky(category, section.body, report)))
    .map((section) => `${section.title}: Bu bolum gecmis puan kaybi kategorileriyle iliskili; metin kanit ve gorev baglantisiyla guclendirilmeli.`)
    .slice(0, 10);
}

function buildFeedbackVisualNeeds(report: ReportDraft, categories: ScoreLossCategory[]) {
  const needs = [];
  if (categories.includes("Yetersiz sistem mimarisi")) needs.push("Sistem blok diyagrami");
  if (categories.includes("Zayif mekanik anlatim")) needs.push("Pan-tilt/mekanik teknik cizim");
  if (categories.includes("Zayif elektronik anlatim")) needs.push("Elektronik baglanti ve guc dagitim semasi");
  if (categories.includes("Zayif yazilim/algoritma anlatimi")) needs.push("Yazilim modulleri ve haberlesme akisi");
  if (categories.includes("Test/dogrulama eksikligi")) needs.push("Test duzeni ve sonuc tablosu");
  if (isCelikkubbe(report.competition)) needs.push("Aşama 1/2/3 gorev akisi ve hedef senaryo diyagrami");
  return unique(needs).slice(0, 8);
}

function buildFeedbackPriorityFixes(repeated: string[], gaps: string[], weak: string[]) {
  const fixes = [
    ...repeated.map((item) => `Tekrarlayan hata: ${item}`),
    ...gaps.map((item) => `Sartname/gorev boslugu: ${item}`),
    ...weak.map((item) => `Zayif bolum: ${item} bolumune kaynak, test veya gorsel ekle.`),
  ];
  return unique(fixes).slice(0, 12);
}

function buildFeedbackChecklist(records: FeedbackRecord[], categories: ScoreLossCategory[], report: ReportDraft) {
  const learned = records.flatMap((record) => record.learned.futureChecklistItems);
  const base = [
    "Juri puanlama anahtari yoksa kesin puan iddiasi kullanma.",
    "Sartname ve sablon dosyasi son raporla birebir eslestirildi mi?",
    "Kanitsiz teknik iddialar temkinli ve hedef odakli yazildi mi?",
    "Test plani olculebilir basari kriteri iceriyor mu?",
  ];
  const celikkubbe = isCelikkubbe(report.competition)
    ? [
        "YOLOv8 ve hedef siniflandirma mantigi acik mi?",
        "Dost/dusman ayrimi teknik olarak savunulabilir mi?",
        "ESP32, WebSocket ve UART rolleri karismadan anlatildi mi?",
        "5 m, 10 m, 15 m senaryolari raporda var mi?",
      ]
    : [];
  return unique([...learned, ...categories.map(checklistForCategory), ...base, ...celikkubbe]).slice(0, 20);
}

function celikkubbeChecks(report: ReportDraft) {
  const text = report.sections.map((section) => `${section.title} ${section.body}`).join(" ");
  const checks = [
    ["Kamera tabanli hedef tespit sistemi acik degil.", ["kamera", "hedef tespit"]],
    ["YOLOv8 kullanimi ve hedef siniflandirma mantigi eksik.", ["yolov8", "siniflandirma"]],
    ["Dost/dusman ayrimi teknik olarak zayif.", ["dost", "dusman"]],
    ["Python ana kontrol yazilimi moduler anlatilmamis.", ["python", "modul"]],
    ["ESP32 gomulu kontrol biriminin gorevi net degil.", ["esp32"]],
    ["WebSocket ve UART haberlesme ayrimi anlasilir degil.", ["websocket", "uart"]],
    ["Manuel ve otonom mod gecisleri acik degil.", ["manuel", "otonom"]],
    ["Pan-tilt mekanik hareket sistemi yeterli anlatilmamis.", ["pan", "tilt"]],
    ["Hedef takip algoritmasi ve hata hesabi eksik.", ["takip", "hata"]],
    ["Guvenlik, acil durdurma veya yasak bolge mantigi eksik.", ["guvenlik", "acil", "yasak"]],
    ["5 m, 10 m, 15 m hedef senaryolari belirtilmemis.", ["5 m", "10 m", "15 m"]],
    ["Aşama 1, Aşama 2 ve Aşama 3 gorevleriyle dogrudan iliski zayif.", ["asama 1", "asama 2", "asama 3"]],
  ];
  return checks.filter(([, terms]) => !(terms as string[]).every((term) => contains(text, term))).map(([message]) => message as string);
}

function isCelikkubbe(competition: string) {
  const slug = slugify(competition);
  return slug.includes("celikkubbe") || slug.includes("hava-savunma");
}

function splitList(value: string) {
  return value
    .split(/\r?\n|,|;|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function uniqueBy<T>(values: T[], getKey: (value: T) => string) {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const value of values) {
    const key = getKey(value);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }
  return result;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
