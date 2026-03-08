export function analyzeTest(questions, answers) {
  const report = {
    total: {
      correct: 0,
      attempted: 0,
      accuracy: 0
    },
    sections: {}
  };

  questions.forEach(q => {
    const section = q.section;
    if (!report.sections[section]) {
      report.sections[section] = {
        correct: 0,
        total: 0,
        accuracy: 0
      };
    }

    report.sections[section].total++;

    if (answers[q.id] !== undefined) {
      report.total.attempted++;

      if (answers[q.id] === q.answer) {
        report.total.correct++;
        report.sections[section].correct++;
      }
    }
  });

  report.total.accuracy =
    (report.total.correct / questions.length) * 100;

  Object.keys(report.sections).forEach(sec => {
    const s = report.sections[sec];
    s.accuracy = (s.correct / s.total) * 100;
  });

  return report;
}
