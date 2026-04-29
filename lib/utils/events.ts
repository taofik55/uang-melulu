export type DataKey =
  | "accounts"
  | "transactions"
  | "categories"
  | "budgets"
  | "savings"
  | "loans"
  | "investments"
  | "family"
  | "profile"

const EVENT_NAME = "uang-melulu:data-changed"

export function emitDataChanged(key: DataKey) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }))
}

export function onDataChanged(handler: (key: DataKey) => void) {
  if (typeof window === "undefined") return () => {}

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<{ key?: DataKey }>).detail
    if (!detail?.key) return
    handler(detail.key)
  }

  window.addEventListener(EVENT_NAME, listener)
  return () => window.removeEventListener(EVENT_NAME, listener)
}

