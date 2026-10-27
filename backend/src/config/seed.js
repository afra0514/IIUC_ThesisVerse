const User = require('../models/User');
const SupervisorProfile = require('../models/SupervisorProfile');
const Guideline = require('../models/Guideline');
const Template = require('../models/Template');
const Journal = require('../models/Journal');

const initialSupervisors = [
  {
    profileId: '1',
    name: 'Dr. Mohammad Mahmudul Hasan',
    designation: 'Professor',
    department: 'Dept. of CSE',
    papers: 64,
    openSlots: 3,
    tags: ['Machine Learning', 'NLP', 'Bangla Language Processing'],
    email: 'mhasan@iiuc.ac.bd',
    phone: '+8801819000001',
    scholar: 'https://scholar.google.com',
    researchgate: 'https://researchgate.net',
    linkedin: 'https://linkedin.com',
    bio: 'Specialized in Natural Language Processing, Machine Learning architectures, and Bangla Computational Linguistics with 15+ years of research and teaching experience.',
    custom: false
  },
  {
    profileId: '2',
    name: 'Nusrat Jahan Chowdhury',
    designation: 'Lecturer',
    department: 'Dept. of CSE',
    papers: 18,
    openSlots: 2,
    tags: ['Computer Vision', 'Machine Learning', 'Medical Imaging'],
    email: 'nusrat@iiuc.ac.bd',
    phone: '+8801819000002',
    scholar: 'https://scholar.google.com',
    researchgate: 'https://researchgate.net',
    linkedin: 'https://linkedin.com',
    bio: 'Focuses on deep learning applications in biomedical image classification, healthcare analytics, and automated tumor detection.',
    custom: false
  },
  {
    profileId: '3',
    name: 'Dr. Tanvir Ahmed Rahman',
    designation: 'Assistant Professor',
    department: 'Dept. of CSE',
    papers: 31,
    openSlots: 4,
    tags: ['Cyber Security', 'Blockchain', 'Network Intrusion Detection'],
    email: 'tanvir@iiuc.ac.bd',
    phone: '+8801819000003',
    scholar: 'https://scholar.google.com',
    researchgate: 'https://researchgate.net',
    linkedin: 'https://linkedin.com',
    bio: 'Leading research on smart contract auditing, decentralized identity solutions, and zero-day threat detection in campus networks.',
    custom: false
  },
  {
    profileId: '4',
    name: 'Prof. Dr. Abdul Karim Chowdhury',
    designation: 'Professor & Dean',
    department: 'Dept. of EEE',
    papers: 92,
    openSlots: 2,
    tags: ['IoT', 'Power Systems', 'Renewable Energy'],
    email: 'karim@iiuc.ac.bd',
    phone: '+8801819000004',
    scholar: 'https://scholar.google.com',
    researchgate: 'https://researchgate.net',
    linkedin: 'https://linkedin.com',
    bio: 'Senior researcher in smart grid optimization, microgrid stability, and industrial IoT monitoring systems.',
    custom: false
  },
  {
    profileId: '5',
    name: 'Dr. Farhana Akter',
    designation: 'Associate Professor',
    department: 'Dept. of EEE',
    papers: 47,
    openSlots: 3,
    tags: ['IoT', 'Embedded Systems', 'Computer Vision'],
    email: 'farhana@iiuc.ac.bd',
    phone: '+8801819000005',
    scholar: 'https://scholar.google.com',
    researchgate: 'https://researchgate.net',
    linkedin: 'https://linkedin.com',
    bio: 'Works on edge computing devices, robotic vision, and low-power sensor integration for environmental monitoring.',
    custom: false
  },
  {
    profileId: '6',
    name: 'Md. Rafiul Islam',
    designation: 'Lecturer',
    department: 'Dept. of CSE',
    papers: 12,
    openSlots: 4,
    tags: ['Blockchain', 'NLP', 'Distributed Systems'],
    email: 'rafiul@iiuc.ac.bd',
    phone: '+8801819000006',
    scholar: 'https://scholar.google.com',
    researchgate: 'https://researchgate.net',
    linkedin: 'https://linkedin.com',
    bio: 'Research interests include distributed consensus algorithms, decentralized finance (DeFi), and semantic text analysis.',
    custom: false
  }
];

