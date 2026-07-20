export type ParentId = "lena" | "jonas";
export type AppView = "today" | "plan" | "create" | "ask" | "family";
export type BuiltInSidekickId = "skippy" | "nori" | "lumi" | "atlas" | "pippa" | "quinn" | "moxie" | "cleo" | "pip" | "romy";
export type SidekickId = BuiltInSidekickId | `custom-${string}`;
export type SidekickView = "home" | SidekickId | "more" | "family";
export type ResultMode = "live" | "sample";
export type SidekickAccent = "mint" | "yellow" | "blue" | "coral" | "lavender";
export type FamilyMemoryScope = "children" | "preferences" | "allergies" | "location" | "plans";

export interface ChildProfile {
  id: string;
  name: string;
  age: number;
  interests: string[];
  allergies: string[];
  dislikes: string[];
  gender: "female" | "male" | "nonbinary" | "unspecified";
}

export interface ParentProfile {
  id: ParentId;
  name: string;
  responseStyle: "supportive" | "direct";
  ownedDomains: string[];
  accent: "coral" | "blue";
  email: string;
  phone: string;
}

export interface CareContact {
  id: string;
  kind: "pediatrician" | "dentist" | "specialist" | "pharmacy";
  name: string;
  specialty: string;
  phone: string;
  address: string;
  openingHours: string;
}

export interface FamilyAppointment {
  id: string;
  childId: string;
  title: string;
  date: string;
  time: string;
  contactId: string;
}

export interface FamilyInstitution {
  id: string;
  kind: "city-hall" | "school" | "daycare" | "other";
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  website: string;
}

export interface FamilyDocument {
  id: string;
  name: string;
  category: "school" | "daycare" | "health" | "benefits" | "identity" | "other";
  childId?: string;
  sizeLabel: string;
  uploadedAt: string;
}

export interface FamilyProfile {
  id: string;
  name: string;
  locale: string;
  city: string;
  country: string;
  radiusKm: number;
  budget: "low" | "medium" | "high";
  children: ChildProfile[];
  parents: ParentProfile[];
  careContacts: CareContact[];
  appointments: FamilyAppointment[];
  institutions: FamilyInstitution[];
  documents: FamilyDocument[];
}

export interface TraceInfo {
  model: string;
  tools: string[];
  durationMs: number;
  promptVersion: string;
  generatedAt: string;
}

export interface EventSuggestion {
  id: string;
  title: string;
  dateLabel: string;
  time: string;
  venue: string;
  city: string;
  priceLabel: string;
  ageLabel: string;
  whyItFits: string;
  sourceName: string;
  sourceUrl: string;
  sponsored?: boolean;
}

export interface EventResult {
  mode: ResultMode;
  notice?: string;
  locationLabel: string;
  summary: string;
  events: EventSuggestion[];
  trace: TraceInfo;
}

export interface MealResult {
  mode: ResultMode;
  notice?: string;
  title: string;
  summary: string;
  totalMinutes: number;
  ingredients: string[];
  pantryUsed: string[];
  shoppingGaps: string[];
  steps: string[];
  kidAdaptation: string;
  allergyCheck: string;
  trace: TraceInfo;
}

export interface BirthdayTask {
  id: string;
  label: string;
  timing: string;
  owner: ParentId | "shared";
}

export interface BirthdayResult {
  mode: ResultMode;
  notice?: string;
  title: string;
  concept: string;
  guestExperience: string[];
  budgetBreakdown: { label: string; amount: string }[];
  tasks: BirthdayTask[];
  imageBrief: string;
  invitationMessage: string;
  trace: TraceInfo;
}

export interface SidekickConfig {
  id: SidekickId;
  name: string;
  corner: string;
  role: string;
  promise: string;
  image: string;
  accent: SidekickAccent;
  quickPrompts: string[];
  instructions?: string;
  memoryScopes?: FamilyMemoryScope[];
  guardrails?: string[];
}

export interface LearningTask {
  question: string;
  hint: string;
  answer: string;
}

