/*
 ****************************************************************************************************************************
 * Filename    : ConfirmModal.test
 * Description : Component tests for ConfirmModal — renders message, Yes/Cancel buttons, overlay click,
 *               and stopPropagation behaviour. No mocking required (pure presentational component).
 * Author      : Elishree Dey Chand
 * Created     : 2026-07-01
 ****************************************************************************************************************************
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'

describe('ConfirmModal', () => {
  it('renders the provided message', () => {
    render(
      <ConfirmModal
        message="Delete this item?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText('Delete this item?')).toBeInTheDocument()
  })

  it('renders Cancel and Yes buttons', () => {
    render(
      <ConfirmModal message="Sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument()
  })

  it('calls onConfirm when Yes is clicked', () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmModal message="Sure?" onConfirm={onConfirm} onCancel={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(
      <ConfirmModal message="Sure?" onConfirm={vi.fn()} onCancel={onCancel} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel when the overlay backdrop is clicked', () => {
    const onCancel = vi.fn()
    const { container } = render(
      <ConfirmModal message="Sure?" onConfirm={vi.fn()} onCancel={onCancel} />
    )
    fireEvent.click(container.querySelector('.confirm-overlay')!)
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('does NOT call onCancel when the inner modal box is clicked', () => {
    const onCancel = vi.fn()
    const { container } = render(
      <ConfirmModal message="Sure?" onConfirm={vi.fn()} onCancel={onCancel} />
    )

    fireEvent.click(container.querySelector('.confirm-modal')!)
    expect(onCancel).not.toHaveBeenCalled()
  })
})
