import type { TFunction } from 'i18next'

// A text kept as its key and values rather than as translated text, so a
// message held in state follows a language switch: it is translated each time
// it is drawn. A value can itself be a message (such as the name of a
// product), so the texts inside it change language too.
export interface Message {
  key: string
  values?: Record<string, string | number | Message>
}

export const message = (key: string, values?: Message['values']): Message => ({
  key,
  values,
})

export const translateMessage = (
  t: TFunction,
  { key, values = {} }: Message,
): string =>
  t(
    key,
    Object.fromEntries(
      Object.entries(values).map(([name, value]) => [
        name,
        typeof value === 'object' ? translateMessage(t, value) : value,
      ]),
    ),
  )
