export default function TournamentCard({
  event,
  result,
  place,
  partner,
  onClick,
}) {

  return (

    <div
      onClick={onClick}
      style={{
        background: "#111827",
        padding: "26px",
        borderRadius: "22px",
        marginBottom: "20px",
        border: "2px solid #334155",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
        cursor: "pointer",
      }}
    >

      <h2
        style={{
          color: "#facc15",
          marginBottom: "12px",
        }}
      >
        {event}
      </h2>

      <h1
        style={{
          color: "#22c55e",
          fontSize: "50px",
        }}
      >
        {result}
      </h1>

      <h3
        style={{
          color: "#ffffff",
        }}
      >
        {place}
      </h3>

      <p
        style={{
          color: "#d1d5db",
          marginTop: "10px",
        }}
      >
        🤝 Partner / Συμπαίκτης: {partner}
      </p>

      <p
        style={{
          color: "#22c55e",
          marginTop: "16px",
          fontWeight: "bold",
        }}
      >
        👉 Click για ανάλυση
      </p>

    </div>

  )
}