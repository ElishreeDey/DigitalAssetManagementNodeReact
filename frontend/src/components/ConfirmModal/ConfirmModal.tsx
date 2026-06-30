/*
 ****************************************************************************************************************************
 * Filename    : ConfirmModal
 * Description : Reusable confirmation dialog — shows a message with a destructive confirm and a cancel button.
 * Author      : Elishree Dey Chand
 * Created     : 2026-06-30
 ****************************************************************************************************************************
 */

import './ConfirmModal.css'

type Props = {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="button" className="confirm-btn-red" onClick={onConfirm}>
            Yes
          </button>
        </div>
      </div>
    </div>
  )
}
