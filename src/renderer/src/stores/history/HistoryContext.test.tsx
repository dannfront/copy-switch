import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HistoryProvider } from './HistoryContext'
import { useHistory } from '../../hooks/useHistory'

function TestComponent() {
  const { items, loading, refresh, deleteItem, clearAll, toggleFavorite } = useHistory()
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="count">{items.length}</div>
      {items.map((item) => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.sourceText}
        </div>
      ))}
      <button onClick={() => refresh()}>Refresh</button>
      <button onClick={() => deleteItem('1')}>Delete</button>
      <button onClick={() => clearAll()}>Clear</button>
      <button onClick={() => toggleFavorite('1')}>Toggle Favorite</button>
    </div>
  )
}

describe('HistoryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads history on mount', async () => {
    vi.mocked(window.api.history.get).mockResolvedValue([
      {
        id: '1',
        sourceText: 'hello',
        translatedText: 'hola',
        sourceLang: 'EN',
        targetLang: 'ES',
        timestamp: Date.now(),
        isFavorite: false
      }
    ])

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    )

    expect(screen.getByTestId('loading')).toHaveTextContent('loading')
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))
    expect(screen.getByTestId('loading')).toHaveTextContent('ready')
    expect(screen.getByTestId('item-1')).toHaveTextContent('hello')
  })

  it('refresh() reloads history', async () => {
    vi.mocked(window.api.history.get).mockResolvedValue([
      {
        id: '1',
        sourceText: 'hello',
        translatedText: 'hola',
        sourceLang: 'EN',
        targetLang: 'ES',
        timestamp: Date.now(),
        isFavorite: false
      }
    ])

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    )

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))

    vi.mocked(window.api.history.get).mockResolvedValue([
      {
        id: '1',
        sourceText: 'hello',
        translatedText: 'hola',
        sourceLang: 'EN',
        targetLang: 'ES',
        timestamp: Date.now(),
        isFavorite: false
      },
      {
        id: '2',
        sourceText: 'world',
        translatedText: 'mundo',
        sourceLang: 'EN',
        targetLang: 'ES',
        timestamp: Date.now(),
        isFavorite: false
      }
    ])

    await userEvent.click(screen.getByText('Refresh'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'))
  })

  it('deleteItem(id) calls API and refreshes', async () => {
    vi.mocked(window.api.history.get).mockResolvedValue([
      {
        id: '1',
        sourceText: 'hello',
        translatedText: 'hola',
        sourceLang: 'EN',
        targetLang: 'ES',
        timestamp: Date.now(),
        isFavorite: false
      }
    ])
    vi.mocked(window.api.history.delete).mockResolvedValue(undefined)

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    )

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))

    await userEvent.click(screen.getByText('Delete'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'))
    expect(window.api.history.delete).toHaveBeenCalledWith('1')
  })

  it('clearAll() calls API and refreshes', async () => {
    vi.mocked(window.api.history.get).mockResolvedValue([
      {
        id: '1',
        sourceText: 'hello',
        translatedText: 'hola',
        sourceLang: 'EN',
        targetLang: 'ES',
        timestamp: Date.now(),
        isFavorite: false
      }
    ])
    vi.mocked(window.api.history.clear).mockResolvedValue(undefined)

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    )

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))

    await userEvent.click(screen.getByText('Clear'))
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('0'))
    expect(window.api.history.clear).toHaveBeenCalled()
  })

  it('toggleFavorite(id) persists favorite state', async () => {
    const item = {
      id: '1',
      sourceText: 'hello',
      translatedText: 'hola',
      sourceLang: 'EN',
      targetLang: 'ES',
      timestamp: Date.now(),
      isFavorite: false
    }
    vi.mocked(window.api.history.get).mockResolvedValue([item])
    vi.mocked(window.api.history.save).mockResolvedValue(undefined)

    render(
      <HistoryProvider>
        <TestComponent />
      </HistoryProvider>
    )

    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('1'))

    await userEvent.click(screen.getByText('Toggle Favorite'))
    expect(window.api.history.save).toHaveBeenCalledWith({ ...item, isFavorite: true })
  })
})
