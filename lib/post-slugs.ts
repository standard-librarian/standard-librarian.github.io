export type SlugEditorState = {
  slug: string;
  slugTouched: boolean;
};

export function normalizePostSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function syncSlugWithTitle(
  state: SlugEditorState,
  nextTitle: string
): SlugEditorState {
  if (state.slugTouched) {
    return state;
  }

  return {
    ...state,
    slug: normalizePostSlug(nextTitle),
  };
}

export function setCustomSlug(value: string): SlugEditorState {
  return {
    slug: normalizePostSlug(value),
    slugTouched: true,
  };
}
