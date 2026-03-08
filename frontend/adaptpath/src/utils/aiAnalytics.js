/**
 * AI Analytics Utilities
 * Generates AI-powered feedback and recommendations based on diagnostic test results
 */

/**
 * Generate AI-powered feedback based on test performance
 * @param {Object} diagnosticReport - The diagnostic test report
 * @returns {Promise<Array>} Array of feedback objects
 */
export async function generateAIFeedback(diagnosticReport) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const feedback = [];
  const { sections, total } = diagnosticReport;
  
  if (!sections || !total) {
    return [{
      type: 'info',
      title: 'Complete the test',
      message: 'Take the diagnostic test to receive personalized AI feedback.'
    }];
  }

  // Overall performance feedback
  if (total.accuracy >= 80) {
    feedback.push({
      type: 'strength',
      title: 'Excellent Performance! 🎉',
      message: `You scored ${total.accuracy.toFixed(1)}% overall. You're well-prepared for interviews. Focus on maintaining this level through consistent practice.`
    });
  } else if (total.accuracy >= 60) {
    feedback.push({
      type: 'suggestion',
      title: 'Good Foundation',
      message: `Your ${total.accuracy.toFixed(1)}% score shows solid understanding. With focused practice on weak areas, you can reach interview-ready level within 2-3 weeks.`
    });
  } else if (total.accuracy >= 40) {
    feedback.push({
      type: 'weakness',
      title: 'Improvement Needed',
      message: `At ${total.accuracy.toFixed(1)}%, you need structured learning. Start with fundamentals and build up gradually. Dedicate 2-3 hours daily for best results.`
    });
  } else {
    feedback.push({
      type: 'weakness',
      title: 'Build Strong Foundation',
      message: `Your ${total.accuracy.toFixed(1)}% score indicates you need to start with basics. Don't worry - with the right approach, you can improve significantly in 4-6 weeks.`
    });
  }

  // Section-specific feedback
  const sectionEntries = Object.entries(sections);
  
  // Identify weakest section
  const weakestSection = sectionEntries.reduce((min, [name, data]) => 
    data.accuracy < min.accuracy ? { name, ...data } : min, 
    { accuracy: 100 }
  );
  
  if (weakestSection.accuracy < 60) {
    feedback.push({
      type: 'weakness',
      title: `Focus on ${weakestSection.name}`,
      message: `This is your weakest area at ${weakestSection.accuracy.toFixed(1)}%. Start here for maximum improvement. Practice 5-7 problems daily and review core concepts.`
    });
  }

  // Identify strongest section
  const strongestSection = sectionEntries.reduce((max, [name, data]) => 
    data.accuracy > max.accuracy ? { name, ...data } : max, 
    { accuracy: 0 }
  );
  
  if (strongestSection.accuracy >= 75) {
    feedback.push({
      type: 'strength',
      title: `Strong in ${strongestSection.name}! 💪`,
      message: `You scored ${strongestSection.accuracy.toFixed(1)}% here. This can be your interview strength. Practice advanced problems to master it completely.`
    });
  }

  // Pattern recognition
  const moderateSections = sectionEntries.filter(([_, data]) => 
    data.accuracy >= 60 && data.accuracy < 75
  );
  
  if (moderateSections.length > 0) {
    feedback.push({
      type: 'suggestion',
      title: 'Quick Wins Available',
      message: `You're close to mastery in ${moderateSections.map(([name]) => name).join(', ')}. Just 1-2 weeks of targeted practice can push these to 80%+.`
    });
  }

  // Completion feedback
  const completionRate = (total.attempted / total.total) * 100;
  if (completionRate < 80) {
    feedback.push({
      type: 'suggestion',
      title: 'Complete All Questions',
      message: `You attempted ${completionRate.toFixed(0)}% of questions. Completing all questions gives you better insights and more accurate recommendations.`
    });
  }

  // Learning style suggestion
  const hasMultipleWeakSections = sectionEntries.filter(([_, data]) => data.accuracy < 60).length >= 3;
  if (hasMultipleWeakSections) {
    feedback.push({
      type: 'suggestion',
      title: 'Systematic Approach Recommended',
      message: 'With multiple weak areas, focus on one topic at a time. Master it before moving to the next. This prevents confusion and builds confidence.'
    });
  }

  return feedback;
}

/**
 * Get personalized study time recommendation
 * @param {Object} diagnosticReport - The diagnostic test report
 * @returns {string} Study recommendation text (ALWAYS returns a string, never an object)
 */
