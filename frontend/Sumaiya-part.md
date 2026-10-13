# Sumaiya Akter Emo (C223215): Contribution

Team 3, IIUC ThesisVerse, CSE-4708 Field Work

| # | Part | Files |
|---|---|---|
| 1 | Pages | `frontend/src/pages/Home.jsx`, `styles/pages/Home.css` |
| 2 | Context | `frontend/src/context/AuthContext.jsx`, `ChatContext.jsx` |
| 3 | Journal Discovery | `components/journalDiscovery/` (JournalSection, JournalCard, PredatoryJournalTips) |
| 4 | Template Hub | `components/templateHub/` (TemplateSection, TemplateCard, PresentationRulesModal), `public/downloads/` |
| 5 | Chatbot | `components/chatbot/` (FloatingChatbotButton, ChatWindow, ChatMessage) |
| 6 | Journal data | `frontend/src/data/journalsData.js`, `presentationRulesData.js` |

## What each part does
- **Pages:** puts all sections together on the home page and keeps each student's saved items separate.
- **Context:** handles login, register and the session, and builds the chatbot's answers from the portal data.
- **Journal Discovery:** 6 research portals with search links and tips for avoiding predatory journals.
- **Template Hub:** template downloads that check whether each file exists, and a popup with the 13 presentation rules.
- **Chatbot:** suggests supervisors by topic, opens paper searches, and answers template and defense questions.