export interface LearningResult {
  mode: ResultMode;
  notice?: string;
  detectedTask: string;
  levelAssessment: string;
  explanationSteps: string[];
  practiceTasks: LearningTask[];
  parentNote: string;
  memoryUsed: string[];
  trace: TraceInfo;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  childFit: string;
}

export interface QuizResult {
  mode: ResultMode;
  notice?: string;
  title: string;
  intro: string;
  questions: QuizQuestion[];
  memoryUsed: string[];
  trace: TraceInfo;
}

export interface VacationDay {
  label: string;
  title: string;
  activities: string[];
}

export type TravelScope = "domestic" | "nearby" | "worldwide";

export interface DestinationIdea {
  destination: string;
  locationLabel: string;
  whyItFits: string;
  travelEffort: string;
  budgetFit: string;
  familyHighlight: string;
  caveat: string;
}

export interface DestinationIdeasResult {
  mode: ResultMode;
  notice?: string;
  intro: string;
  ideas: DestinationIdea[];
  trace: TraceInfo;
}

export interface VacationResult {
  mode: ResultMode;
  notice?: string;
  destination: string;
  title: string;
  summary: string;
  recommendationReason: string;
  familyFit: string;
  days: VacationDay[];
  travelPlan: string[];
  packingHighlights: string[];
  budgetNotes: string[];
  trace: TraceInfo;
}

export interface LocalBriefItem {
  kind: "pharmacy" | "service" | "news";
  title: string;
  summary: string;
  address: string;
  phone: string;
  openingHours: string;
  sourceName: string;
  sourceUrl: string;
}

export interface LocalBriefResult {
  mode: ResultMode;
  notice?: string;
  title: string;
  summary: string;
  items: LocalBriefItem[];
  trace: TraceInfo;
}

export interface BuddyBlueprint {
  mode: ResultMode;
  notice?: string;
  name: string;
  role: string;
  promise: string;
  instructions: string;
  quickPrompts: string[];
  memoryScopes: FamilyMemoryScope[];
  guardrails: string[];
  trace: TraceInfo;
}

export interface CustomBuddy extends SidekickConfig {
  id: `custom-${string}`;
  instructions: string;
  memoryScopes: FamilyMemoryScope[];
  guardrails: string[];
  createdAt: string;
}

export interface BuddyMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: ResultMode;
  memoryUsed?: string[];
  createdAt: string;
}

export interface BuddyChatResult {
  mode: ResultMode;
  notice?: string;
  reply: string;
  memoryUsed: string[];
  suggestedPrompts: string[];
  trace: TraceInfo;
}

export interface BuddyWorkbenchContext {
  title: string;
  summary: string;
  updatedAt: string;
}

export interface StoryResult {
  mode: ResultMode;
  notice?: string;
  title: string;
  synopsis: string;
  story: string;
  readTimeMinutes: number;
  memoryUsed: string[];
  trace: TraceInfo;
}

export interface SharedArtifact {
  id: string;
  type: "event" | "meal" | "birthday" | "story" | "learning" | "quiz" | "buddy" | "vacation";
  title: string;
  detail: string;
  owner: ParentId | "shared";
  createdBy: ParentId;
  createdAt: string;
}

export interface DemoIntegrationState {
  calendar: "preview";
  email: "preview";
  social: "preview";
  payments: "preview";
}

export interface HubState {
  family: FamilyProfile;
  activeParent: ParentId;
  homeSidekickIds: Record<ParentId, SidekickId[]>;
  sharedArtifacts: SharedArtifact[];
  savedEventIds: string[];
  completedTaskIds: string[];
  buddyMessages: Partial<Record<SidekickId, BuddyMessage[]>>;
  buddyContexts: Partial<Record<SidekickId, BuddyWorkbenchContext>>;
  customBuddies: CustomBuddy[];
  latestStory?: StoryResult;
  invitationDataUrl?: string;
  invitationGenerated: boolean;
}
