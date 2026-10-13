import React from 'react';
import { Mail, Building, Phone, MapPin } from 'lucide-react';
import '../../styles/aboutAndContact/ContactUsCard.css';

export default function ContactUsCard() {
  return (
    <div className="contact-dark-card">
      
      <span className="contact-sub-tag">CONTACT US</span>
      <h3 className="contact-main-title">Department of CSE, IIUC</h3>

      <div className="contact-info-list">
        
        <div className="contact-info-row">
          <div className="contact-icon-circle">
            <Mail className="w-4 h-4 text-slate-300" />
          </div>
          <div className="contact-text-group">
            <span className="contact-label">Support email</span>
            <a href="mailto:thesisverse@iiuc.ac.bd" className="contact-val-link">
              thesisverse@iiuc.ac.bd
            </a>
          </div>
        </div>

        <div className="contact-info-row">
          <div className="contact-icon-circle">
            <Building className="w-4 h-4 text-slate-300" />
          </div>
          <div className="contact-text-group">
            <span className="contact-label">CSE Department office</span>
            <a href="mailto:cse@iiuc.ac.bd" className="contact-val-link">
              cse@iiuc.ac.bd
            </a>
          </div>
        </div>

        <div className="contact-info-row">
          <div className="contact-icon-circle">
            <Phone className="w-4 h-4 text-slate-300" />
          </div>
          <div className="contact-text-group">
            <span className="contact-label">Phone</span>
            <a href="tel:+8802334401990" className="contact-val-link">
              +880 2-334401990
            </a>
          </div>
        </div>

        <div className="contact-info-row">
          <div className="contact-icon-circle">
            <MapPin className="w-4 h-4 text-slate-300" />
          </div>
          <div className="contact-text-group">
            <span className="contact-label">Campus address</span>
            <span className="contact-val-text">
              Kumira, Sitakunda, Chattogram-4318, Bangladesh
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}