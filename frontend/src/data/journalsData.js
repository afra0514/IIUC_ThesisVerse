export const journalsData = [
  {
    id: 'ieee',
    name: 'IEEE Xplore',
    shortCode: 'IEEE',
    color: '#00629B',
    tierBadge: 'Scopus · Q1–Q2',
    tierColor: 'emerald',
    description: 'Premier library for electrical engineering, computer science and electronics conference and journal papers.',
    searchUrl: 'https://ieeexplore.ieee.org/search/searchresult.jsp?newsearch=true&queryText='
  },
  {
    id: 'sciencedirect',
    name: 'ScienceDirect',
    shortCode: 'SD',
    color: '#FF6C00',
    tierBadge: 'Scopus · Q1–Q3',
    tierColor: 'emerald',
    description: "Elsevier's full-text database covering engineering, applied sciences and medicine.",
    searchUrl: 'https://www.sciencedirect.com/search?qs='
  },
  {
    id: 'springer',
    name: 'SpringerLink',
    shortCode: 'SL',
    color: '#D97706',
    tierBadge: 'Scopus · Q1–Q4',
    tierColor: 'emerald',
    description: 'Journals, books and Lecture Notes in Computer Science (LNCS) proceedings.',
    searchUrl: 'https://link.springer.com/search?query='
  },
  {
    id: 'arxiv',
    name: 'arXiv',
    shortCode: 'arX',
    color: '#B91C1C',
    tierBadge: 'Preprint · Not peer-reviewed',
    tierColor: 'slate',
    description: 'Open-access preprints in CS, maths and physics — great for the latest ideas, verify before citing.',
    searchUrl: 'https://arxiv.org/search/?query='
  },
  {
    id: 'scopus',
    name: 'Scopus',
    shortCode: 'Sc',
    color: '#007377',
    tierBadge: 'Citation index',
    tierColor: 'emerald',
    description: 'Abstract and citation database to check journal quartiles, CiteScore and author metrics.',
    searchUrl: 'https://www.scopus.com/search/form.uri'
  },
  {
    id: 'scholar',
    name: 'Google Scholar',
    shortCode: 'GS',
    color: '#2563EB',
    tierBadge: 'Aggregator · Mixed',
    tierColor: 'emerald',
    description: 'Broad scholarly search across disciplines with citation tracking and alerts.',
    searchUrl: 'https://scholar.google.com/scholar?q='
  }
];

export const predatoryJournalTipsData = {
  title: 'How to find high-impact papers & avoid predatory journals',
  columnOne: [
    'Verify the journal quartile on Scopus or SCImago before submitting.',
    'Check that the publisher is a COPE member and lists real editors.'
  ],
  columnTwo: [
    "Beware of 'guaranteed acceptance' or review times under 7 days.",
    'Sort by citations and filter to the last 3–5 years for recent work.'
  ]
};