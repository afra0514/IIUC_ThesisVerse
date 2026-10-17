import React from 'react';
import AboutUsContent from './AboutUsContent';
import ContactUsCard from './ContactUsCard';
import '../../styles/aboutAndContact/AboutAndContactSection.css';

export default function AboutAndContactSection() {
  return (
    <section className="about-contact-section" id="about-us">
      <div className="about-contact-container">
        
        <div className="about-column-wrapper">
          <AboutUsContent />
        </div>

        <div className="contact-column-wrapper" id="contact-us">
          <ContactUsCard />
        </div>

      </div>
    </section>
  );
}