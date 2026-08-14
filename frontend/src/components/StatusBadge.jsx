function StatusBadge({ severity }) {
  if (!severity) {
    return null;
  }

  const label = severity.toUpperCase();

  return (
    <span className={`status-badge ${severity}`}>
      {label}
    </span>
  );
}

export default StatusBadge;