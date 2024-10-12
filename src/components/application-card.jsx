import { Boxes, Download, CheckCircle, MessageCircle, Briefcase, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { updateApplicationStatus } from "@/api/apiApplication";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import MessagingComponent from "./messaging-component";
import { useState, useEffect } from "react";
import { useUser, useSession } from "@clerk/clerk-react";
import { getMessages } from "@/api/apiMessages";

// Displays individual job application details with status management
const ApplicationCard = ({ application, isCandidate = false }) => {
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const { user } = useUser();
  const { session } = useSession();

  // Check for unread messages with proper dependency management
  useEffect(() => {
    let isMounted = true;
    let intervalId = null;

    const checkUnreadMessages = async () => {
      // Skip if component unmounted or no required data
      if (!isMounted || !application?.id || !user?.id || !session) return;
      
      try {
        const token = await session.getToken({ template: "supabase" });
        const messages = await getMessages(token, { application_id: application.id });
        
        if (isMounted && messages) {
          const unreadMessages = messages.filter(msg => 
            msg.sender_id !== user.id && !msg.is_read
          );
          setHasUnreadMessages(unreadMessages.length > 0);
        }
      } catch (error) {
        console.error("Error checking unread messages:", error);
      }
    };

    // Initial check
    checkUnreadMessages();
    
    // Set up polling every 30 seconds
    intervalId = setInterval(checkUnreadMessages, 30000);
    
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [application?.id, user?.id, session]); // Only depend on IDs and session

  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(
    updateApplicationStatus
  );

  const handleStatusChange = (status) => {
    fnHiringStatus({ application_id: application.id, status });
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {isCandidate
            ? `${application?.job?.title} at ${application?.job?.company?.name}`
            : application?.name}
          <div className="flex gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log("🔘 Message button clicked for application:", application.id);
                  setIsMessagingOpen(true);
                  setHasUnreadMessages(false); // Clear notification when opening
                }}
                className="flex items-center gap-2"
              >
                <MessageCircle size={16} />
                Message
              </Button>
              {hasUnreadMessages && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">!</span>
                </div>
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {/* Resume */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Download size={15} />
              <p className="font-medium">Resume</p>
            </div>
            <div
              className="text-sm text-blue-500 dark:text-blue-400 cursor-pointer hover:underline"
              onClick={() => handleDownload(application?.resume)}
            >
              Download Resume
            </div>
          </div>

          {/* Main Requirements */}
          {application?.job?.main_requirement_data && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border-l-4 border-blue-500">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                Job Requirements:
              </p>
              
              {(() => {
                try {
                  const mainRequirements = JSON.parse(application.job.main_requirement_data);
                  
                  if (Array.isArray(mainRequirements) && mainRequirements.length > 0 && mainRequirements[0]?.questionId) {
                    return mainRequirements.map((singleQuestion, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                          {singleQuestion.question}
                        </p>
                        {singleQuestion.options && (
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            Options: {singleQuestion.options.join(", ")}
                          </div>
                        )}
                      </div>
                    ));
                  } else {
                    return (
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {application.job.main_requirement_data}
                      </p>
                    );
                  }
                } catch {
                  return (
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {application.job.main_requirement_data}
                    </p>
                  );
                }
              })()}
            </div>
          )}
          
          {/* Candidate's responses */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border-l-4 border-green-500">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Candidate's answers:
            </p>
            
            {(() => {
              try {
                if (application?.main_requirements && application.main_requirements !== "No questions answered") {
                  const questionAnswers = JSON.parse(application.main_requirements);
                  
                  if (Array.isArray(questionAnswers) && questionAnswers.length > 0 && questionAnswers[0]?.questionId) {
                    return questionAnswers.map((answer, index) => (
                      <div key={index} className="mb-2 last:mb-0">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          Answer {index + 1}: {answer.answer}
                        </p>
                      </div>
                    ));
                  }
                }
              } catch (error) {
                console.log("Could not parse custom answers, using fallback");
              }
              
              return (
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {application?.main_requirements || "No questions answered"}
                </p>
              );
            })()}
          </div>

          {/* Status indication */}
          <div className="flex items-center gap-2">
            <CheckCircle size={15} />
            <p className="font-medium">Status: {application?.status}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Eye size={15} />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Applied {new Date(application?.created_at).toLocaleDateString()}
          </p>
        </div>
        {loadingHiringStatus && <BarLoader width={100} color="#36d7b7" />}
        {!isCandidate && (
          <Select
            onValueChange={handleStatusChange}
            defaultValue={application.status}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Application Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardFooter>

      {/* Messaging Component */}
      <MessagingComponent
        application={application}
        isOpen={isMessagingOpen}
        onClose={() => {
          console.log("🔍 ApplicationCard - Closing messaging");
          setIsMessagingOpen(false);
        }}
        isCandidate={isCandidate}
      />
      
    </Card>
  );
};

export default ApplicationCard;

// milestone: Improved job cards with clearer metadata and actions

// milestone 10: Reviewed company metadata presentation and image fallbacks

// milestone 24: Refined loading skeletons and transition feedback
