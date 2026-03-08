export default function ProgressBar({ current, total }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        height: 6,
        width: "100%",
        background: "#e5e7eb",
        borderRadius: 5
      }}>
        <div style={{
          height: "100%",
          width: `${percent}%`,
          background: "#2563eb",
          borderRadius: 5,
          transition: "width 0.3s"
        }} />
      </div>
      <small>{current}/{total} answered</small>
    </div>
  );
}
