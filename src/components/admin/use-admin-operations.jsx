import { useToast } from "@/hooks/use-toast";

// Custom hook for admin API operations
export const useAdminOperations = (
  setUsers,
  setJobs,
  setSuspiciousJobs,
  setCleanedJobs,
  cleanedJobs,
  users,
  fnJobs,
  fnSuspiciousJobs
) => {
  const { toast } = useToast();

  // Delete job permanently via server-side API
  const handleDeleteJob = async (jobId) => {
    try {
      const checkResponse = await fetch(`http://localhost:3001/api/jobs`);
      const serverJobs = await checkResponse.json();
      
      const jobExists = serverJobs.find(job => job.id == jobId);
      if (!jobExists) {
        toast({
          title: "❌ Job not found",
          description: `Job ID ${jobId} not found in database.`,
          variant: "destructive",
        });
        fnJobs();
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/jobs/${jobId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server deletion failed: ${response.status}`);
      }

      const result = await response.json();
      fnJobs();
      fnSuspiciousJobs();
      
      toast({
        title: "✅ Job deleted successfully!",
        description: `"${jobExists.title}" has been removed from the platform.`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "❌ Error deleting job",
        description: err.message || "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Clean/unflag job from suspicious list
  const handleCleanJob = async (jobId) => {
    try {
      const updatedCleanedJobs = new Set([...cleanedJobs, jobId]);
      setCleanedJobs(updatedCleanedJobs);
      
      toast({
        title: "✅ Job cleaned successfully!",
        description: "The job has been cleared from suspicious jobs list.",
        variant: "default",
      });
      
      setSuspiciousJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      toast({
        title: "❌ Error cleaning job",
        description: err.message || "Failed to clean job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete user permanently from Clerk via server-side API
  const handleDeleteUser = async (userId) => {
    try {
      const userToDelete = users.find(u => u.id === userId);
      const userEmail = userToDelete?.email_addresses?.[0]?.email_address || "Unknown";
      
      const res = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((user) => user.id !== userId));
      
      toast({
        title: "🗑️ User deleted successfully!",
        description: `User ${userEmail} has been permanently removed.`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "❌ Error deleting user",
        description: err.message || "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle user ban status via Clerk API through server
  const handleBanUser = async (userId, currentBannedStatus) => {
    try {
      const action = currentBannedStatus ? "unban" : "ban";
      const userToBan = users.find(u => u.id === userId);
      const userEmail = userToBan?.email_addresses?.[0]?.email_address || "Unknown";
      
      const res = await fetch(`http://localhost:3001/api/${action}-user/${userId}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`Failed to ${action} user: ${res.status}`);
      }

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, banned: !currentBannedStatus }
          : user
      ));
      
      toast({
        title: currentBannedStatus ? "✅ User unbanned successfully!" : "🚫 User banned successfully!",
        description: currentBannedStatus 
          ? `${userEmail} has been unbanned.`
          : `${userEmail} has been banned.`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: `❌ Error ${currentBannedStatus ? 'unbanning' : 'banning'} user`,
        description: err.message || `Failed to ${currentBannedStatus ? 'unban' : 'ban'} user.`,
        variant: "destructive",
      });
    }
  };

  return {
    handleDeleteJob,
    handleCleanJob,
    handleDeleteUser,
    handleBanUser
  };
};
