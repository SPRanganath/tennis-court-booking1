const surfaceEmoji = {
  Hard: '🟦',
  Clay: '🟧',
  Grass: '🟩',
};

export default function CourtCard({ court, onSelect, isSelected }) {
  return (
    <div className={isSelected ? 'court-card court-card--selected' : 'court-card'}>
      <div className="court-card__top">
        <span className="court-card__surface" title={`${court.surface} surface`}>
          {surfaceEmoji[court.surface] || '🎾'}
        </span>
        <span className="court-card__badge">{court.indoor ? 'Indoor' : 'Outdoor'}</span>
      </div>
      <h3>{court.name}</h3>
      <p className="court-card__location">{court.location}</p>
      <ul className="court-card__meta">
        <li>{court.surface} surface</li>
        <li>{court.numberOfCourts} courts</li>
        <li>${court.pricePerHour}/hr</li>
      </ul>
      <button className="btn btn--primary" onClick={() => onSelect(court)}>
        {isSelected ? 'Selected' : 'Select & Book'}
      </button>
    </div>
  );
}
