import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import './Lesson.css';

function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLesson();
  }, [id]);

  const loadLesson = async () => {
    try {
      const response = await api.get(`/lessons/${id}`);
      setLesson(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async () => {
    try {
      await api.post(`/progress/lessons/${id}/complete?courseId=${lesson.courseId}`);
      alert('Lesson marked as completed!');
    } catch (err) {
      console.error('Error marking lesson complete:', err);
    }
  };

  if (loading) return <div className="loading">Loading lesson...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!lesson) return <div className="error">Lesson not found</div>;

  return (
    <div className="lesson-container">
      <div className="lesson-header">
        <button onClick={() => navigate(`/course/${lesson.courseId}`)} className="btn-back">
          ← Back to Course
        </button>
        <h1>{lesson.title}</h1>
      </div>

      <div className="lesson-content">
        {lesson.lessonType === 'VIDEO' ? (
          <div className="video-container">
            <video controls width="100%" onEnded={markCompleted}>
              <source src={lesson.fileUrl} type="video/mp4" />
              Your browser does not support video playback.
            </video>
          </div>
        ) : lesson.lessonType === 'PDF' ? (
          <div className="pdf-container">
            <iframe 
              src={lesson.fileUrl} 
              width="100%" 
              height="800px"
              title={lesson.title}
            />
            <a 
              href={lesson.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-download"
            >
              Download PDF
            </a>
          </div>
        ) : null}
      </div>

      <div className="lesson-actions">
        <button onClick={markCompleted} className="btn-complete">
          Mark as Completed
        </button>
      </div>
    </div>
  );
}

export default Lesson;
