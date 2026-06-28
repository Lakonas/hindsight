const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/:incidentId/actions', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM action_items WHERE incident_id = $1 ORDER BY created_at ASC',
      [req.params.incidentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch action items' });
  }
});

router.post('/:incidentId/actions', requireAuth, async (req, res) => {
  const { title, description, owner, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO action_items (incident_id, title, description, owner, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.params.incidentId, title, description, owner, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create action item' });
  }
});

router.patch('/:incidentId/actions/:actionId', requireAuth, async (req, res) => {
  const { title, description, owner, due_date, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE action_items
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           owner = COALESCE($3, owner),
           due_date = COALESCE($4, due_date),
           status = COALESCE($5, status)
       WHERE id = $6 AND incident_id = $7
       RETURNING *`,
      [title, description, owner, due_date, status, req.params.actionId, req.params.incidentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update action item' });
  }
});

router.delete('/:incidentId/actions/:actionId', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM action_items WHERE id = $1 AND incident_id = $2 RETURNING id',
      [req.params.actionId, req.params.incidentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Action item not found' });
    }
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete action item' });
  }
});

module.exports = router;