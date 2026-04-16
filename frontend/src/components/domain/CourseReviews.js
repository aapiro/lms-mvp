import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './CourseReviews.css';

function CourseReviews({ courseId, userHasPurchased }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({ averageRating: null, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [revRes, ratRes] = await Promise.all([
        api.get(`/courses/${courseId}/reviews`),
        api.get(`/courses/${courseId}/rating`),
      ]);
      setReviews(revRes.data || []);
      setRating(ratRes.data || { averageRating: null, reviewCount: 0 });
      if (user) {
        const existing = (revRes.data || []).find(r => r.userId === user.id);
        if (existing) {
          setUserReview(existing);
          setFormRating(existing.rating);
          setFormComment(existing.comment || '');
        }
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formRating < 1) return;
    setSubmitting(true);
    try {
      if (userReview) {
        await api.put(`/courses/${courseId}/reviews`, { rating: formRating, comment: formComment });
      } else {
        await api.post(`/courses/${courseId}/reviews`, { rating: formRating, comment: formComment });
      }
      setShowForm(false);
      loadData();
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const renderStars = (count, interactive = false, onSelect) => {
    return (
      <span className="stars">
        {[1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            className={`star ${i <= count ? 'star--filled' : ''} ${interactive ? 'star--interactive' : ''}`}
            onClick={interactive ? () => onSelect(i) : undefined}
          >
            {i <= count ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>Cargando reseñas...</div>;

  return (
    <div className="course-reviews">
      <div className="reviews-summary">
        <div className="reviews-average">
          {rating.averageRating != null ? (
            <>
              <span className="average-number">{rating.averageRating}</span>
              {renderStars(Math.round(rating.averageRating))}
              <span className="review-count">({rating.reviewCount} reseñas)</span>
            </>
          ) : (
            <span className="review-count">Sin reseñas aún</span>
          )}
        </div>
        {user && userHasPurchased && (
          <button className="btn-write-review" onClick={() => setShowForm(!showForm)}>
            {userReview ? 'Editar mi reseña' : 'Escribir reseña'}
          </button>
        )}
      </div>

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="review-form-stars">
            <label>Tu calificación:</label>
            {renderStars(formRating, true, setFormRating)}
          </div>
          <textarea
            placeholder="Escribe tu reseña..."
            value={formComment}
            onChange={e => setFormComment(e.target.value)}
            rows={3}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={submitting || formRating < 1} className="btn-submit-review">
              {submitting ? 'Enviando...' : userReview ? 'Actualizar' : 'Publicar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-cancel-review">Cancelar</button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: 20 }}>No hay reseñas para este curso.</p>
        ) : reviews.map(r => (
          <div key={r.id} className="review-card">
            <div className="review-card-header">
              <strong>{r.userFullName || 'Usuario'}</strong>
              {renderStars(r.rating)}
              <span className="review-date">{new Date(r.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
            {r.comment && <p className="review-comment">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseReviews;
