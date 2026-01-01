import type { Annotation } from "./types";

let annotations: Annotation[] = [];

export function getAnnotations(): Annotation[] {
  return annotations;
}

export function getAnnotationById(id: string): Annotation | undefined {
  return annotations.find((a) => a.id === id);
}

export function addAnnotation(annotation: Annotation): void {
  annotations.push(annotation);
}

export function updateAnnotation(
  id: string,
  updates: Partial<Annotation>
): void {
  const annotation = annotations.find((a) => a.id === id);
  if (annotation) {
    Object.assign(annotation, updates);
  }
}

export function deleteAnnotation(id: string): Annotation | undefined {
  const index = annotations.findIndex((a) => a.id === id);
  if (index !== -1) {
    return annotations.splice(index, 1)[0];
  }
  return undefined;
}

export function clearAnnotations(): Annotation[] {
  const removed = annotations;
  annotations = [];
  return removed;
}

export function getAnnotationCount(): number {
  return annotations.length;
}
