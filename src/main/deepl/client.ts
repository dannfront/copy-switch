interface TranslatePayload {
  text: string
  sourceLang?: string
  targetLang: string
}

interface TranslateResponse {
  translatedText: string
  detectedSourceLang?: string
}

function getEndpoint(apiKey: string): string {
  return apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'
}

export async function translateText(
  apiKey: string,
  payload: TranslatePayload
): Promise<TranslateResponse> {
  if (!payload.text.trim()) {
    return { translatedText: '' }
  }

  const endpoint = getEndpoint(apiKey)
  const body = new URLSearchParams()
  body.append('text', payload.text)
  body.append('target_lang', payload.targetLang)
  if (payload.sourceLang) {
    body.append('source_lang', payload.sourceLang)
  }

  const doFetch = async (): Promise<TranslateResponse> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    })

    if (res.status === 403) {
      throw new Error('Invalid API key')
    }
    if (res.status === 429) {
      throw new Error('Rate limit exceeded')
    }
    if (res.status === 456) {
      throw new Error('Quota exceeded')
    }
    if (!res.ok) {
      throw new Error(`DeepL error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()

    const first = data.translations?.[0]
    if (!first) {
      throw new Error('No translation returned')
    }

    return {
      translatedText: first.text,
      detectedSourceLang: first.detected_source_language
    }
  }

  try {
    return await doFetch()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('fetch') || msg.includes('network')) {
      await new Promise((r) => setTimeout(r, 500))
      return doFetch()
    }
    throw err
  }
}