export function getStudyTimeRecommendation(diagnosticReport) {
  // CRITICAL: This function MUST return a string for React rendering
  // If you see an error about objects not being valid React children, check this function
  
  if (!diagnosticReport) {
    return 'Complete the diagnostic test to receive personalized study recommendations.';
  }

  const { total, sections } = diagnosticReport;
  
  if (!total || !sections) {
    return 'Complete the diagnostic test to receive personalized study recommendations.';
  }

  const weakSections = Object.entries(sections).filter(([_, data]) => data.accuracy < 60);
  const accuracy = total.accuracy || 0;

  let dailyHours = '2-3 hours';
  let timeline = '4-6 weeks';
  let focus = 'building fundamentals';

  // Determine study plan based on accuracy
  if (accuracy >= 80) {
    dailyHours = '1-2 hours';
    timeline = '2-3 weeks';
    focus = 'advanced problems and mock interviews';
  } else if (accuracy >= 60) {
    dailyHours = '2-3 hours';
    timeline = '4-6 weeks';
    focus = 'weak areas and consistent practice';
  } else if (accuracy >= 40) {
    dailyHours = '3-4 hours';
    timeline = '8-10 weeks';
    focus = 'fundamentals and building strong foundation';
  } else {
    dailyHours = '4-5 hours';
    timeline = '12-16 weeks';
    focus = 'core concepts from scratch';
  }

  // Build recommendation string - MUST be a string, not an object
  let recommendation = `Based on your ${accuracy.toFixed(1)}% score, dedicate ${dailyHours} daily for ${timeline}. `;
  
  if (weakSections.length > 0) {
    const topWeakSection = weakSections[0];
    recommendation += `Start with ${topWeakSection[0]} (${topWeakSection[1].accuracy.toFixed(1)}% accuracy). `;
  }
  
  recommendation += `Focus on ${focus}. `;
  
  // Add specific advice based on performance
  if (accuracy < 60) {
    recommendation += 'Begin with video tutorials and basic problems before attempting harder questions. ';
  }
  
  recommendation += 'Consistency is key - study daily rather than cramming.';

  // ENSURE we're returning a string
  return String(recommendation);
}

/**
 * Analyze learning patterns from test performance
 * @param {Object} diagnosticReport - The diagnostic test report
 * @returns {Object} Learning pattern analysis
 */
export function analyzeLearningPatterns(diagnosticReport) {
  const { sections } = diagnosticReport;
  
  if (!sections) return null;

  const sectionEntries = Object.entries(sections);
  
  return {
    strongestArea: sectionEntries.reduce((max, [name, data]) => 
      data.accuracy > max.accuracy ? { name, accuracy: data.accuracy } : max,
      { name: '', accuracy: 0 }
    ),
    weakestArea: sectionEntries.reduce((min, [name, data]) => 
      data.accuracy < min.accuracy ? { name, accuracy: data.accuracy } : min,
      { name: '', accuracy: 100 }
    ),
    consistencyScore: calculateConsistency(sectionEntries),
    recommendedStartPoint: sectionEntries
      .filter(([_, data]) => data.accuracy < 60)
      .sort((a, b) => a[1].accuracy - b[1].accuracy)[0]?.[0] || 'Advanced Practice'
  };
}

/**
 * Calculate consistency score across sections
 * @param {Array} sectionEntries - Array of [name, data] tuples
 * @returns {number} Consistency score (0-100)
 */
function calculateConsistency(sectionEntries) {
  if (sectionEntries.length < 2) return 100;
  
  const accuracies = sectionEntries.map(([_, data]) => data.accuracy);
  const mean = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
  const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - mean, 2), 0) / accuracies.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  // Convert to 0-100 scale (20+ std dev = 0, 0 std dev = 100)
  const consistencyScore = Math.max(0, 100 - (standardDeviation * 5));
  
  return Math.round(consistencyScore);
}

/**
 * Generate study schedule based on available time
 * @param {Object} diagnosticReport - The diagnostic test report
 * @param {number} hoursPerDay - Hours available per day
 * @returns {Object} Weekly study schedule
 */
export function generateStudySchedule(diagnosticReport, hoursPerDay = 2) {
  const { sections } = diagnosticReport;
  
  if (!sections) return null;

  const weakSections = Object.entries(sections)
    .filter(([_, data]) => data.accuracy < 70)
    .sort((a, b) => a[1].accuracy - b[1].accuracy);

  const schedule = {
    dailyHours: hoursPerDay,
    weeklyPlan: []
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach((day, index) => {
    const sectionIndex = index % weakSections.length;
    const [sectionName, sectionData] = weakSections[sectionIndex] || ['Review', { accuracy: 0 }];
    
    schedule.weeklyPlan.push({
      day,
      focus: sectionName,
      tasks: [
        `Review ${sectionName} concepts (${Math.round(hoursPerDay * 0.3 * 60)} min)`,
        `Practice problems (${Math.round(hoursPerDay * 0.5 * 60)} min)`,
        `Take mini-quiz (${Math.round(hoursPerDay * 0.2 * 60)} min)`
      ],
      targetAccuracy: Math.min(sectionData.accuracy + 10, 90)
    });
  });

  return schedule;
}

export default {
  generateAIFeedback,
  getStudyTimeRecommendation,
  analyzeLearningPatterns,
  generateStudySchedule
};