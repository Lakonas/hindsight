const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:incidentId/factors', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contributing_factors WHERE incident_id = $1 ORDER BY created_at ASC',
      [req.params.incidentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contributing factors' });
  }
});

router.post('/:incidentId/factors', requireAuth, async (req, res) => {
  const { category, description } = req.body;

  if (!category || !description) {
    return res.status(400).json({ error: 'category and description are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contributing_factors (incident_id, category, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.incidentId, category, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create contributing factor' });
  }
});

router.delete('/:incidentId/factors/:factorId', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM contributing_factors WHERE id = $1 AND incident_id = $2 RETURNING id',
      [req.params.factorId, req.params.incidentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Factor not found' });
    }
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete contributing factor' });
  }
});

module.exports = router;