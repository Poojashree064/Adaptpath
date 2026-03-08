import React from "react";

export default function QuestionCard({ question, onSubmit }) {
  // question: { topic, subtopic, difficulty, id }
  const [timeTaken, setTimeTaken] = React.useState(30);
  const [hints, setHints] = React.useState(0);

  return (
    <div className="card">
      <h3>{question.topic} — {question.subtopic}</h3>
      <p className="small">Difficulty: {question.difficulty}</p>

      <div style={{ marginTop: 12 }}>
        <label className="small">Time taken (sec)</label><br />
        <input type="number" value={timeTaken} onChange={(e)=>setTimeTaken(Number(e.target.value))} />
      </div>

      <div style={{ marginTop: 8 }}>
        <label className="small">Hints used</label><br />
        <input type="number" value={hints} onChange={(e)=>setHints(Number(e.target.value))} />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => onSubmit({ timeTaken, hints })}>Submit</button>
      </div>
    </div>
  );
}
