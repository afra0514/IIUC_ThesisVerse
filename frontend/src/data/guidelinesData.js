export const guidelinesData = [
  {
    id: 'topic-selection',
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
    id: 'writing-manual',
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
    id: 'defense-rubrics',
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
    id: 'profile-setup',
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
]
