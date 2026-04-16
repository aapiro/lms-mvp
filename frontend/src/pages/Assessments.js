import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './Assessments.css';
import CreateAssessmentForm from './assessments/CreateAssessmentForm';
import TakeAssessmentModal from './assessments/TakeAssessmentModal';

const Assessments = ({ courseId, assessments: initialAssessments }) => {
  const [assessments, setAssessments] = useState(initialAssessments || []);
  const [loading, setLoading] = useState(!initialAssessments);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  useEffect(() => {
    if (!initialAssessments) {
      loadAssessments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, initialAssessments]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/assessments/courses/${courseId}`);
      setAssessments(response.data);
    } catch (err) {
      setError('Error al cargar evaluaciones');
      console.error('Error loading assessments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (assessmentData) => {
    try {
      await api.post(`/assessments/courses/${courseId}`, assessmentData);
      setShowCreateForm(false);
      loadAssessments();
    } catch (err) {
      setError('Error al crear evaluación');
      console.error('Error creating assessment:', err);
    }
  };

  if (loading) return <div className="loading">Cargando evaluaciones...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="assessments-container">
      <div className="assessments-header">
        <h2>Evaluaciones del Curso</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          Crear Evaluación
        </button>
      </div>

      {assessments.length === 0 ? (
        <div className="no-assessments">
          <p>No hay evaluaciones disponibles para este curso.</p>
        </div>
      ) : (
        <div className="assessments-grid">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="assessment-card">
              <h3>{assessment.title}</h3>
              <p>{assessment.description}</p>
              <div className="assessment-info">
                <span>📅 Inicio: {new Date(assessment.startDate).toLocaleDateString()}</span>
                <span>⏰ Duración: {assessment.durationMinutes} min</span>
                <span>🎯 Puntos: {assessment.totalPoints}</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedAssessment(assessment)}
              >
                Realizar Evaluación
              </button>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <CreateAssessmentForm
          onSubmit={handleCreateAssessment}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {selectedAssessment && (
        <TakeAssessmentModal
          assessment={selectedAssessment}
          onClose={() => setSelectedAssessment(null)}
          onComplete={loadAssessments}
        />
      )}
    </div>
  );
};

export default Assessments;
