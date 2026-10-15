# Sumaiya Akter Emo: 

Team 3, IIUC ThesisVerse, CSE-4708 Field Work

| # | Part | Files |
|---|---|---|
| 1 | Pages | `src/pages/Home.jsx`, `styles/pages/Home.css` |
| 2 | Context | `src/context/AuthContext.jsx`, `ChatContext.jsx`, `AppDataContext.jsx`, `ContentContext.jsx` |
| 3 | Journal Discovery | `components/journalDiscovery/` (JournalSection, JournalCard, PredatoryJournalTips) |
| 4 | Template Hub | `components/templateHub/` (TemplateSection, TemplateCard, PresentationRulesModal), `data/presentationRulesData.js`, `public/downloads/` |
| 5 | Chatbot | `components/chatbot/` (FloatingChatbotButton, ChatWindow, ChatMessage) |
| 6 | Journal data | `src/data/journalsData.js` |
| 7 | Dashboard | `components/dashboard/` (StudentDashboard, SupervisorDashboard) |
| 8 | Admin row actions | `src/admin/components/RowActions.jsx` |
| 9 | Admin journals page | `src/admin/pages/JournalsPage.jsx` |
| 10 | Admin users page | `src/admin/pages/UsersPage.jsx` |
| 11 | Admin entry | `src/admin/main.jsx` |
| 12 | Admin data refresh hook | `src/admin/useDbVersion.js` |
| 13 | Admin API | `src/services/adminApi.js` |

## What each part does
- **Pages:** puts all sections together on the home page and shows the student or supervisor dashboard after login.
- **Context:** login, register and profile; the chatbot's answers; supervisors, requests and notifications; and the content that the admin panel edits.
- **Journal Discovery:** 6 research portals with search links and tips for avoiding predatory journals.
- **Template Hub:** template downloads that check whether each file exists, and a popup with the 13 presentation rules.
- **Chatbot:** suggests supervisors by topic, opens paper searches, and answers template and defense questions.
- **Dashboard:** thesis milestones, saved items and supervision requests for students; incoming requests for supervisors.
- **Admin:** manage users and journal portals, with edit, delete and reorder actions.
