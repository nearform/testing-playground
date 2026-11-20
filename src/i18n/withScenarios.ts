import { parseInformation, type Information } from '../utils/information'

// Each scenario keeps its texts beside its code, so a scenario is one folder:
// scenarios/<scenario>/locales/<language>.json for the texts on its page, and
// scenarios/<scenario>/information/<language>.md for its information, in
// Markdown, as long notes are far easier to write, review and translate there
// than as strings of HTML in JSON. Each file in ./languages gathers one
// language's files, so a language's texts download only when it is chosen.

type Translation = { scenarios: Record<string, unknown> }

export interface ScenarioFiles {
  texts: Record<string, Record<string, unknown>>
  information: Record<string, string>
}

// The scenario and language a file in a scenario's folder is for
const fileOf = (path: string): { scenario?: string; language?: string } => {
  const [, scenario, language] =
    /\/scenarios\/([^/]+)\/(?:locales|information)\/([^/]+)\.(?:json|md)$/.exec(
      path,
    ) ?? []
  return { scenario, language }
}

const readInformation = (path: string, markdown: string): Information => {
  try {
    return parseInformation(markdown)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Could not read ${path}: ${reason}`, { cause: error })
  }
}

// Adds every scenario's texts and information in one language (named as its
// files are, such as pt-br) to the shared texts, as scenarios.<scenario>, so
// they are filled in with values and change with the language like every
// other text. Information is parsed here, once, as the language loads, so a
// file that breaks the layout fails then, naming the file, rather than when
// its page is drawn. The tests parse every file in every language.
export const withScenarios = <T extends Translation>(
  translation: T,
  language: string,
  { texts, information }: ScenarioFiles,
): T => {
  const scenarios = { ...translation.scenarios }
  for (const [path, scenarioText] of Object.entries(texts)) {
    const file = fileOf(path)
    if (file.scenario === undefined || file.language !== language) continue
    scenarios[file.scenario] = { ...scenarioText }
  }
  for (const [path, markdown] of Object.entries(information)) {
    const file = fileOf(path)
    if (file.scenario === undefined || file.language !== language) continue
    scenarios[file.scenario] = {
      ...(scenarios[file.scenario] as object),
      information: readInformation(path, markdown),
    }
  }
  return { ...translation, scenarios }
}
