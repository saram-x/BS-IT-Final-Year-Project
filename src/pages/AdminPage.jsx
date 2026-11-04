import React, { useEffect, useState } from "react";
import { useUser, useSession } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";

// Import reusable admin components
import AdminSidebar from "@/components/admin/admin-sidebar";
import SectionHeader from "@/components/admin/section-header";
import AdminDataTable from "@/components/admin/admin-data-table";
import LoadingSpinner from "@/components/admin/loading-spinner";
import { createTableConfig } from "@/components/admin/table-config";
import { useAdminOperations } from "@/components/admin/use-admin-operations";

const AdminPage = () => {
  // State management for users, jobs, and UI controls
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [jobs, setJobs] = useState([]);
  const [searchJobs, setSearchJobs] = useState("");
  const [jobsLoading, setJobsLoading] = useState(false);
  
  const [suspiciousJobs, setSuspiciousJobs] = useState([]);
  const [cleanedJobs, setCleanedJobs] = useState(new Set());
  const [searchSuspicious, setSearchSuspicious] = useState("");
  const [suspiciousLoading, setSuspiciousLoading] = useState(false);
  
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const { toast } = useToast();

  // Fetch suspicious jobs for admin review
  const fnSuspiciousJobs = async () => {
    try {
      setSuspiciousLoading(true);
      
      const response = await fetch("http://localhost:3001/api/get-suspicious-jobs");
      if (!response.ok) {
        throw new Error(`Failed to fetch suspicious jobs: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter out cleaned jobs from current session
      const filteredData = data.filter(job => !cleanedJobs.has(job.id));
      setSuspiciousJobs(filteredData);
    } catch (err) {
      console.error("❌ Error fetching suspicious jobs:", err);
      setError("Error fetching suspicious jobs");
    } finally {
      setSuspiciousLoading(false);
    }
  };

  // Fetch all jobs with recruiter info via server-side API
  const fnJobs = async () => {
    try {
      setJobsLoading(true);
      
      const response = await fetch("http://localhost:3001/api/jobs");
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }
      
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      setError("Error fetching jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  // Custom hook for admin operations
  const { handleDeleteJob, handleCleanJob, handleDeleteUser, handleBanUser } = useAdminOperations(
    setUsers, setJobs, setSuspiciousJobs, setCleanedJobs, cleanedJobs, users, fnJobs, fnSuspiciousJobs
  );

  // Run auto-detection for suspicious jobs
  const handleAutoDetect = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/auto-detect-suspicious", {
        method: "POST"
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (result.migrationRequired) {
          toast({
            title: "🔧 Database Migration Required",
            description: "Please run the database migration first. Check SUSPICIOUS_JOBS_MIGRATION.md for instructions.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(result.error || "Auto-detection failed");
      }
      
      toast({
        title: "🔍 Auto-detection complete!",
        description: `${result.flaggedCount} jobs were automatically flagged as suspicious.`,
        variant: "default",
      });
      
      // Refresh jobs lists
      fnJobs();
      fnSuspiciousJobs();
    } catch (err) {
      console.error("Error in auto-detection:", err);
      toast({
        title: "❌ Auto-detection failed",
        description: err.message || "Failed to run auto-detection. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch all platform users from Clerk API via backend
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError("Error fetching users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load jobs when jobs tab is active and user is authenticated
  useEffect(() => {
    if (activeTab === "jobs" && isLoaded) {
      fnJobs();
    }
  }, [activeTab, isLoaded]);

  // Load suspicious jobs when suspicious tab is active
  useEffect(() => {
    if (activeTab === "suspicious" && isLoaded) {
      fnSuspiciousJobs();
    }
  }, [activeTab, isLoaded]);

  // Filter users (exclude admins) and apply search filter
  const filteredUsers = users.filter((user) => {
    const email = user.email_addresses?.[0]?.email_address || "";
    const name = user.first_name || "";
    const username = user.username || "";
    return (
      !email.endsWith("@admin.com") &&
      (email.toLowerCase().includes(searchEmail.toLowerCase()) ||
       name.toLowerCase().includes(searchEmail.toLowerCase()) ||
       username.toLowerCase().includes(searchEmail.toLowerCase()))
    );
  });

  // Filter jobs by title or recruiter email
  const filteredJobs = (jobs || []).filter((job) => {
    const title = job.title || "";
    const recruiterEmail = job.recruiter_email || "";
    return (
      title.toLowerCase().includes(searchJobs.toLowerCase()) ||
      recruiterEmail.toLowerCase().includes(searchJobs.toLowerCase())
    );
  });

  // Filter suspicious jobs by title or recruiter email
  const filteredSuspiciousJobs = (suspiciousJobs || []).filter((job) => {
    const title = job.title || "";
    const recruiterEmail = job.recruiter_email || "";
    const reason = job.suspicious_reason || "";
    return (
      title.toLowerCase().includes(searchSuspicious.toLowerCase()) ||
      recruiterEmail.toLowerCase().includes(searchSuspicious.toLowerCase()) ||
      reason.toLowerCase().includes(searchSuspicious.toLowerCase())
    );
  });

  // Show loading or error states
  if (loading) return <LoadingSpinner message="Loading users..." />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Create table configuration
  const tableConfig = createTableConfig(
    activeTab,
    { searchEmail, searchJobs, searchSuspicious },
    { setSearchEmail, setSearchJobs, setSearchSuspicious },
    { filteredUsers, filteredJobs, filteredSuspiciousJobs },
    { loading, jobsLoading, suspiciousLoading },
    { handleBanUser, handleDeleteUser, handleDeleteJob, handleCleanJob },
    handleAutoDetect
  );

  // Get current filtered data based on active tab
  const getCurrentFilteredData = () => {
    switch (activeTab) {
      case 'users': return filteredUsers;
      case 'jobs': return filteredJobs;
      case 'suspicious': return filteredSuspiciousJobs;
      default: return [];
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          suspiciousJobsCount={suspiciousJobs.length} 
        />
        
        <div className="flex-1 p-8">
          <SectionHeader 
            activeTab={activeTab} 
            filteredData={getCurrentFilteredData()} 
          />
          <AdminDataTable 
            config={tableConfig} 
            activeTab={activeTab} 
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
