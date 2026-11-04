import { Button } from "@/components/ui/button";

// Configuration generator for admin table sections
export const createTableConfig = (
  activeTab,
  searchValues,
  setSearchValues,
  filteredData,
  loading,
  handleFunctions,
  handleAutoDetect
) => {
  const configs = {
    users: {
      title: "All Users",
      searchPlaceholder: "Search by email or name...",
      searchValue: searchValues.searchEmail,
      onSearchChange: setSearchValues.setSearchEmail,
      data: filteredData.filteredUsers,
      totalCount: filteredData.filteredUsers.length,
      loading: loading.loading,
      loadingMessage: "Loading users...",
      emptyMessage: searchValues.searchEmail ? "No users found matching your search." : "No users found.",
      headers: ["Name", "Email", "Username", "Role", "Status", "Last Signed In", "Created", "Actions"],
      renderRow: (user) => (
        <UserRow 
          key={user.id} 
          user={user} 
          onBanUser={handleFunctions.handleBanUser} 
          onDeleteUser={handleFunctions.handleDeleteUser} 
        />
      )
    },
    jobs: {
      title: "All Jobs",
      searchPlaceholder: "Search by title or recruiter email...",
      searchValue: searchValues.searchJobs,
      onSearchChange: setSearchValues.setSearchJobs,
      data: filteredData.filteredJobs,
      totalCount: filteredData.filteredJobs.length,
      loading: loading.jobsLoading,
      loadingMessage: "Loading jobs...",
      emptyMessage: searchValues.searchJobs ? "No jobs found matching your search." : "No jobs posted yet.",
      headers: ["Title", "Recruiter Email", "Location", "Status", "Created", "Actions"],
      renderRow: (job) => (
        <JobRow 
          key={job.id} 
          job={job} 
          onDeleteJob={handleFunctions.handleDeleteJob} 
        />
      )
    },
    suspicious: {
      title: "Flagged Jobs",
      searchPlaceholder: "Search by title, recruiter, or reason...",
      searchValue: searchValues.searchSuspicious,
      onSearchChange: setSearchValues.setSearchSuspicious,
      data: filteredData.filteredSuspiciousJobs,
      totalCount: filteredData.filteredSuspiciousJobs.length,
      loading: loading.suspiciousLoading,
      loadingMessage: "Loading suspicious jobs...",
      emptyMessage: searchValues.searchSuspicious ? "No suspicious jobs found matching your search." : "No suspicious jobs flagged yet. 🎉",
      headers: ["Title", "Recruiter Email", "Suspicious Reason", "Location", "Flagged Date", "Actions"],
      renderRow: (job) => (
        <JobRow 
          key={job.id} 
          job={job} 
          onDeleteJob={handleFunctions.handleDeleteJob}
          onCleanJob={handleFunctions.handleCleanJob}
          showSuspiciousReason={true}
        />
      ),
      headerActions: (
        <Button 
          onClick={handleAutoDetect}
          variant="outline"
          className="bg-orange-600 hover:bg-orange-700 text-white border-orange-500"
        >
          Auto-Detect Suspicious
        </Button>
      )
    }
  };

  return configs[activeTab];
};

// Import statements for components
import UserRow from "./user-row";
import JobRow from "./job-row";
