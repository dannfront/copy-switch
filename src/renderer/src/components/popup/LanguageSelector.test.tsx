import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PopupProvider } from '../../stores/popup/PopupContext'
import LanguageSelector from './LanguageSelector'

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(window.api.settings.get).mockResolvedValue({
      apiKey: '',
      shortcut: 'Ctrl+Shift+T',
      defaultSourceLang: 'EN',
      defaultTargetLang: 'ES',
      theme: 'dark'
    })
  })

  it('renders source and target language selects', async () => {
    render(
      <PopupProvider>
        <LanguageSelector />
      </PopupProvider>
    )

    const selects = await screen.findAllByRole('combobox')
    expect(selects).toHaveLength(2)
  })

  it('source language includes auto option', async () => {
    render(
      <PopupProvider>
        <LanguageSelector />
      </PopupProvider>
    )

    const selects = await screen.findAllByRole('combobox')
    const sourceSelect = selects[0]
    expect(within(sourceSelect).getByRole('option', { name: 'Detect' })).toBeInTheDocument()
  })

  it('target language does NOT include auto', async () => {
    render(
      <PopupProvider>
        <LanguageSelector />
      </PopupProvider>
    )

    const selects = await screen.findAllByRole('combobox')
    const targetSelect = selects[1]
    expect(within(targetSelect).queryByRole('option', { name: 'Detect' })).not.toBeInTheDocument()
  })

  it('swap button swaps languages', async () => {
    render(
      <PopupProvider>
        <LanguageSelector />
      </PopupProvider>
    )

    const selects = screen.getAllByRole('combobox')
    const sourceSelect = selects[0] as HTMLSelectElement
    const targetSelect = selects[1] as HTMLSelectElement

    await waitFor(() => expect(sourceSelect.value).toBe('EN'))
    expect(targetSelect.value).toBe('ES')

    await userEvent.click(screen.getByTitle('Swap languages'))

    expect(sourceSelect.value).toBe('ES')
    expect(targetSelect.value).toBe('EN')
  })

  it('has 12 languages available', async () => {
    render(
      <PopupProvider>
        <LanguageSelector />
      </PopupProvider>
    )

    const selects = await screen.findAllByRole('combobox')
    const sourceSelect = selects[0]
    const options = sourceSelect.querySelectorAll('option')
    expect(options).toHaveLength(12)
  })
})
