export function generateAdaptivePath(questions, answers) {
  const stats = {};

  questions.forEach((q, index) => {
    if (!stats[q.topic]) {
      stats[q.topic] = { correct: 0, total: 0 };
    }

    stats[q.topic].total += 1;
    if (answers[index] === q.answer) {
      stats[q.topic].correct += 1;
    }
  });

  const weak = [];
  const medium = [];
  const strong = [];

  Object.entries(stats).forEach(([topic, s]) => {
    const accuracy = (s.correct / s.total) * 100;
    if (accuracy < 40) weak.push(topic);
    else if (accuracy < 70) medium.push(topic);
    else strong.push(topic);
  });

  return { weak, medium, strong };
}
