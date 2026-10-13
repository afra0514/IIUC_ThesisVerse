import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { supervisorsData } from '../data/supervisorsData';
import { journalsData, predatoryJournalTipsData } from '../data/journalsData';
import { templatesData } from '../data/templatesData';
import { guidelinesData, defenseStagesData } from '../data/guidelinesData';

const ChatContext = createContext(null);

const GREETING =
  'Assalamu Alaikum! I am the ThesisVerse assistant. Ask me which supervisor works on a topic, where to find papers, which templates are available, or how the defense is marked. I answer from the data on this portal.';

const TOPIC_WORDS = {
  'machine learning': ['machine learning', 'deep learning', 'neural network', 'artificial intelligence', 'prediction', 'classification', 'ml', 'ai'],
  nlp: ['natural language', 'language', 'bangla', 'bengali', 'sentiment', 'chatbot', 'text', 'nlp'],
  'bangla language processing': ['bangla', 'bengali'],
  'computer vision': ['computer vision', 'vision', 'image', 'video', 'camera', 'face', 'object detection'],
  'medical imaging': ['medical', 'x-ray', 'mri', 'ct scan', 'disease', 'health'],
  iot: ['internet of things', 'smart home', 'sensor', 'arduino', 'iot'],
  'embedded systems': ['embedded', 'microcontroller', 'esp32', 'arduino'],
  'cyber security': ['cyber security', 'cybersecurity', 'security', 'malware', 'phishing', 'attack', 'fraud', 'hacking'],
  'network intrusion detection': ['intrusion', 'ddos', 'network attack'],
  blockchain: ['blockchain', 'smart contract', 'ledger', 'crypto'],
  'distributed systems': ['distributed', 'cloud computing', 'parallel'],
  'power systems': ['power system', 'smart grid', 'grid', 'microgrid'],
  'renewable energy': ['renewable', 'solar', 'wind energy', 'energy']
};

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasWord = (text, word) => new RegExp(`(^|[^a-z0-9])${escapeRegex(word)}([^a-z0-9]|$)`, 'i').test(text);
const hasAny = (text, words) => words.some((word) => hasWord(text, word));

function topicsIn(text) {
  const tags = new Set(supervisorsData.flatMap((s) => s.tags.map((tag) => tag.toLowerCase())));
  return [...tags].filter((tag) => hasWord(text, tag) || hasAny(text, TOPIC_WORDS[tag] || []));
}

const labelFor = (tag) => {
  for (const s of supervisorsData) {
    const found = s.tags.find((t) => t.toLowerCase() === tag);
    if (found) return found;
  }
  return tag;
};

