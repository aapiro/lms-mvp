import React, { useState } from 'react';

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

export default CreateAssessmentForm;
