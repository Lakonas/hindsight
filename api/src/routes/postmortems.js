const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.get('/:incidentId', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM postmortems WHERE incident_id = $1',
      [req.params.incidentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No postmortem found for this incident' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch postmortem' });
  }
});

router.post('/:incidentId/generate', requireAuth, async (req, res) => {
  const { incidentId } = req.params;

  try {
    const incidentResult = await pool.query(
      'SELECT * FROM incidents WHERE id = $1',
      [incidentId]
    );
    if (incidentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    const incident = incidentResult.rows[0];

    const timelineResult = await pool.query(
      'SELECT * FROM timeline_events WHERE incident_id = $1 ORDER BY occurred_at ASC',
      [incidentId]
    );

    const factorsResult = await pool.query(
      'SELECT * FROM contributing_factors WHERE incident_id = $1',
      [incidentId]
    );

    const actionsResult = await pool.query(
      'SELECT * FROM action_items WHERE incident_id = $1',
      [incidentId]
    );

    const timeline = timelineResult.rows;
    const factors = factorsResult.rows;
    const actions = actionsResult.rows;

    const prompt = `You are a senior site reliability engineer writing a formal incident postmortem. Write a clear, professional postmortem document based on the following incident data. Be specific and direct. Do not use filler phrases or corporate language.

INCIDENT
Title: ${incident.title}
Severity: ${incident.severity}
Status: ${incident.status}
Summary: ${incident.summary || 'No summary provided'}
Started: ${incident.started_at}
Detected: ${incident.detected_at || 'Unknown'}
Resolved: ${incident.resolved_at || 'Ongoing'}

TIMELINE
${timeline.length > 0 ? timeline.map(e => `${e.occurred_at} [${e.event_type}] ${e.description}`).join('\n') : 'No timeline events recorded'}

CONTRIBUTING FACTORS
${factors.length > 0 ? factors.map(f => `[${f.category}] ${f.description}`).join('\n') : 'No contributing factors recorded'}

ACTION ITEMS
${actions.length > 0 ? actions.map(a => `[${a.status}] ${a.title} — owner: ${a.owner || 'unassigned'}`).join('\n') : 'No action items recorded'}

Write the postmortem with these sections: Impact, Timeline, Root Cause, What Went Well, What Went Wrong, Action Items. Use plain prose, no bullet points except in Action Items.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0].text;

    const existing = await pool.query(
      'SELECT id FROM postmortems WHERE incident_id = $1',
      [incidentId]
    );

    let postmortem;
    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE postmortems SET content = $1, generated_at = NOW()
         WHERE incident_id = $2 RETURNING *`,
        [content, incidentId]
      );
      postmortem = result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO postmortems (incident_id, content)
         VALUES ($1, $2) RETURNING *`,
        [incidentId, content]
      );
      postmortem = result.rows[0];
    }

    res.status(201).json(postmortem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate postmortem' });
  }
});

router.patch('/:incidentId', requireAuth, async (req, res) => {
  const { reviewed_by, published_at } = req.body;

  try {
    const result = await pool.query(
      `UPDATE postmortems
       SET reviewed_by = COALESCE($1, reviewed_by),
           published_at = COALESCE($2, published_at)
       WHERE incident_id = $3
       RETURNING *`,
      [reviewed_by, published_at, req.params.incidentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Postmortem not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update postmortem' });
  }
});

module.exports = router;