export default function GalleryCard({
  image,
  title,
  text,
  onClick,
}) {

  return (

    <div
      onClick={onClick}
      style={{
        background: "#111827",
        borderRadius: "22px",
        overflow: "hidden",
        border: "2px solid #334155",
        cursor: "pointer",
        transition: "0.3s",
        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
      }}
    >

      <img
        src={image}
        alt={title}
        style={{
          width: "100%",
          height: "220px",
          objectFit: "cover",
          display: "block",
        }}
      />

      <div
        style={{
          padding: "22px",
        }}
      >

        <h2
          style={{
            color: "#22c55e",
            marginBottom: "14px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            color: "#ffffff",
            lineHeight: "1.8",
          }}
        >
          {text}
        </p>

        <p
          style={{
            color: "#facc15",
            marginTop: "18px",
            fontWeight: "bold",
          }}
        >
          👉 Click για άνοιγμα
        </p>

      </div>

    </div>

  )
}