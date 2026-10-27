const Guideline = require('../models/Guideline');
const Template = require('../models/Template');
const Journal = require('../models/Journal');
const {
  initialGuidelines,
  initialTemplates,
  initialJournals
} = require('../config/seed');

const makeId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const getModel = (kind) => {
  switch (kind) {
    case 'guidelines':
      return { Model: Guideline, idKey: 'guidelineId', defaults: initialGuidelines };
    case 'templates':
      return { Model: Template, idKey: 'templateId', defaults: initialTemplates };
    case 'journals':
      return { Model: Journal, idKey: 'journalId', defaults: initialJournals };
    default:
      return null;
  }
};

// @desc    Get dynamic content by kind
// @route   GET /api/content/:kind
// @access  Public
exports.getContent = async (req, res) => {
  try {
    const config = getModel(req.params.kind);
    if (!config) {
      return res.status(400).json({ ok: false, error: 'Invalid content type' });
    }

    let items = await config.Model.find({}).sort({ order: 1, createdAt: 1 });
    // If empty for any reason, seed defaults
    if (items.length === 0 && config.defaults) {
      await config.Model.insertMany(config.defaults);
      items = await config.Model.find({}).sort({ order: 1, createdAt: 1 });
    }

    res.json({ ok: true, items: items.map((i) => i.toJSON()) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Create or update content item
// @route   POST /api/content/:kind
// @access  Private (Admin)
exports.saveItem = async (req, res) => {
  try {
    const { kind } = req.params;
    const config = getModel(kind);
    if (!config) {
      return res.status(400).json({ ok: false, error: 'Invalid content type' });
    }

    const itemData = req.body;
    const id = itemData.id || itemData[config.idKey];

    let item;
    if (id) {
      item = await config.Model.findOne({ [config.idKey]: id });
    }

    if (item) {
      // Update
      Object.assign(item, itemData);
      item[config.idKey] = id;
      await item.save();
    } else {
      // Create new
      const count = await config.Model.countDocuments();
      const newId = id || makeId(kind.slice(0, 3));
      const payload = {
        ...itemData,
        [config.idKey]: newId,
        order: itemData.order ?? count
      };
      item = new config.Model(payload);
      await item.save();
    }

    res.json({ ok: true, item: item.toJSON() });
  } catch (err) {
    console.error('Save item error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Delete content item
// @route   DELETE /api/content/:kind/:id
// @access  Private (Admin)
exports.deleteItem = async (req, res) => {
  try {
    const { kind, id } = req.params;
    const config = getModel(kind);
    if (!config) {
      return res.status(400).json({ ok: false, error: 'Invalid content type' });
    }

    await config.Model.deleteOne({ [config.idKey]: id });
    res.json({ ok: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Move item up or down
// @route   POST /api/content/:kind/move
// @access  Private (Admin)
exports.moveItem = async (req, res) => {
  try {
    const { kind } = req.params;
    const { id, direction } = req.body;
    const config = getModel(kind);
    if (!config) {
      return res.status(400).json({ ok: false, error: 'Invalid content type' });
    }

    const items = await config.Model.find({}).sort({ order: 1, createdAt: 1 });
    const idx = items.findIndex((x) => x[config.idKey] === id);
    const targetIdx = idx + (direction === 'up' ? -1 : 1);

    if (idx < 0 || targetIdx < 0 || targetIdx >= items.length) {
      return res.status(400).json({ ok: false, error: 'Cannot move item further' });
    }

    // Swap order values
    const currentOrder = items[idx].order ?? idx;
    const targetOrder = items[targetIdx].order ?? targetIdx;

    items[idx].order = targetOrder;
    items[targetIdx].order = currentOrder;

    await items[idx].save();
    await items[targetIdx].save();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

// @desc    Reset collection to initial defaults
// @route   POST /api/content/:kind/reset
// @access  Private (Admin)
exports.resetDefaults = async (req, res) => {
  try {
    const { kind } = req.params;
    const config = getModel(kind);
    if (!config) {
      return res.status(400).json({ ok: false, error: 'Invalid content type' });
    }

    await config.Model.deleteMany({});
    await config.Model.insertMany(config.defaults);

    res.json({ ok: true, message: `Reset ${kind} to defaults` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};
