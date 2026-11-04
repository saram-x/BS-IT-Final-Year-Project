import { TableCell, TableRow } from "@/components/ui/table";
import ConfirmationDialog from "./confirmation-dialog";

// Reusable job row component for admin table
const JobRow = ({ job, onDeleteJob, showSuspiciousReason = false, onCleanJob = null }) => {
  const createdAt = job.created_at
    ? new Date(job.created_at).toLocaleDateString()
    : "-";

  const flaggedAt = job.flagged_at
    ? new Date(job.flagged_at).toLocaleDateString()
    : "-";

  return (
    <TableRow key={job.id} className={showSuspiciousReason ? "border-orange-600/20" : ""}>
      <TableCell className="px-6 py-3 whitespace-nowrap text-gray-200 font-medium">
        {job.title || "No title"}
      </TableCell>
      <TableCell className="px-6 py-3 whitespace-nowrap text-gray-200">
        {job.recruiter_email || "N/A"}
      </TableCell>
      
      {/* Show suspicious reason column only for suspicious jobs */}
      {showSuspiciousReason && (
        <TableCell className="px-6 py-3 text-orange-300 max-w-xs">
          <div className="truncate" title={job.suspicious_reason}>
            {job.suspicious_reason || "Manual review"}
          </div>
        </TableCell>
      )}
      
      <TableCell className="px-6 py-3 whitespace-nowrap text-gray-200">
        {job.location || "Remote"}
      </TableCell>
      
      {/* Show status column only for regular jobs */}
      {!showSuspiciousReason && (
        <TableCell className="px-6 py-3 whitespace-nowrap">
          <span className={`px-2 py-1 rounded-full text-xs ${
            job.isOpen 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {job.isOpen ? "Open" : "Closed"}
          </span>
        </TableCell>
      )}
      
      <TableCell className="px-6 py-3 whitespace-nowrap text-gray-200">
        {showSuspiciousReason ? flaggedAt : createdAt}
      </TableCell>
      
      <TableCell className="px-6 py-3 whitespace-nowrap">
        <div className="flex gap-2">
          {/* Clean button only for suspicious jobs */}
          {onCleanJob && (
            <ConfirmationDialog
              trigger={
                <button className="px-3 py-1 rounded text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200">
                  Clean
                </button>
              }
              title="Clean Suspicious Flag"
              description={`Are you sure you want to clean the suspicious flag from "${job.title}"? This will remove it from the suspicious jobs list.`}
              confirmText="Clean Flag"
              onConfirm={() => onCleanJob(job.id)}
              variant="success"
            />
          )}

          {/* Delete job button */}
          <ConfirmationDialog
            trigger={
              <button className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">
                Delete
              </button>
            }
            title={showSuspiciousReason ? "Delete Suspicious Job" : "Delete Job"}
            description={`Are you sure you want to permanently delete "${job.title}"? This action cannot be undone.`}
            confirmText="Confirm Delete"
            onConfirm={() => onDeleteJob(job.id)}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default JobRow;
