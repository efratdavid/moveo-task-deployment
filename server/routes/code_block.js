const express = require('express');
const router = express.Router();
const code_block_model = require('../models/code_block');

// A route to fetch all code blocks
router.get('/codeblocks', async (req, res) => {
  try {
    const codeBlocks = await code_block_model.find();
    res.json(codeBlocks);
  } catch (err) {
    console.error('Error fetching code blocks:', err);
    res.status(500).json({ error: 'Error fetching code blocks' });
  }
});

// A route to fetch a single code block by ID
router.get('/codeblocks/:id', async (req, res) => {
  try {
    const codeBlock = await code_block_model.findById(req.params.id);
    if (!codeBlock) {
      return res.status(404).json({ error: 'Code block not found' });
    }
    res.json(codeBlock);
  } catch (err) {
    console.error('Error fetching code block by ID:', err);
    res.status(500).json({ error: 'Error fetching code block' });
  }
});

module.exports = router;
