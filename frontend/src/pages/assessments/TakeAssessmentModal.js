import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const TakeAssessmentModal = ({ assessment, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submissionId, setSubmissionId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [startLoading, setStartLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState(assessment);
  const { user } = useAuth();

  useEffect(() => {
    const boot = async () => {
      if (!assessment.questions || assessment.questions.length === 0) {
        try {
          const res = await api.get(`/assessments/${assessment.id}`);
          setAssessmentData(res.data);
        } catch (e) {
          console.error('Failed to load assessment details', e);
        }
      }
      await startAssessment();
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAssessment = async () => {
    try {
      const token = localStorage.getItem('token');
      const idToUse = assessmentData?.id || assessment.id;
      const url = token
        ? `/assessments/${idToUse}/submissions/start`
        : `/assessments/${idToUse}/submissions/start?userId=${user?.id || ''}`;
      const response = await api.post(url);
      setSubmissionId(response?.data?.id);
      setStartLoading(false);
    } catch (err) {
      console.error('Error starting assessment:', err);
      setStartLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
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
      const token = localStorage.getItem('token');
      const idToUse = assessmentData?.id || assessment.id;
      const url = token
        ? `/assessments/${idToUse}/submissions/${submissionId}/submit`
        : `/assessments/${idToUse}/submissions/${submissionId}/submit?userId=${user?.id || ''}`;
      await api.post(url, { answers });
      setSubmitted(true);
      onComplete();
    } catch (err) {
      console.error('Error submitting assessment:', err);
    }
  };

  const questions = assessmentData?.questions || assessment?.questions || [];

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

  if (startLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Iniciando evaluación...</h3>
          <p>Preparando tu evaluación, por favor espera un momento.</p>
          <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  if (!question) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Sin preguntas</h3>
          <p>No se encontraron preguntas para esta evaluación.</p>
          <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content assessment-modal">
        <div className="assessment-header">
          <h3>{assessment.title}</h3>
          <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
        </div>

        <div className="question-content">
          <h4>{question.questionText}</h4>

          {question.questionType === 'MULTIPLE_CHOICE' && (
            <div className="options">
              {(function(){
                try { return JSON.parse(question.options || '[]'); } catch(e) { return []; }
              })().map((option, index) => (
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

          {currentQuestion < questions.length - 1 ? (
            <button onClick={nextQuestion} className="btn btn-primary">
              Siguiente
            </button>
          ) : (
            <button onClick={submitAssessment} className="btn btn-success" disabled={!submissionId}>
              Enviar Evaluación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeAssessmentModal;
