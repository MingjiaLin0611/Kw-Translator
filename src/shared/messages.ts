export type AnnotationMessage = {
  type: "ANNOTATE_CURRENT_PAGE";
  source: string;
  translation: string;
};

export type AnnotationResult = { annotatedCount: number };

export type AnnotationResponse =
  { ok: true; result: AnnotationResult } | { ok: false; error: string };
