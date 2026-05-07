export interface QCData {
  status: string;
  notes: string;
  reviewedAt: string;
  checklist?: Record<string, boolean>;
  score?: number;
}

export interface TemplateEntry {
  id: string;
  category: string;
  file: string;
  compositionId: string;
  exportName: string;
  status: string;
  version: number;
  durationFrames: number;
  createdAt?: string;
  qc: QCData | null;
}

export interface CategoryEntry {
  description: string;
  directory: string;
  compositionPrefix: string;
  targetCount: number;
  status: string;
}

export interface Registry {
  version: string;
  updated: string;
  categories: Record<string, CategoryEntry>;
  templates: Record<string, TemplateEntry>;
  backlog: unknown[];
}

export const EMPTY_REGISTRY: Registry = {
  version: "0",
  updated: "",
  categories: {},
  templates: {},
  backlog: [],
};
