/**
 * AdaptPath Frontend API Client
 * Handles all backend API communication
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Generic API request handler with error handling
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Request Failed (${endpoint}):`, error);
    throw error;
  }
}

// ==================== DIAGNOSTIC TEST APIs ====================

/**
 * Analyze diagnostic test results
 * @param {Object} questions - Array of question objects
 * @param {Object} answers - User answers object
 */
export async function analyzeDiagnostic(questions, answers) {
  return apiRequest("/diagnostic/analyze", {
    method: "POST",
    body: JSON.stringify({ questions, answers }),
  });
}

// ==================== AI TUTOR APIs ====================

/**
 * Ask the AI tutor a question
 * @param {string} question - User's question
 * @param {Array} weakAreas - List of weak topics
 * @param {string} context - Additional context (optional)
 */
export async function askTutor(question, weakAreas = [], context = null) {
  return apiRequest("/tutor/explain", {
    method: "POST",
    body: JSON.stringify({
      question,
      weak_areas: weakAreas,
      context,
    }),
  });
}

/**
 * Get a hint for a question without revealing the answer
 * @param {string} question - The question text
 */
export async function getHint(question) {
  return apiRequest("/tutor/hint", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}

// ==================== ML PREDICTION APIs ====================

/**
 * Predict student performance on next question
 * @param {Object} payload - Feature vector for prediction
 */
export async function predict(payload) {
  return apiRequest("/model/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ==================== ANALYTICS APIs ====================

/**
 * Get platform analytics overview
 */
export async function getAnalyticsOverview() {
  return apiRequest("/analytics/overview", {
    method: "GET",
  });
}

/**
 * Track user activity
 * @param {Object} activityData - Activity data to track
 */
export async function trackActivity(activityData) {
  return apiRequest("/analytics/track", {
    method: "POST",
    body: JSON.stringify(activityData),
  });
}

// ==================== USER MANAGEMENT APIs ====================

/**
 * Register a new user
 * @param {Object} userData - User registration data
 */
export async function registerUser(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Login user
 * @param {Object} credentials - Login credentials
 */
export async function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

// ==================== HEALTH CHECK ====================

/**
 * Check API health status
 */
export async function checkHealth() {
  return apiRequest("/health", {
    method: "GET",
  });
}

// ==================== EXPORT ALL ====================

export default {
  analyzeDiagnostic,
  askTutor,
  getHint,
  predict,
  getAnalyticsOverview,
  trackActivity,
  registerUser,
  loginUser,
  checkHealth,
};