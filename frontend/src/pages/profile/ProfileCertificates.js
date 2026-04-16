import React from 'react';

function ProfileCertificates({ certificates }) {
  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <h3>Mis Certificados</h3>
      </div>

      {!certificates || certificates.length === 0 ? (
        <div className="empty-state">
          <p>Aún no tienes certificados. ¡Completa un curso para obtener el tuyo!</p>
        </div>
      ) : (
        <div className="certificates-list">
          {certificates.map((cert) => (
            <div key={cert.id} className="certificate-card">
              <div className="certificate-icon">🏆</div>
              <div className="certificate-info">
                <h4>{cert.courseTitle}</h4>
                <p className="certificate-date">
                  Emitido el{' '}
                  {new Date(cert.issueDate).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              {cert.certificateUrl && (
                <a
                  href={cert.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-download-cert"
                >
                  Ver certificado
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfileCertificates;
