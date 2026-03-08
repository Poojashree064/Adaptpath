import { useState } from "react";
import { predict } from "../utils/api";

export default function usePredict() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runPrediction = async (input) => {
    try {
      setLoading(true);
      setError(null);
      const res = await predict(input);
      setResult(res);
    } catch (err) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, runPrediction };
}