function rankSupervisors(topics) {
  return supervisorsData
    .map((s) => {
      const shared = s.tags.filter((tag) => topics.includes(tag.toLowerCase()));
      return { s, shared, score: shared.length * 2 + (topics.some((t) => (s.bio || '').toLowerCase().includes(t)) ? 1 : 0) };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || (b.s.papers || 0) - (a.s.papers || 0));
}

const asCard = ({ s }) => ({
  name: s.name,
  designation: `${s.designation}, ${s.department}`,
  papers: s.papers ? `${s.papers} Research Papers` : '',
  link: '#supervisors'
});

function searchPhrase(text, topics) {
  if (topics.length) return topics.map(labelFor).join(' ');
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\b(find|search|show|me|some|any|papers?|journals?|articles?|on|about|for|the|a|an|please|where|can|i|how|to|get|good|best|recent|who|works?|is|are|there|supervisors?|teachers?|faculty|sir|madam|maam|ieee|xplore|sciencedirect|springer|springerlink|arxiv|scopus|google|scholar)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildReply(text) {
  const lower = text.toLowerCase();
  const topics = topicsIn(lower);

  if (/^\s*(hi|hello|hey|salam|assalamu?\s*alaikum)\b[\s!.]*$/i.test(text)) {
    return { text: GREETING };
  }

  if (hasAny(lower, ['predatory', 'fake journal', 'scam', 'guaranteed acceptance'])) {
    return {
      text: `${predatoryJournalTipsData.title}:`,
      bullets: [...predatoryJournalTipsData.columnOne, ...predatoryJournalTipsData.columnTwo]
    };
  }

  if (hasAny(lower, ['template', 'templates', 'overleaf', 'latex', 'word file', 'docx', 'format', 'slides', 'pptx', 'cover page'])) {
    const latex = templatesData.find((t) => t.hasOverleafLink);
    const askedLatex = hasAny(lower, ['overleaf', 'latex']);
    return {
      text: askedLatex && latex
        ? `Use the "${latex.title}" (${latex.formatBadge}) from the Templates Hub and open it in Overleaf. All ${templatesData.length} templates:`
        : `There are ${templatesData.length} templates in the Download Templates Hub:`,
      bullets: templatesData.map((t) => `${t.title} (${t.formatBadge})`),
      links: [
        { title: 'Go to the Templates Hub', url: '#templates' },
        ...(askedLatex && latex ? [{ title: 'Overleaf documentation', url: latex.overleafUrl }] : [])
      ]
    };
  }

  if (hasAny(lower, ['defense', 'defence', 'rubric', 'rubrics', 'viva', 'marking', 'marks', 'pre-defense', 'proposal', 'guideline', 'guidelines'])) {
    return {
      text: 'The defense is marked in three stages:',
      bullets: defenseStagesData.map((stage) => stage.stage),
      links: [{ title: `Read the ${guidelinesData.length} thesis guidelines`, url: '#guidelines' }]
    };
  }

  if (hasAny(lower, ['paper', 'papers', 'journal', 'journals', 'article', 'articles', 'literature', 'ieee', 'scopus', 'arxiv', 'springer', 'sciencedirect', 'scholar'])) {
    const phrase = searchPhrase(text, topics);
    const named = journalsData.filter((j) => hasWord(lower, j.name.toLowerCase()) || hasWord(lower, j.id));
    const portals = (named.length ? named : journalsData.filter((j) => ['ieee', 'scholar', 'sciencedirect'].includes(j.id))).slice(0, 3);
    const link = (j) => (phrase && j.searchUrl.endsWith('=') ? j.searchUrl + encodeURIComponent(phrase) : j.searchUrl);
    return {
      text: phrase
        ? `Here are searches for "${phrase}". Before you cite a result, check that it is peer-reviewed and the journal is indexed.`
        : 'Start with these portals. Tell me a topic, for example "papers on IoT", and I will open the search for it.',
      links: portals.map((j) => ({ title: phrase ? `${j.name}: ${phrase}` : j.name, url: link(j) }))
    };
  }

  if (topics.length) {
    const matches = rankSupervisors(topics).slice(0, 2);
    const topicText = topics.map(labelFor).join(', ');
    if (matches.length === 0) {
      return { text: `No listed supervisor names ${topicText} yet. Ask the department office who works on it.` };
    }
    return {
      text:
        matches.length === 1
          ? `${matches[0].s.name} lists ${matches[0].shared.join(', ')} as a research area.`
          : `${matches.length} supervisors list ${topicText} as a research area:`,
      recommendations: matches.map(asCard)
    };
  }

  if (hasAny(lower, ['supervisor', 'supervisors', 'supervises', 'teacher', 'faculty', 'sir', 'madam', 'maam'])) {
    const tags = [...new Set(supervisorsData.flatMap((s) => s.tags))];
    const asked = searchPhrase(text, []);
    return {
      text: asked
        ? `No listed supervisor names "${asked}" as a research area yet. Ask the department office, or pick one of the listed areas:`
        : 'Tell me your topic and I will find a supervisor who works on it. The listed research areas are:',
      bullets: [tags.join(', ')]
    };
  }

  return {
    text: 'I can help with four things: supervisors for a topic, paper search portals, thesis templates, and defense guidelines. Try "Who works on blockchain?" or "Papers on computer vision".'
  };
}

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, sender: 'bot', text: GREETING }]);
  const nextId = useRef(2);
  const { user } = useAuth();
  const studentId = user ? user.studentId : null;

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setMessages([{ id: nextId.current++, sender: 'bot', text: GREETING }]);
    setIsChatOpen(false);
  }, [studentId]);

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const toggleChat = () => setIsChatOpen((prev) => !prev);

  const sendMessage = (text) => {
    if (!text || !text.trim()) return;
    const clean = text.trim();
    setMessages((prev) => [...prev, { id: nextId.current++, sender: 'user', text: clean }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId.current++, sender: 'bot', ...buildReply(clean) }]);
      setIsTyping(false);
    }, 500);
  };

  const clearChat = () => {
    setMessages([{ id: nextId.current++, sender: 'bot', text: GREETING }]);
  };

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        openChat,
        closeChat,
        toggleChat,
        messages,
        isTyping,
        sendMessage,
        clearChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
