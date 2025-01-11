import { useEffect } from "react";
import { BarLoader } from "react-spinners";
import MDEditor from "@uiw/react-md-editor";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Briefcase, DoorClosed, DoorOpen, MapPinIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplyJobDrawer } from "@/components/apply-job";
import ApplicationCard from "@/components/application-card";

import useFetch from "@/hooks/use-fetch";
import { getSingleJob, updateHiringStatus } from "@/api/apiJobs";

// Individual job detail page with application functionality
const JobPage = () => {
  const { id } = useParams(); // Extract job ID from URL params
  const { isLoaded, user } = useUser();

  // Fetch detailed job information including applications
  const {
    loading: loadingJob,
    data: job,
    fn: fnJob,
  } = useFetch(getSingleJob, {
    job_id: id,
  });

  // Load job data when user information is ready
  useEffect(() => {
    if (isLoaded) fnJob();
  }, [isLoaded]);

  // Update job hiring status (open/closed) for recruiters
  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(
    updateHiringStatus,
    {
      job_id: id,
    }
  );

  // Handle hiring status change from dropdown
  const handleStatusChange = (value) => {
    const isOpen = value === "open";
    fnHiringStatus(isOpen).then(() => fnJob());
  };

  // Show loading spinner until job data is loaded
  if (!isLoaded || loadingJob) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  return (
    <div className="flex flex-col gap-8 mt-5">
      {/* Job title and company logo header */}
      <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-center">
        <h1 className="gradient-title font-extrabold pb-3 text-4xl sm:text-6xl">
          {job?.title}
        </h1>
        <img src={job?.company?.logo_url} className="h-12" alt={job?.title} />
      </div>

      {/* Job metadata: location, applicants, status */}
      <div className="flex justify-between ">
        <div className="flex gap-2">
          <MapPinIcon /> {job?.location}
        </div>
        <div className="flex gap-2">
          <Briefcase /> {job?.applications?.length} Applicants
        </div>
        <div className="flex gap-2">
          {job?.isOpen ? (
            <>
              <DoorOpen /> Open
            </>
          ) : (
            <>
              <DoorClosed /> Closed
            </>
          )}
        </div>
      </div>

      {/* Hiring status control for job owner */}
      {job?.recruiter_id === user?.id && (
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger
            className={`w-full ${job?.isOpen ? "bg-green-950" : "bg-red-950"}`}
          >
            <SelectValue
              placeholder={
                "Hiring Status " + (job?.isOpen ? "( Open )" : "( Closed )")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Job description section */}
      <h2 className="text-2xl sm:text-3xl font-bold">About the job</h2>
      <p className="sm:text-lg">{job?.description}</p>

      {/* Job requirements in markdown */}
      <h2 className="text-2xl sm:text-3xl font-bold">
        What we are looking for
      </h2>
      <MDEditor.Markdown
        source={job?.requirements}
        className="bg-transparent sm:text-lg" // add global ul styles - tutorial
      />
      
      {/* Main requirements question section */}
      {job?.main_requirement_data && (
        <>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Application Question
          </h2>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border-l-4 border-gray-400">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              <strong>Candidates will be asked:</strong>
            </p>
            {(() => {
              try {
                const questionsData = JSON.parse(job.main_requirement_data);
                const questions = Array.isArray(questionsData) ? questionsData : [questionsData];
                
                return (
                  <div className="space-y-4">
                    {questions.map((questionData, index) => (
                      <div key={questionData.id || index} className="border-l-2 border-gray-300 pl-4">
                        <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                          <span className="text-sm text-gray-500">Q{index + 1}:</span> {questionData.question}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <strong>Available options:</strong>
                          </p>
                          <ul className="space-y-1 ml-4">
                            {questionData.options?.map((option, optionIndex) => (
                              <li key={optionIndex} className="flex items-center space-x-2">
                                <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                                <span className="text-sm">{option}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              } catch (error) {
                // Fallback for old single question format
                try {
                  const singleQuestion = JSON.parse(job.main_requirement_data);
                  return (
                    <div className="space-y-3">
                      <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                        {singleQuestion.question}
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Available options:</strong>
                        </p>
                        <ul className="space-y-1 ml-4">
                          {singleQuestion.options?.map((option, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                              <span className="text-sm">{option}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                } catch {
                  // Ultimate fallback for old text-based questions
                  return (
                    <p className="sm:text-lg whitespace-pre-wrap text-gray-600 dark:text-gray-400">
                      {job.main_requirement_data}
                    </p>
                  );
                }
              }
            })()}
          </div>
        </>
      )}
      {/* Apply button for non-owners */}
      {job?.recruiter_id !== user?.id && (
        <ApplyJobDrawer
          job={job}
          user={user}
          fetchJob={fnJob}
          applied={job?.applications?.find((ap) => ap.candidate_id === user.id)}
        />
      )}
      {/* Loading state for status updates */}
      {loadingHiringStatus && <BarLoader width={"100%"} color="#36d7b7" />}
      {/* Applications list for job owner */}
      {job?.applications?.length > 0 && job?.recruiter_id === user?.id && (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold mb-4 text-xl ml-1">Applications</h2>
          {job?.applications.map((application) => {
            return (
              <ApplicationCard key={application.id} application={application} />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobPage;
// milestone 15: Improved job listing responsiveness across smaller screens

// milestone 21: Adjusted project notes and setup documentation

// milestone 27: Tuned page transitions for smoother navigation

// milestone 32: Tuned list filtering logic for location and role preferences
