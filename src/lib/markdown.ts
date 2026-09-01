/**
 * Markdown utilities for Klip task notes.
 * Provides helper functions for stripping formatting, checking emptiness, and sanitization.
 */

/**
 * Strips Markdown formatting syntax to provide a clean plain-text string,
 * ideal for native browser tooltips (title attribute) and accessibility labels (aria-label).
 */
export function stripMarkdown(markdown?: string | null): string {
  if (!markdown) return "";

  let text = markdown;

  // Remove zero-width characters and invisible control formatting
  text = text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, "");
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, "$1");
  // Remove task list checkboxes: - [ ] or - [x]
  text = text.replace(/^\s*-\s*\[[ xX]\]\s*/gm, "");
  // Remove bullet and numbered lists: - Item, * Item, 1. Item
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");
  // Remove headings: # Heading
  text = text.replace(/^\s*#{1,6}\s+/gm, "");
  // Remove blockquotes: > Quote
  text = text.replace(/^\s*>\s*/gm, "");
  // Remove images: ![alt](url)
  text = text.replace(/!\[(.*?)\]\(.*?\)/g, "$1");
  // Remove links: [text](url) -> text
  text = text.replace(/\[(.*?)\]\(.*?\)/g, "$1");
  // Remove bold, italic, strikethrough: **bold**, *italic*, ~~strikethrough~~, __bold__, _italic_
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  text = text.replace(/~~(.*?)~~/g, "$1");
  // Replace non-breaking spaces with normal spaces
  text = text.replace(/\u00A0/g, " ");
  // Normalize whitespace and multiple newlines into a single clean line
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Checks whether a markdown string is empty or contains only whitespace/empty structural tags.
 */
export function isMarkdownEmpty(markdown?: string | null): boolean {
  if (!markdown) return true;
  const stripped = stripMarkdown(markdown);
  return stripped.length === 0;
}
