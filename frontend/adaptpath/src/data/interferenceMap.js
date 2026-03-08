export function generateStudyPlan(sectionAnalysis) {
  const plan = [];

  Object.entries(sectionAnalysis).forEach(([topic, data]) => {
    if (data.accuracy < 50) {
      plan.push({
        topic,
        priority: "HIGH",
        action: "Relearn + Practice"
      });
    } else if (data.accuracy < 70) {
      plan.push({
        topic,
        priority: "MEDIUM",
        action: "Revise"
      });
    }
  });

  return plan;
}
