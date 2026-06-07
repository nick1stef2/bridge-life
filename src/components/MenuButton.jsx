export default function MenuButton({ text, onClick }) {

  return (

    <button
      onClick={onClick}
      style={{
        background: "#22c55e",
        color: "#000000",
        border: "none",
        padding: "13px 18px",
        borderRadius: "14px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "15px",
        transition: "0.3s",
      }}
    >
      {text}
    </button>

  )
}