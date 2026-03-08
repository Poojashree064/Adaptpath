import React from "react";
import QuestionCard from "../components/QuestionCard";
import TutorBox from "../components/TutorBox";
import usePredict from "../hooks/usePredict";

const SAMPLE_QUESTION = {
  id: "Q00094",
  topic: "Derivatives",
  subtopic: "Chain rule",
  difficulty: "medium",
};

export default function PracticeTest(){
  const { run, loading, result, error } = usePredict();

  async function handleSubmit({ timeTaken, hints }) {
    // Build payload - YOU MUST match training features
    const payload = {
      ability: 0.72,            // example - replace with real student ability
      time_taken: timeTaken,
      hints_used: hints,
      topic_enc: 3,
      subtopic_enc: 5,
      difficulty_enc: 1,
      style_enc: 0,           // visual
      speed_enc: 1,
      student_enc: 10,
      prev_correct_1: 1,
      prev_correct_2: 0,
      prev_correct_3: 1,
      rolling_accuracy_5: 0.6,
      rolling_accuracy_10: 0.58,
      topic_attempt_count: 4,
      topic_correct_rate: 0.7,
    };

    try {
      await run(payload);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="container">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
        <div>
          <QuestionCard question={SAMPLE_QUESTION} onSubmit={handleSubmit} />
          <div style={{ marginTop: 12 }} className="card">
            <h4>Prediction</h4>
            {loading && <p className="small">Predicting...</p>}
            {error && <p className="small" style={{ color: "red" }}>{JSON.stringify(error)}</p>}
            {result && (
              <div>
                <p>Prediction: <strong>{result.prediction === 1 ? "Likely correct" : "Likely wrong"}</strong></p>
                <p>Confidence: <strong>{(result.confidence * 100).toFixed(1)}%</strong></p>
              </div>
            )}
          </div>
        </div>

        <aside>
          <TutorBox />
        </aside>
      </div>
    </div>
  );
}
