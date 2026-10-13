import React, { useState } from 'react';
import { X, Mail, Phone, ExternalLink, FileText, BookOpen, Copy, Check, UserRound, Send } from 'lucide-react';
import '../../styles/supervisorDirectory/SupervisorDetailModal.css';

const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' };

export default function SupervisorDetailModal({ supervisor, onClose, canRequest, existingRequest, onRequest }) {
  const [copied, setCopied] = useState(false);
  if (!supervisor) return null;

  // ব্রাউজারে সরাসরি Gmail খোলার লিঙ্ক (Outlook চালু হবে না)
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(supervisor.email)}&su=${encodeURIComponent('Thesis Supervision Query - IIUC')}`;

  const copyEmail = () => {
    navigator.clipboard.writeText(supervisor.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slotsLeft = supervisor.openSlotsLeft ?? supervisor.openSlots ?? 0;
  const blockedByRequest =
    existingRequest && (existingRequest.status === 'pending' || existingRequest.status === 'accepted');

  return (
    <div className="detail-modal-backdrop">
      <div className="detail-modal-box">
        
        {/* Header */}
        <div className="detail-modal-header">
          <div className="modal-header-profile">
            {/* Placeholder icon until real profile photos come from the backend */}
            {supervisor.image ? (
              <img src={supervisor.image} alt={supervisor.name} className="modal-avatar" />
            ) : (
              <div className="modal-avatar modal-avatar-placeholder">
                <UserRound className="w-7 h-7" />
              </div>
            )}
            <div>
              <h3 className="modal-faculty-name">{supervisor.name}</h3>
              <p className="modal-faculty-subtitle">{supervisor.designation}, {supervisor.department}</p>
            </div>
          </div>

          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="detail-modal-body">
          
          <div className="modal-section">
            <h4 className="modal-section-title">Biography &amp; Focus Area</h4>
            <p className="modal-bio-text">
              {supervisor.bio || 'This supervisor has not added a biography yet.'}
            </p>
          </div>

          <div className="modal-section">
            <h4 className="modal-section-title">Research Domains</h4>
            <div className="modal-tags-wrapper">
              {supervisor.tags.length === 0 && (
                <span className="modal-bio-text">No research domains added yet.</span>
              )}
              {supervisor.tags.map((tag, idx) => (
                <span key={idx} className="modal-domain-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-section">
            <h4 className="modal-section-title">Research Track Record</h4>
            <div className="metrics-box">
              <div className="metric-item">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="metric-val">{supervisor.papers}</span>
                <span className="metric-lbl">Publications</span>
              </div>
              <div className="metric-item">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="metric-val">{slotsLeft}</span>
                <span className="metric-lbl">Supervision Slots Open</span>
              </div>
            </div>
          </div>

          {/* Supervision request (students only) */}
          {canRequest && (
            <div className="modal-section">
              <h4 className="modal-section-title">Supervision Request</h4>
              <div className="request-section-box">
                {existingRequest && (
                  <div className="request-status-row">
                    <span className="text-xs text-slate-600">Your latest request:</span>
                    <span className={`request-status-chip ${existingRequest.status}`}>
                      {STATUS_LABEL[existingRequest.status]}
                    </span>
                  </div>
                )}

                {blockedByRequest ? (
                  <p className="request-section-text">
                    {existingRequest.status === 'pending'
                      ? 'Your request is waiting for the supervisor to respond. You will get a notification here.'
                      : 'This supervisor accepted your request.'}
                  </p>
                ) : slotsLeft <= 0 ? (
                  <p className="request-section-text">
                    This supervisor has no open supervision slots right now.
                  </p>
                ) : (
                  <p className="request-section-text">
                    {existingRequest && existingRequest.status === 'rejected'
                      ? 'Your previous request was rejected. You can send a new request with a different topic.'
                      : 'Send your thesis topic and group details directly to this supervisor.'}
                  </p>
                )}

                <button
                  type="button"
                  className="send-request-btn"
                  onClick={onRequest}
                  disabled={blockedByRequest || slotsLeft <= 0}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Supervision Request</span>
                </button>
              </div>
            </div>
          )}

          {/* Contact Hub: Outlook বন্ধ করা হয়েছে */}
          <div className="modal-section">
            <h4 className="modal-section-title">Direct Contact Channels</h4>
            <div className="contact-buttons-grid">
              
              {/* Send via Web Gmail */}
              <a
                href={gmailUrl}
                target="_blank"
                rel="noreferrer"
                className="contact-btn email-btn"
              >
                <Mail className="w-4 h-4" />
                <span>Send via Gmail</span>
              </a>

              {/* Copy Email Button */}
              <button
                type="button"
                className="contact-btn copy-btn"
                onClick={copyEmail}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Email Copied!' : 'Copy Email'}</span>
              </button>

              <a
                href={`https://wa.me/${(supervisor.phone || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="contact-btn whatsapp-btn"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp Direct</span>
              </a>

              <a
                href={supervisor.scholar || 'https://scholar.google.com'}
                target="_blank"
                rel="noreferrer"
                className="contact-btn scholar-btn"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Google Scholar</span>
              </a>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