const initialGuidelines = [
  {
    guidelineId: 'topic-selection',
    order: 0,
    title: 'Topic Selection & Research Gap Formulation',
    description: 'Move from a broad interest to a defensible, novel research question in four structured steps.',
    iconName: 'Lightbulb',
    tags: ['Survey recent literature', 'Build a gap matrix', 'Check feasibility', 'Draft the problem statement'],
    details: {
      subtitle: 'From a broad interest to a defensible research question',
      stages: [
        {
          title: 'Step 1 — Survey recent literature',
          points: [
            'Search IEEE Xplore, Scopus and Google Scholar for your area of interest',
            'Focus on papers from the last 3–5 years',
            'Note the dataset, method, metrics and stated limitations of each paper'
          ]
        },
        {
          title: 'Step 2 — Build a gap matrix',
          points: [
            'List papers as rows and method / dataset / metric / limitation as columns',
            'Empty or repeated weak cells point to an unexplored or unsolved gap',
            'Pick a gap you can explain in one or two sentences'
          ]
        },
        {
          title: 'Step 3 — Check feasibility',
          points: [
            'Confirm data availability and the computing resources you need',
            'Estimate whether the work fits within your thesis timeline',
            'Check that a faculty member has expertise to supervise the topic'
          ]
        },
        {
          title: 'Step 4 — Draft the problem statement',
          points: [
            'State the problem and why existing work falls short',
            'Describe your proposed approach and expected contribution',
            'Discuss the draft with your supervisor before the proposal defense'
          ]
        }
      ]
    }
  },
  {
    guidelineId: 'writing-manual',
    order: 1,
    title: 'Thesis Writing Manual',
    description: 'Chapter-by-chapter breakdown of the official IIUC thesis report structure.',
    iconName: 'Edit3',
    tags: ['Abstract (200–300 words)', 'Introduction & Literature Review', 'Methodology', 'Results & Discussion', 'References (BibTeX)'],
    details: {
      subtitle: 'Chapter-by-chapter guide — always confirm final formatting with your department',
      stages: [
        {
          title: 'Abstract (200–300 words)',
          points: [
            'Summarise the problem, method, key results and conclusion',
            'Write it last so it matches the final content'
          ]
        },
        {
          title: 'Introduction & Literature Review',
          points: [
            'Introduce the problem, motivation, objectives and contributions',
            'Review related work and make the research gap clear',
            'Cite recent, peer-reviewed sources'
          ]
        },
        {
          title: 'Methodology',
          points: [
            'Describe the dataset, models, tools and experimental setup',
            'Give enough detail for another student to reproduce your work'
          ]
        },
        {
          title: 'Results & Discussion',
          points: [
            'Present results with tables and figures and compare with benchmark methods',
            'Discuss limitations and what the results mean',
            'End with a conclusion and future work'
          ]
        },
        {
          title: 'References (BibTeX)',
          points: [
            'Keep all references in one .bib file and use one citation style (e.g. IEEE)',
            'Make sure every in-text citation appears in the reference list'
          ]
        }
      ]
    }
  },
  {
    guidelineId: 'defense-rubrics',
    order: 2,
    title: '3-Stage Defense Rubrics',
    description: 'What evaluators expect at the Proposal, Pre-Defense, and Final Defense stages.',
    iconName: 'Monitor',
    tags: ['Proposal Defense', 'Pre-Defense', 'Final Defense', 'Q&A strategy'],
    details: {
      subtitle: 'Official evaluation criteria for CSE & EEE departments',
      stages: [
        {
          title: 'Proposal Defense (30% Weight)',
          points: [
            'Problem definition clarity & motivation',
            'Literature review depth (last 3-5 years)',
            'Proposed methodology feasibility',
            'Slide presentation & initial timeline'
          ]
        },
        {
          title: 'Pre-Defense (20% Weight)',
          points: [
            'Implementation progress (at least 60-70%)',
            'Preliminary results & validation',
            'Draft report structure review',
            'Handling supervisor feedback'
          ]
        },
        {
          title: 'Final Defense (50% Weight)',
          points: [
            'Final thesis report formatting & plagiarism score',
            'Performance comparison with benchmark models',
            'Q&A defense before the examination board',
            'Publication acceptance (IEEE/Scopus/Conference)'
          ]
        }
      ]
    }
  },
  {
    guidelineId: 'profile-setup',
    order: 3,
    title: 'Academic Profile Setup',
    description: 'Step-by-step tutorials to make your research discoverable on major academic networks.',
    iconName: 'UserCheck',
    tags: ['Google Scholar', 'ResearchGate', 'ORCID'],
    details: {
      subtitle: 'Make your research discoverable on major academic networks',
      stages: [
        {
          title: 'Google Scholar',
          points: [
            'Sign in with your Google account and open "My profile"',
            'Add your name, affiliation (IIUC) and research interests',
            'Add your publications and make the profile public'
          ]
        },
        {
          title: 'ResearchGate',
          points: [
            'Create an account using your institutional email',
            'Add your department, skills and publications',
            'Follow researchers working in your thesis area'
          ]
        },
        {
          title: 'ORCID',
          points: [
            'Register for a free ORCID iD at orcid.org',
            'Link your works and keep the profile up to date',
            'Use the same iD when submitting papers to journals'
          ]
        }
      ]
    }
  }
];

