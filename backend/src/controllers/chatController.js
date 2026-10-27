const SupervisorProfile = require('../models/SupervisorProfile');
const Journal = require('../models/Journal');
const Template = require('../models/Template');

// @desc    Dynamic AI thesis assistant chatbot query
// @route   POST /api/chat
// @access  Public
exports.handleChat = async (req, res) => {
  try {
    const { text = '' } = req.body;
    const clean = text.trim();
    if (!clean) {
      return res.status(400).json({ ok: false, error: 'Query text is required' });
    }

    const lower = clean.toLowerCase();
    let responseObj = {
      id: Date.now(),
      sender: 'bot',
      text: 'You can explore our verified supervisor directory, browse defense evaluation rubrics, or download official thesis templates directly from the portal.'
    };

    // 1. Search supervisors in MongoDB
    const supervisors = await SupervisorProfile.find({});
    const matchingSup = supervisors.find((s) => {
      const matchName = s.name.toLowerCase().includes(lower);
      const matchBio = (s.bio || '').toLowerCase().includes(lower);
      const matchTags = (s.tags || []).some((t) => lower.includes(t.toLowerCase()) || t.toLowerCase().includes(lower));
      return matchName || matchBio || matchTags;
    });

    if (matchingSup) {
      responseObj = {
        id: Date.now(),
        sender: 'bot',
        text: `${matchingSup.name} (${matchingSup.designation}, ${matchingSup.department}) specializes in ${(matchingSup.tags || []).slice(0, 3).join(', ')}.`,
        recommendation: {
          name: matchingSup.name,
          designation: `${matchingSup.designation}, ${matchingSup.department}`,
          papers: `${matchingSup.papers} Research Papers`,
          link: '#supervisors'
        }
      };
      return res.json({ ok: true, response: responseObj });
    }

    // 2. Journal search
    if (lower.includes('ieee') || lower.includes('paper') || lower.includes('journal') || lower.includes('scopus')) {
      const journal = await Journal.findOne({ $or: [{ shortCode: /ieee/i }, { name: /ieee/i }] });
      responseObj = {
        id: Date.now(),
        sender: 'bot',
        text: 'You can explore peer-reviewed literature across IEEE Xplore, ScienceDirect, and Scopus using direct search portals.',
        journalLink: {
          title: journal ? journal.name : 'IEEE Xplore Digital Library',
          url: journal && journal.searchUrl ? journal.searchUrl : 'https://ieeexplore.ieee.org'
        }
      };
      return res.json({ ok: true, response: responseObj });
    }

    // 3. Template / Overleaf / LaTeX
    if (lower.includes('latex') || lower.includes('overleaf') || lower.includes('template') || lower.includes('word') || lower.includes('slides')) {
      const template = await Template.findOne({ hasOverleafLink: true }) || await Template.findOne({});
      responseObj = {
        id: Date.now(),
        sender: 'bot',
        text: 'Official IIUC-formatted LaTeX packages, Word reports, and defense slide templates are available in the Download Templates section.',
        journalLink: {
          title: template ? template.title : 'Download Templates Center',
          url: '#templates'
        }
      };
      return res.json({ ok: true, response: responseObj });
    }

    // 4. Guidelines / Defense
    if (lower.includes('defense') || lower.includes('rubric') || lower.includes('format') || lower.includes('proposal')) {
      responseObj = {
        id: Date.now(),
        sender: 'bot',
        text: 'IIUC operates a 3-Stage defense evaluation: Proposal Defense (30%), Pre-Defense (20%), and Final Defense (50%). Check the Thesis Guidelines section for full criteria.',
        journalLink: {
          title: '3-Stage Defense Rubrics',
          url: '#guidelines'
        }
      };
      return res.json({ ok: true, response: responseObj });
    }

    res.json({ ok: true, response: responseObj });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
