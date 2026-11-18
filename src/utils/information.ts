import type { TFunction } from 'i18next'

// A scenario's information is either one short paragraph, or for longer notes
// a summary followed by titled groups of points, which are far easier to scan
// than one long paragraph. Every string may contain inline HTML such as
// <code>, <strong> and <em>.
export interface InformationSection {
  title: string
  points: string[]
}

export interface StructuredInformation {
  summary?: string
  sections: InformationSection[]
}

export type Information = string | StructuredInformation

export const isStructured = (
  information: Information,
): information is StructuredInformation =>
  typeof information === 'object' && Array.isArray(information.sections)

// Reads a scenario's information from the translations. returnObjects lets the
// structured form through (i18next still fills in {{values}} in every string),
// and a plain string comes back unchanged.
export const translateInformation = (
  t: TFunction,
  path: string,
  values: Record<string, unknown> = {},
): Information => t(path, { ...values, returnObjects: true }) as Information
