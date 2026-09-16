import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const getJobs = async () => {
  const response = await api.get('/jobs');
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const updateJobStatus = async (id, status) => {
  const response = await api.patch(`/jobs/${id}/status`, {
    status,
  });
  return response.data;
};

export const deleteJob = async (id) => {
  await api.delete(`/jobs/${id}`);
};

export default api;