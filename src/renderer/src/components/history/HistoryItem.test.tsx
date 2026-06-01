import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoryProvider } from '../../stores/history/HistoryContext'
import HistoryItemComponent from './HistoryItem'

const mockItem = {
  id: '1',
  sourceText: 'hello world',
  translatedText: 'hola mundo',
  sourceLang: 'EN',
  targetLang: 'ES',
  timestamp: new Date('2024-01-15T10:30:00').getTime(),
  isFavorite: false
}

describe('HistoryItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(window.api.history.get).mockResolvedValue([{ ...mockItem, isFavorite: false }])
  })

  it('renders history item data', async () => {
    render(
      <HistoryProvider>
        <HistoryItemComponent item={mockItem} />
      </HistoryProvider>
    )

    expect(screen.getByText('hello world')).toBeInTheDocument()
    expect(screen.getByText('hola mundo')).toBeInTheDocument()
    expect(screen.getByText('EN → ES')).toBeInTheDocument()
  })

  it('favorite toggle callback is triggered', async () => {
    vi.mocked(window.api.history.save).mockResolvedValue(undefined)

    render(
      <HistoryProvider>
        <HistoryItemComponent item={mockItem} />
      </HistoryProvider>
    )

    const favoriteBtn = screen.getByTitle('Favorite')
    await userEvent.click(favoriteBtn)
    expect(window.api.history.save).toHaveBeenCalledWith(expect.objectContaining({ id: '1', isFavorite: true }))
  })

  it('copy callback is triggered', async () => {
    render(
      <HistoryProvider>
        <HistoryItemComponent item={mockItem} />
      </HistoryProvider>
    )

    const copyBtn = screen.getByTitle('Copy translation')
    await userEvent.click(copyBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hola mundo')
  })

  it('delete callback is triggered', async () => {
    vi.mocked(window.api.history.delete).mockResolvedValue(undefined)

    render(
      <HistoryProvider>
        <HistoryItemComponent item={mockItem} />
      </HistoryProvider>
    )

    const deleteBtn = screen.getByTitle('Delete')
    await userEvent.click(deleteBtn)
    expect(window.api.history.delete).toHaveBeenCalledWith('1')
  })
})
