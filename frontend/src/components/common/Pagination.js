import React from 'react';
import './Pagination.css';

function Pagination({ currentPage, onPageChange, hasMore = true, showInfo = true }) {
  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        disabled={currentPage <= 0}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &larr; Anterior
      </button>
      {showInfo && (
        <span className="pagination__info">Página {currentPage + 1}</span>
      )}
      <button
        className="pagination__btn"
        disabled={!hasMore}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente &rarr;
      </button>
    </div>
  );
}

export default Pagination;
