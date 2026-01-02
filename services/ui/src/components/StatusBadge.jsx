const StatusBadge = ({ status }) => {
  const styles = {
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    PROCESSING: "bg-blue-100 text-blue-700 border-blue-200",
    QUEUED: "bg-amber-100 text-amber-700 border-amber-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
};