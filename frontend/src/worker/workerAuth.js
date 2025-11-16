// src/worker/workerAuth.js
export const setWorker = (workerObj) => {
  localStorage.setItem("worker", JSON.stringify(workerObj));
};

export const getWorker = () => {
  const raw = localStorage.getItem("worker");
  return raw ? JSON.parse(raw) : null;
};

export const clearWorker = () => {
  localStorage.removeItem("worker");
};