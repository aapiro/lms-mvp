import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './AiTutor.css';

function AiTutor({ courseId }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && user && !conversationId) {
      loadConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const res = await api.get(`/tutor/courses/${courseId}/conversation`);
      setConversationId(res.data.conversationId);
      setMessages(res.data.messages || []);
    } catch { /* ignore */ }
  };

  const startNewChat = async () => {
    try {
      const res = await api.post(`/tutor/courses/${courseId}/conversation/new`);
      setConversationId(res.data.conversationId);
      setMessages([]);
    } catch { /* ignore */ }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !conversationId) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, id: Date.now() }]);
    setLoading(true);

    try {
      const res = await api.post(`/tutor/conversations/${conversationId}/message`, {
        message: userMsg,
        courseId,
      });
      setMessages(res.data.history || []);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant', content: 'Error al enviar el mensaje. Intenta de nuevo.', id: Date.now() + 1
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        className={`tutor-fab ${isOpen ? 'tutor-fab--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Cerrar tutor AI' : 'Abrir tutor AI'}
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="tutor-panel">
          <div className="tutor-header">
            <div className="tutor-header-info">
              <span className="tutor-header-icon">🤖</span>
              <div>
                <strong>AI Tutor</strong>
                <span className="tutor-status">En línea</span>
              </div>
            </div>
            <button className="tutor-new-chat" onClick={startNewChat} title="Nueva conversación">
              ↻
            </button>
          </div>

          <div className="tutor-messages">
            {messages.length === 0 && (
              <div className="tutor-welcome">
                <span className="tutor-welcome-icon">🎓</span>
                <p><strong>¡Hola!</strong> Soy tu tutor AI para este curso.</p>
                <p>Pregúntame lo que quieras sobre el material del curso. Estoy aquí para ayudarte a aprender.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={msg.id || i} className={`tutor-msg tutor-msg--${msg.role}`}>
                <div className="tutor-msg-bubble">
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="tutor-msg tutor-msg--assistant">
                <div className="tutor-msg-bubble tutor-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="tutor-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={loading}
              className="tutor-input"
              autoFocus
            />
            <button type="submit" disabled={loading || !input.trim()} className="tutor-send">
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default AiTutor;
