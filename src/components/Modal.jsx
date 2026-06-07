export default function Modal({
  item,
  onClose,
}) {

  if (!item) return null;

  return (

    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 9999,
      }}
    >

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "95%",
          maxHeight: "95%",
          textAlign: "center",
        }}
      >

        <h2
          style={{
            color: "#ffffff",
            marginBottom: "15px",
          }}
        >
          {item.title}
        </h2>

        <img
          src={item.image}
          alt={item.title}
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            borderRadius: "16px",
            boxShadow: "0 0 30px rgba(0,0,0,0.6)",
          }}
        />

        <div
          style={{
            marginTop: "20px",
          }}
        >

          <button
            onClick={onClose}
            style={{
              background: "#22c55e",
              color: "#000",
              border: "none",
              padding: "12px 24px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Κλείσιμο
          </button>

        </div>

      </div>

    </div>

  );
}