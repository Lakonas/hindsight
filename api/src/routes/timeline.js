const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:incidentId/timeline', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.display_name as created_by_name
       FROM timeline_events t
       JOIN users u ON t.created_by = u.id
       WHERE t.incident_id = $1
       ORDER BY t.occurred_at ASC`,
      [req.params.incidentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

router.post('/:incidentId/timeline', requireAuth, async (req, res) => {
  const { occurred_at, description, event_type } = req.body;

  if (!occurred_at || !description || !event_type) {
    return res.status(400).json({ error: 'occurred_at, description, and event_type are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO timeline_events (incident_id, occurred_at, description, event_type, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.params.incidentId, occurred_at, description, event_type, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create timeline event' });
  }
});

router.delete('/:incidentId/timeline/:eventId', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM timeline_events WHERE id = $1 AND incident_id = $2 RETURNING id',
      [req.params.eventId, req.params.incidentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete timeline event' });
  }
});

module.exports = router;