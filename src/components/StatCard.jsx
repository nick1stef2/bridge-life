export default function StatCard({ title, value }) {

  return (

    <div
      style={{
        background: "#111827",
        padding: "25px",
        borderRadius: "22px",
        textAlign: "center",
        border: "2px solid #22c55e",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      }}
    >

      <h3
        style={{
          color: "#facc15",
          marginBottom: "14px",
          lineHeight: "1.6",
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          color: "#ffffff",
          fontSize: "42px",
        }}
      >
        {value}
      </h1>

    </div>

  )
}