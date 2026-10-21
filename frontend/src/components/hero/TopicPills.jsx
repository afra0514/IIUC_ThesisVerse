
import React from 'react';
import '../../styles/hero/TopicPills.css';

export default function TopicPills({ onSelectTopic }) {
  const topics = [
    'Machine Learning',
    'NLP',
    'Computer Vision',
    'IoT',
    'Cyber Security',
    'Blockchain'
  ];

  return (
    <div className="topic-pills-container">
      {topics.map((topic, index) => (
        <button
          key={index}
          type="button"
          className="topic-pill-btn"
          onClick={() => onSelectTopic && onSelectTopic(topic)}
        >
          {topic}
        </button>
      ))}
    </div>
  );

}