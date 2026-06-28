const express = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.display_name as created_by_name
       FROM incidents i
       JOIN users u ON i.created_by = u.id
       ORDER BY i.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.display_name as created_by_name
       FROM incidents i
       JOIN users u ON i.created_by = u.id
       WHERE i.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { title, severity, summary, started_at, detected_at, resolved_at } = req.body;

  if (!title || !severity || !started_at) {
    return res.status(400).json({ error: 'title, severity, and started_at are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO incidents (title, severity, summary, started_at, detected_at, resolved_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, severity, summary, started_at, detected_at, resolved_at, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  const { title, severity, status, summary, started_at, detected_at, resolved_at } = req.body;

  try {
    const result = await pool.query(
      `UPDATE incidents
       SET title = COALESCE($1, title),
           severity = COALESCE($2, severity),
           status = COALESCE($3, status),
           summary = COALESCE($4, summary),
           started_at = COALESCE($5, started_at),
           detected_at = COALESCE($6, detected_at),
           resolved_at = COALESCE($7, resolved_at)
       WHERE id = $8
       RETURNING *`,
      [title, severity, status, summary, started_at, detected_at, resolved_at, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM incidents WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete incident' });
  }
});

module.exports = router;