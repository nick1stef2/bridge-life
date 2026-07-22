export default function GalleryCard({
  image,
  title,
  text,
  date,
  category,
  onClick,
}) {
  return (
    <button className="gallery-card" type="button" onClick={onClick}>
      <img src={image} alt={title} className="gallery-card-image" />

      <span className="gallery-card-category">{category}</span>

      <div className="gallery-card-content">
        <h2>{title}</h2>
        <p>{text}</p>
        <time>{date}</time>
      </div>
    </button>
  );
}
