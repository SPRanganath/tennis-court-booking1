import CourtCard from './CourtCard';

export default function CourtList({ courts, selectedCourtId, onSelect }) {
  return (
    <div className="court-list">
      {courts.map((court) => (
        <CourtCard
          key={court.id}
          court={court}
          isSelected={court.id === selectedCourtId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
