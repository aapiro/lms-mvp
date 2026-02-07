import React from 'react';
import './ConfirmModal.css';

function ConfirmModal({ title = 'Confirm', message = 'Are you sure?', onConfirm, onCancel }) {
  return (
    <div className="confirm-modal-backdrop">
      <div className="confirm-modal">
        <h3 className="confirm-title">{title}</h3>
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn btn-confirm" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
