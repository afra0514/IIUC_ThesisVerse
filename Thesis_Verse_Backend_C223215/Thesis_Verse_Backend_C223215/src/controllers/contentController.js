const Guideline = require('../models/Guideline');
const Template = require('../models/Template');
const Journal = require('../models/Journal');

const makeId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const getModel = (kind) => {
  switch (kind) {
    case 'guidelines':
      return { Model: Guideline, idKey: 'guidelineId' };
    case 'templates':
      return { Model: Template, idKey: 'templateId' };
    case 'journals':
      return { Model: Journal, idKey: 'journalId' };
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
      return res.status(400).json({
        ok: false,
        error: 'Invalid content type'
      });
    }

    const items = await config.Model.find({})
      .sort({ order: 1, createdAt: 1 });

    res.json({
      ok: true,
      items: items.map((item) => item.toJSON())
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
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
      return res.status(400).json({
        ok: false,
        error: 'Invalid content type'
      });
    }

    const itemData = req.body;
    const id = itemData.id || itemData[config.idKey];

    let item;

    if (id) {
      item = await config.Model.findOne({
        [config.idKey]: id
      });
    }

    if (item) {
      Object.assign(item, itemData);
      item[config.idKey] = id;
      await item.save();
    } else {
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

    res.json({
      ok: true,
      item: item.toJSON()
    });
  } catch (err) {
    console.error('Save item error:', err);

    res.status(500).json({
      ok: false,
      error: err.message
    });
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
      return res.status(400).json({
        ok: false,
        error: 'Invalid content type'
      });
    }

    const result = await config.Model.deleteOne({
      [config.idKey]: id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Item not found'
      });
    }

    res.json({
      ok: true,
      message: 'Item deleted'
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
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
      return res.status(400).json({
        ok: false,
        error: 'Invalid content type'
      });
    }

    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({
        ok: false,
        error: 'Direction must be up or down'
      });
    }

    const items = await config.Model.find({})
      .sort({ order: 1, createdAt: 1 });

    const idx = items.findIndex(
      (item) => item[config.idKey] === id
    );

    if (idx === -1) {
      return res.status(404).json({
        ok: false,
        error: 'Item not found'
      });
    }

    const targetIdx = idx + (direction === 'up' ? -1 : 1);

    if (targetIdx < 0 || targetIdx >= items.length) {
      return res.status(400).json({
        ok: false,
        error: 'Cannot move item further'
      });
    }

    const currentOrder = items[idx].order ?? idx;
    const targetOrder = items[targetIdx].order ?? targetIdx;

    items[idx].order = targetOrder;
    items[targetIdx].order = currentOrder;

    await items[idx].save();
    await items[targetIdx].save();

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
};

// @desc    Reset collection (disabled because seed data is removed)
// @route   POST /api/content/:kind/reset
// @access  Private (Admin)
exports.resetDefaults = async (req, res) => {
  return res.status(501).json({
    ok: false,
    error: 'Reset to defaults is unavailable because seed data has been removed.'
  });
};
