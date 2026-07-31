function HeatmapCard() {
  return (
    <div className="heatmap-card">
      <h2>Store Heatmap</h2>

      <p className="heatmap-description">
        Areas with higher shopper attention appear in warmer colors,
        while low-interaction zones appear cooler.
      </p>

      <img
        src="http://127.0.0.1:8000/analytics/heatmap"
        alt="Store Heatmap"
        className="heatmap-image"
      />
    </div>
  );
}

export default HeatmapCard;