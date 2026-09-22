const crypto = require('crypto');

// Einfacher In-Memory-Job-Speicher: ein "Laden"-Klick startet einen Job,
// der Server verarbeitet ihn im Hintergrund, und das Frontend fragt per
// Polling den Fortschritt ab - so gibt es eine echte Live-Anzeige statt
// eines einzigen, potenziell minutenlangen blockierenden Requests.

const jobs = new Map();
const MAX_JOBS = 30;

function createJob() {
  const id = crypto.randomUUID();
  jobs.set(id, {
    id,
    status: 'running', // running | done | error
    processed: 0,
    total: 0,
    result: null,
    error: null,
    createdAt: Date.now()
  });

  if (jobs.size > MAX_JOBS) {
    const oldestKey = jobs.keys().next().value;
    jobs.delete(oldestKey);
  }

  return id;
}

function updateProgress(id, processed, total) {
  const job = jobs.get(id);
  if (!job) return;
  job.processed = processed;
  job.total = total;
}

function completeJob(id, result) {
  const job = jobs.get(id);
  if (!job) return;
  job.status = 'done';
  job.result = result;
}

function failJob(id, message) {
  const job = jobs.get(id);
  if (!job) return;
  job.status = 'error';
  job.error = message;
}

function getJob(id) {
  return jobs.get(id) || null;
}

module.exports = { createJob, updateProgress, completeJob, failJob, getJob };
