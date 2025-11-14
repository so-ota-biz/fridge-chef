/**
 * クエリ文字列などからの数値（整数）を安全に解析するユーティリティ。
 * - 未指定、null、空文字、非数値は undefined を返す
 * - 数値は有限値のみ受け付け、小数は切り捨て（trunc）
 */
export function parseOptionalInt(value: string | number | null | undefined): number | undefined {
  if (value === undefined || value === null) return undefined

  if (typeof value === 'string') {
    const s = value.trim()
    if (s === '') return undefined
    const n = Number.parseInt(s, 10)
    return Number.isNaN(n) ? undefined : n
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return undefined
    return Math.trunc(value)
  }

  return undefined
}