const initialTemplates = [
  {
    templateId: 'docx-report',
    order: 0,
    title: 'Official IIUC Thesis Report & Cover Page',
    description: 'Pre-formatted Word template with cover, declaration, approval sheet, TOC and chapter styles.',
    formatBadge: '.DOCX',
    iconName: 'FileText',
    theme: 'blue',
    fileSize: '1.4 MB',
    updatedDate: 'Updated Aug 12, 2026',
    downloadUrl: '/downloads/iiuc-thesis-template.docx',
    hasOverleafLink: false
  },
  {
    templateId: 'latex-package',
    order: 1,
    title: 'Overleaf / LaTeX Thesis Package',
    description: 'Complete LaTeX class with IEEE BibTeX setup, figure/table macros and front matter.',
    formatBadge: '.ZIP',
    iconName: 'FileCode',
    theme: 'green',
    fileSize: '3.8 MB',
    updatedDate: 'Updated Sep 02, 2026',
    downloadUrl: '/downloads/iiuc-latex-package.zip',
    hasOverleafLink: true,
    overleafUrl: 'https://www.overleaf.com/docs'
  },
  {
    templateId: 'pptx-slides',
    order: 2,
    title: 'Proposal & Final Defense Slides',
    description: 'Two branded slide decks with suggested structure, timeline and results layouts.',
    formatBadge: '.PPTX',
    iconName: 'Presentation',
    theme: 'orange',
    fileSize: '6.2 MB',
    updatedDate: 'Updated Jul 28, 2026',
    downloadUrl: '/downloads/iiuc-defense-slides.pptx',
    hasOverleafLink: false
  }
];

const initialJournals = [
  {
    journalId: 'ieee',
    order: 0,
    name: 'IEEE Xplore',
    shortCode: 'IEEE',
    color: '#00629B',
    tierBadge: 'Scopus · Q1–Q2',
    tierColor: 'emerald',
    description: 'Premier library for electrical engineering, computer science and electronics conference and journal papers.',
    searchUrl: 'https://ieeexplore.ieee.org/search/searchresult.jsp?newsearch=true&queryText='
  },
  {
    journalId: 'sciencedirect',
    order: 1,
    name: 'ScienceDirect',
    shortCode: 'SD',
    color: '#FF6C00',
    tierBadge: 'Scopus · Q1–Q3',
    tierColor: 'emerald',
    description: "Elsevier's full-text database covering engineering, applied sciences and medicine.",
    searchUrl: 'https://www.sciencedirect.com/search?qs='
  },
  {
    journalId: 'springer',
    order: 2,
    name: 'SpringerLink',
    shortCode: 'SL',
    color: '#D97706',
    tierBadge: 'Scopus · Q1–Q4',
    tierColor: 'emerald',
    description: 'Journals, books and Lecture Notes in Computer Science (LNCS) proceedings.',
    searchUrl: 'https://link.springer.com/search?query='
  },
  {
    journalId: 'arxiv',
    order: 3,
    name: 'arXiv',
    shortCode: 'arX',
    color: '#B91C1C',
    tierBadge: 'Preprint · Not peer-reviewed',
    tierColor: 'slate',
    description: 'Open-access preprints in CS, maths and physics — great for the latest ideas, verify before citing.',
    searchUrl: 'https://arxiv.org/search/?query='
  },
  {
    journalId: 'scopus',
    order: 4,
    name: 'Scopus',
    shortCode: 'Sc',
    color: '#007377',
    tierBadge: 'Citation index',
    tierColor: 'emerald',
    description: 'Abstract and citation database to check journal quartiles, CiteScore and author metrics.',
    searchUrl: 'https://www.scopus.com/search/form.uri'
  },
  {
    journalId: 'scholar',
    order: 5,
    name: 'Google Scholar',
    shortCode: 'GS',
    color: '#2563EB',
    tierBadge: 'Aggregator · Mixed',
    tierColor: 'emerald',
    description: 'Broad scholarly search across disciplines with citation tracking and alerts.',
    searchUrl: 'https://scholar.google.com/scholar?q='
  }
];

const seedDatabase = async () => {
  try {
    // 1. Seed Default Admin if none exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const defaultAdmin = new User({
        customId: 'adm-default',
        role: 'admin',
        name: 'Administrator',
        email: 'admin@iiuc.ac.bd',
        password: 'Admin@12345',
        department: 'CSE'
      });
      await defaultAdmin.save();
      console.log('[Seed] Default Admin account initialized: admin@iiuc.ac.bd');
    }

    // 2. Seed Supervisors if empty
    const supervisorCount = await SupervisorProfile.countDocuments();
    if (supervisorCount === 0) {
      await SupervisorProfile.insertMany(initialSupervisors);
      console.log(`[Seed] Initialized ${initialSupervisors.length} faculty supervisor profiles.`);
    }

    // 3. Seed Guidelines if empty
    const guidelineCount = await Guideline.countDocuments();
    if (guidelineCount === 0) {
      await Guideline.insertMany(initialGuidelines);
      console.log(`[Seed] Initialized ${initialGuidelines.length} thesis guidelines.`);
    }

    // 4. Seed Templates if empty
    const templateCount = await Template.countDocuments();
    if (templateCount === 0) {
      await Template.insertMany(initialTemplates);
      console.log(`[Seed] Initialized ${initialTemplates.length} thesis templates.`);
    }

    // 5. Seed Journals if empty
    const journalCount = await Journal.countDocuments();
    if (journalCount === 0) {
      await Journal.insertMany(initialJournals);
      console.log(`[Seed] Initialized ${initialJournals.length} research journal portals.`);
    }
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
};

module.exports = {
  seedDatabase,
  initialSupervisors,
  initialGuidelines,
  initialTemplates,
  initialJournals
};
