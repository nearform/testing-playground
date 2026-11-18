import type { TFunction } from 'i18next'
import { marked, type Token, type Tokens } from 'marked'

// A scenario's information is Markdown, kept in
// src/i18n/information/<language>/<scenario>.md. Short notes are one
// paragraph; longer ones are a summary followed by `## ` headings over `- `
// lists of points, which are far easier to scan than one long paragraph.
// Inline Markdown (`code`, **bold**, *emphasis*) and inline HTML such as
// <kbd> can be used anywhere.
export type Information = string

export interface InformationSection {
  // Inline HTML, as Markdown renders it
  title: string
  points: string[]
}

export interface ParsedInformation {
  // Inline HTML of each paragraph before the first heading
  summary: string[]
  sections: InformationSection[]
}

const inline = (markdown: string): string =>
  marked.parseInline(markdown, { async: false })

// A point is the text of one list item: anything more, such as a nested list,
// would not fit the layout
const pointOf = (item: Tokens.ListItem): string => {
  const blocks = item.tokens.filter(({ type }) => type !== 'space')
  const [block] = blocks
  if (
    blocks.length !== 1 ||
    (block.type !== 'text' && block.type !== 'paragraph')
  ) {
    throw new Error(
      `Information points must be plain text, but one holds ${blocks
        .map(({ type }) => type)
        .join(', ')}`,
    )
  }
  return inline((block as Tokens.Text | Tokens.Paragraph).text)
}

// Splits information into its summary and sections. Only the layout above is
// allowed, so a file written another way fails its test rather than showing
// differently from the rest.
export const parseInformation = (
  information: Information,
): ParsedInformation => {
  const summary: string[] = []
  const sections: InformationSection[] = []

  for (const token of marked.lexer(information) as Token[]) {
    const current = sections.at(-1)
    if (token.type === 'space') continue
    if (token.type === 'heading' && token.depth === 2) {
      sections.push({ title: inline(token.text), points: [] })
    } else if (token.type === 'paragraph' && current === undefined) {
      summary.push(inline(token.text))
    } else if (
      token.type === 'list' &&
      !token.ordered &&
      current !== undefined &&
      current.points.length === 0
    ) {
      current.points.push(...(token as Tokens.List).items.map(pointOf))
    } else {
      throw new Error(
        `Information can only hold paragraphs and then "## " headings, each over one "- " list, but found ${token.type}: ${token.raw.trim()}`,
      )
    }
  }

  const empty = sections.find(({ points }) => points.length === 0)
  if (empty !== undefined) {
    throw new Error(`The information heading "${empty.title}" has no points`)
  }
  return { summary, sections }
}

// Reads a scenario's information from the translations, with any {{values}}
// filled in
export const translateInformation = (
  t: TFunction,
  path: string,
  values: Record<string, unknown> = {},
): Information => t(path, values)
