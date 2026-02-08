import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './Assessments.css';

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

  const handleTakeAssessment = (assessment) => {
    setSelectedAssessment(assessment);
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
                onClick={() => handleTakeAssessment(assessment)}
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

const CreateAssessmentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    durationMinutes: 60,
    totalPoints: 100,
    questions: []
  });

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, {
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 10
      }]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processedQuestions = formData.questions.map(q => ({
      ...q,
      options: q.questionType === 'MULTIPLE_CHOICE' ? JSON.stringify(q.options) : null
    }));
    onSubmit({ ...formData, questions: processedQuestions });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Crear Nueva Evaluación</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha Inicio:</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha Fin:</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Duración (minutos):</label>
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                required
              />
            </div>
            <div className="form-group">
              <label>Puntos Totales:</label>
              <input
                type="number"
                value={formData.totalPoints}
                onChange={(e) => setFormData({...formData, totalPoints: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="questions-section">
            <h4>Preguntas</h4>
            {formData.questions.map((question, index) => (
              <div key={index} className="question-item">
                <input
                  type="text"
                  placeholder="Texto de la pregunta"
                  value={question.questionText}
                  onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                  required
                />
                <select
                  value={question.questionType}
                  onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                >
                  <option value="MULTIPLE_CHOICE">Opción Múltiple</option>
                  <option value="OPEN_ENDED">Pregunta Abierta</option>
                </select>
                {question.questionType === 'MULTIPLE_CHOICE' && (
                  <div className="options">
                    {question.options.map((option, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        placeholder={`Opción ${optIndex + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...question.options];
                          newOptions[optIndex] = e.target.value;
                          updateQuestion(index, 'options', newOptions);
                        }}
                      />
                    ))}
                    <input
                      type="text"
                      placeholder="Respuesta correcta"
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                    />
                  </div>
                )}
                <input
                  type="number"
                  placeholder="Puntos"
                  value={question.points}
                  onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                  required
                />
              </div>
            ))}
            <button type="button" onClick={addQuestion} className="btn btn-secondary">
              Agregar Pregunta
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Crear Evaluación</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TakeAssessmentModal = ({ assessment, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submissionId, setSubmissionId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    startAssessment();
  }, []);

  const startAssessment = async () => {
    try {
      const response = await api.post(`/assessments/${assessment.id}/submissions/start`);
      setSubmissionId(response.data.id);
    } catch (err) {
      console.error('Error starting assessment:', err);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitAssessment = async () => {
    try {
      await api.post(`/assessments/${assessment.id}/submissions/${submissionId}/submit`, {
        answers
      });
      setSubmitted(true);
      onComplete();
    } catch (err) {
      console.error('Error submitting assessment:', err);
    }
  };

  if (submitted) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>¡Evaluación Completada!</h3>
          <p>Tu evaluación ha sido enviada correctamente.</p>
          <button onClick={onClose} className="btn btn-primary">Cerrar</button>
        </div>
      </div>
    );
  }

  if (!assessment.questions) return <div>Cargando...</div>;

  const question = assessment.questions[currentQuestion];

  return (
    <div className="modal-overlay">
      <div className="modal-content assessment-modal">
        <div className="assessment-header">
          <h3>{assessment.title}</h3>
          <span>Pregunta {currentQuestion + 1} de {assessment.questions.length}</span>
        </div>

        <div className="question-content">
          <h4>{question.questionText}</h4>

          {question.questionType === 'MULTIPLE_CHOICE' && (
            <div className="options">
              {JSON.parse(question.options || '[]').map((option, index) => (
                <label key={index} className="option">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {question.questionType === 'OPEN_ENDED' && (
            <textarea
              placeholder="Escribe tu respuesta aquí..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              rows={6}
            />
          )}
        </div>

        <div className="assessment-actions">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            Anterior
          </button>

          {currentQuestion < assessment.questions.length - 1 ? (
            <button onClick={nextQuestion} className="btn btn-primary">
              Siguiente
            </button>
          ) : (
            <button onClick={submitAssessment} className="btn btn-success">
              Enviar Evaluación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessments;

