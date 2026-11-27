import { useCallback, useEffect, useRef, useState } from 'react'

export function useApiQuery<T>(key: string, load: () => Promise<T>, enabled = true) {
  const loadRef = useRef(load)
  const [result, setResult] = useState<{ key: string; data?: T; error: string }>()
  const [revision, setRevision] = useState(0)
  const requestKey = `${key}:${revision}`

  useEffect(() => {
    loadRef.current = load
  }, [load])

  useEffect(() => {
    let active = true
    if (!enabled) return () => { active = false }
    loadRef.current()
      .then((result) => {
        if (active) setResult({ key: requestKey, data: result, error: '' })
      })
      .catch((reason: unknown) => {
        if (active) setResult({
          key: requestKey,
          error: reason instanceof Error ? reason.message : 'The request could not be completed.',
        })
      })

    return () => { active = false }
  }, [enabled, requestKey])

  const refetch = useCallback(() => setRevision((value) => value + 1), [])
  const currentResult = result?.key === requestKey ? result : undefined
  return {
    data: enabled ? currentResult?.data : undefined,
    error: enabled ? currentResult?.error ?? '' : '',
    loading: enabled && !currentResult,
    refetch,
  }
}
