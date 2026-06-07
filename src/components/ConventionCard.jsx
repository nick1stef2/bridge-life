export default function ConventionCard({
  title,
  text,
  onClick,
}) {

  return (

    <div
      onClick={onClick}
      style={{
        background: "#111827",
        padding: "25px",
        borderRadius: "22px",
        border: "2px solid #334155",
        cursor: "pointer",
        transition: "0.3s",
      }}
    >

      <h2
        style={{
          color: "#facc15",
          marginBottom: "14px",
        }}
      >
        {title}
      </h2>

      <p
        style={{
          color: "#ffffff",
          lineHeight: "1.8",
          fontSize: "17px",
        }}
      >
        {text}
      </p>

      <p
        style={{
          color: "#22c55e",
          marginTop: "18px",
          fontWeight: "bold",
        }}
      >
        👉 Click για περισσότερα
      </p>

    </div>

  )
}