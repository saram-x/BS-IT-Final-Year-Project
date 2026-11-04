import { Heart, MapPinIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Link } from "react-router-dom";
import useFetch from "@/hooks/use-fetch";
import { deleteJob, saveJob } from "@/api/apiJobs";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { useToast } from "@/hooks/use-toast";

// Reusable job card component with save/delete functionality
const JobCard = ({
  job,
  savedInit = false,
  onJobAction = () => {},
  isMyJob = false,
}) => {
  const [saved, setSaved] = useState(savedInit);

  const { user } = useUser();
  const { toast } = useToast();

  // Job deletion functionality (for recruiters)
  const { loading: loadingDeleteJob, fn: fnDeleteJob } = useFetch(deleteJob, {
    job_id: job.id,
  });

  // Save/unsave job functionality (for candidates)
  const {
    loading: loadingSavedJob,
    data: savedJob,
    fn: fnSavedJob,
  } = useFetch(saveJob);

  // Handle saving/unsaving a job
  const handleSaveJob = async () => {
    try {
      // Store the current state before making the API call
      const wasAlreadySaved = saved;
      
      const result = await fnSavedJob({
        user_id: user.id,
        job_id: job.id,
      });
      
      // Show success toast based on the previous state (what action was performed)
      if (!wasAlreadySaved) {
        // Job was not saved before, so we just saved it
        toast({
          title: "💖 Job saved!",
          description: `"${job.title}" has been added to your saved jobs.`,
          variant: "default",
        });
      } else {
        // Job was saved before, so we just unsaved it
        toast({
          title: "🗑️ Job unsaved",
          description: `"${job.title}" has been removed from your saved jobs.`,
          variant: "default",
        });
      }
      
      // Note: setSaved will be handled by useEffect when savedJob changes
      onJobAction(); // Refresh parent component
    } catch (error) {
      toast({
        title: "❌ Error saving job",
        description: error.message || "Failed to save/unsave the job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle job deletion (recruiters only)
  const handleDeleteJob = async () => {
    try {
      await fnDeleteJob();
      toast({
        title: "✅ Job deleted successfully!",
        description: `"${job.title}" has been removed from your job postings.`,
        variant: "default",
      });
      onJobAction(); // Refresh parent component
    } catch (error) {
      toast({
        title: "❌ Error deleting job",
        description: error.message || "Failed to delete the job. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update saved state when API response changes
  useEffect(() => {
    if (savedJob !== undefined) {
      setSaved(savedJob?.length > 0);
    }
  }, [savedJob]);

  return (
    <Card className="flex flex-col">
      {loadingDeleteJob && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}
      <CardHeader className="flex">
        <CardTitle className="flex justify-between font-bold">
          {job.title}
          {isMyJob && (
            <Trash2Icon
              fill="red"
              size={18}
              className="text-red-300 cursor-pointer"
              onClick={handleDeleteJob}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between">
          {job.company && <img src={job.company.logo_url} className="h-10 w-auto object-contain" />}
          <div className="flex gap-2 items-center">
            <MapPinIcon size={15} /> {job.location}
          </div>
        </div>
        <hr />
        {job.description.substring(0, job.description.indexOf("."))}.
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link to={`/job/${job.id}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            More Details
          </Button>
        </Link>
        {!isMyJob && (
          <Button
            variant="outline"
            className="w-15"
            onClick={handleSaveJob}
            disabled={loadingSavedJob}
          >
            {saved ? (
              <Heart size={20} fill="red" stroke="red" />
            ) : (
              <Heart size={20} />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;