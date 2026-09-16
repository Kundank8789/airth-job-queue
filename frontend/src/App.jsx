import { useEffect, useState } from 'react';
import {
  createJob,
  deleteJob,
  getJobs,
  updateJobStatus,
} from './services/api';
import './App.css';

const STATUSES = ['all', 'pending', 'running', 'completed', 'failed'];

function App() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');

  const [title, setTitle] = useState('');
  const [type, setType] = useState('');

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState(null);
  const [deletingJobId, setDeletingJobId] = useState(null);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    try {
      setError('');
      setLoading(true);

      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateJob = async (event) => {
    event.preventDefault();

    if (!title.trim() || !type.trim()) {
      setError('Title and type are required.');
      return;
    }

    try {
      setError('');
      setCreating(true);

      const newJob = await createJob({
        title: title.trim(),
        type: type.trim(),
      });

      setJobs((currentJobs) => [newJob, ...currentJobs]);

      setTitle('');
      setType('');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 'Failed to create job.',
      );
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setError('');
      setUpdatingJobId(id);

      const updatedJob = await updateJobStatus(id, status);

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === id ? updatedJob : job,
        ),
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          'Failed to update job status.',
      );

      await loadJobs();
    } finally {
      setUpdatingJobId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      setDeletingJobId(id);

      await deleteJob(id);

      setJobs((currentJobs) =>
        currentJobs.filter((job) => job.id !== id),
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          'Failed to delete job.',
      );
    } finally {
      setDeletingJobId(null);
    }
  };

  const filteredJobs =
    filter === 'all'
      ? jobs
      : jobs.filter((job) => job.status === filter);

  const getCount = (status) => {
    if (status === 'all') {
      return jobs.length;
    }

    return jobs.filter((job) => job.status === status).length;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Job Queue Dashboard</h1>
        <p>Manage and monitor your jobs</p>
      </header>

      {error && (
        <div className="error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <section className="counts">
        {STATUSES.map((status) => (
          <button
            key={status}
            className={`count-card ${
              filter === status ? 'active' : ''
            }`}
            onClick={() => setFilter(status)}
          >
            <span className="count">
              {getCount(status)}
            </span>

            <span className="count-label">
              {status}
            </span>
          </button>
        ))}
      </section>

      <section className="create-section">
        <h2>Create New Job</h2>

        <form onSubmit={handleCreateJob} className="job-form">
          <input
            type="text"
            placeholder="Job title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
          />

          <input
            type="text"
            placeholder="Job type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            maxLength={100}
          />

          <button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Job'}
          </button>
        </form>
      </section>

      <section className="jobs-section">
        <div className="jobs-header">
          <h2>Jobs</h2>

          <div className="jobs-controls">
            <button
              className="refresh-button"
              onClick={loadJobs}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All jobs' : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="message">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="message">
            No jobs found.
          </div>
        ) : (
          <div className="job-list">
            {filteredJobs.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-info">
                  <h3>{job.title}</h3>

                  <div className="job-meta">
                    <span>{job.type}</span>

                    <span
                      className={`status status-${job.status}`}
                    >
                      {job.status}
                    </span>

                    <span>
                      {new Date(
                        job.createdAt,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="job-actions">
                  {job.status === 'pending' && (
                    <>
                      <button
                        disabled={updatingJobId === job.id}
                        onClick={() =>
                          handleStatusChange(
                            job.id,
                            'running',
                          )
                        }
                      >
                        {updatingJobId === job.id
                          ? 'Updating...'
                          : 'Run'}
                      </button>

                      <button
                        disabled={updatingJobId === job.id}
                        onClick={() =>
                          handleStatusChange(
                            job.id,
                            'failed',
                          )
                        }
                      >
                        {updatingJobId === job.id
                          ? 'Updating...'
                          : 'Fail'}
                      </button>
                    </>
                  )}

                  {job.status === 'running' && (
                    <>
                      <button
                        disabled={updatingJobId === job.id}
                        onClick={() =>
                          handleStatusChange(
                            job.id,
                            'completed',
                          )
                        }
                      >
                        {updatingJobId === job.id
                          ? 'Updating...'
                          : 'Complete'}
                      </button>

                      <button
                        disabled={updatingJobId === job.id}
                        onClick={() =>
                          handleStatusChange(
                            job.id,
                            'failed',
                          )
                        }
                      >
                        {updatingJobId === job.id
                          ? 'Updating...'
                          : 'Fail'}
                      </button>
                    </>
                  )}

                  <button
                    className="delete-button"
                    disabled={deletingJobId === job.id}
                    onClick={() => handleDelete(job.id)}
                  >
                    {deletingJobId === job.id
                      ? 'Deleting...'
                      : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;