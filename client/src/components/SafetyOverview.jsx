
import ReportForm from "../ReportForm";

export default function SafetyOverview({
  reports,
  showReportForm,
  setShowReportForm,
  onReportCreated,
}) {
  return (
    <aside className="sidebar">
      <h2>Safety Overview</h2>

      <button
        className="report-button"
        onClick={() => setShowReportForm(true)}
      >
        + Report a Concern
      </button>

      {showReportForm && (
        <ReportForm
          onReportCreated={onReportCreated}
          onClose={() => setShowReportForm(false)}
        />
      )}

      <div className="stat">
        <span>Total reports</span>
        <strong>{reports.length}</strong>
      </div>

      <div className="stat">
        <span>High-risk reports</span>
        <strong className="red">
          {
            reports.filter(
              (report) => report.severity === "high"
            ).length
          }
        </strong>
      </div>

      <p className="note">
        Report data is for demonstration. Reported risk does
        not confirm that a location is dangerous.
      </p>
    </aside>
  );
}

