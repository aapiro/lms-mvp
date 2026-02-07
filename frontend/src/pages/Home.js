import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">

       <main className="main-content">
        <h2>Available Courses</h2>
        
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses available yet.</p>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span className="price">{course.price === 0 || course.price === '0' ? 'Free' : `$${course.price}`}</span>
                    <span className="lessons">{course.lessonCount} lessons</span>
                  </div>
                  {course.purchased && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progressPercentage || 0}%` }}
                      ></div>
                      <span className="progress-text">{course.progressPercentage || 0}% Complete</span>
                    </div>
                  )}
                </div>
                <Link to={`/course/${course.id}`} className="btn-view">
                  {course.purchased ? 'Continue Learning' : 'View Details'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
