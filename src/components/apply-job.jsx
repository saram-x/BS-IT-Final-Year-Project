import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useFetch from "@/hooks/use-fetch";
import { applyToJob } from "@/api/apiApplication";
import { BarLoader } from "react-spinners";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@clerk/clerk-react";

  // Validation schema for job application form
const schema = z.object({
  resume: z
    .any()
    .refine(
      (file) =>
        file[0] &&
        (file[0].type === "application/pdf" ||
          file[0].type === "application/msword"),
      { message: "Only PDF or Word documents are allowed" }
    ),
}).catchall(z.any()); // Allow dynamic question fields

// Interactive drawer component for submitting job applications
export function ApplyJobDrawer({ user, job, fetchJob, applied = false }) {
  const { getToken } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const { toast } = useToast();

  const {
    loading: loadingApply,
    error: errorApply,
    fn: fnApply,
  } = useFetch(applyToJob);

  const onSubmit = (data) => {
    console.log("🚀 Form submission started with data:", data);
    
    // Collect answers to custom questions
    const questionAnswers = [];
    
    // Extract custom question answers from form data
    Object.keys(data).forEach(key => {
      if (key.startsWith('question_')) {
        const questionId = key.replace('question_', '');
        questionAnswers.push({
          questionId: questionId,
          answer: data[key]
        });
      }
    });

    console.log("📝 Custom question answers:", questionAnswers);

    // Format question answers for storage
    let mainRequirements = "";

    if (questionAnswers.length > 0) {
      // Store all answers in main_requirements as JSON
      mainRequirements = JSON.stringify(questionAnswers);
    }

    // Prepare the application data with proper field types
    const applicationData = {
      job_id: job.id,
      candidate_id: user.id,
      name: user.fullName,
      status: "applied",
      resume: data.resume[0],
      main_requirements: mainRequirements || "No questions answered",
    };

    console.log("🚀 Final application data:", applicationData);

    // Get the authentication token for debugging and then submit
    getToken({ template: "supabase" }).then(token => {
      console.log("🔑 Auth token:", token ? "Token exists" : "No token");
      
      fnApply(applicationData).then(() => {
        toast({
          title: "🎉 Application submitted successfully!",
          description: `Your application for "${job.title}" at ${job.company?.name} has been sent.`,
          variant: "default",
        });
        fetchJob();
        reset();
      }).catch((error) => {
        console.error("❌ Application submission error:", error);
        toast({
          title: "❌ Application failed",
          description: error.message || "Failed to submit your application. Please try again.",
          variant: "destructive",
        });
      });
    }).catch((authError) => {
      console.error("🔑 Auth token error:", authError);
      toast({
        title: "❌ Authentication failed",
        description: "Please log in again and try submitting your application.",
        variant: "destructive",
      });
    });
  };

  return (
    <Drawer open={applied ? false : undefined}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          variant={job?.isOpen && !applied ? "default" : "destructive"}
          disabled={!job?.isOpen || applied}
        >
          {job?.isOpen ? (applied ? "Applied" : "Apply") : "Hiring Closed"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <DrawerTitle>
            Apply for {job?.title} at {job?.company?.name}
          </DrawerTitle>
          <DrawerDescription>Please Fill the form below</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 pb-4"
          >
          {/* Multiple Radio Button Questions */}
          <div className="flex flex-col gap-4">
            {job?.main_requirement_data && (() => {
              try {
                const questionsData = JSON.parse(job.main_requirement_data);
                const questions = Array.isArray(questionsData) ? questionsData : [questionsData];
                
                return questions.map((questionData, index) => (
                  <div key={questionData.id || index} className="space-y-3">
                    {/* Question Display */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border-l-4 border-gray-400">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Question {index + 1}:</strong>
                      </p>
                      <p className="text-sm font-medium">
                        {questionData.question}
                      </p>
                    </div>
                    
                    {/* Radio Button Options */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select your answer:</label>
                      <Controller
                        name={`question_${questionData.id || index}`}
                        control={control}
                        rules={{ required: "Please select an answer" }}
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} value={field.value}>
                            {questionData.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value={option} 
                                  id={`q${questionData.id || index}_option${optionIndex}`} 
                                />
                                <Label 
                                  htmlFor={`q${questionData.id || index}_option${optionIndex}`} 
                                  className="text-sm"
                                >
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      />
                      {errors[`question_${questionData.id || index}`] && (
                        <p className="text-red-500 text-sm">
                          {errors[`question_${questionData.id || index}`].message}
                        </p>
                      )}
                    </div>
                  </div>
                ));
              } catch (error) {
                // Fallback for old single question format
                const questionData = job.main_requirement_data;
                try {
                  const singleQuestion = JSON.parse(questionData);
                  return (
                    <div className="space-y-3">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border-l-4 border-gray-400">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          <strong>Question from recruiter:</strong>
                        </p>
                        <p className="text-sm font-medium">
                          {singleQuestion.question}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select your answer:</label>
                        <Controller
                          name="main_requirements"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value}>
                              {singleQuestion.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option} id={`option-${index}`} />
                                  <Label htmlFor={`option-${index}`} className="text-sm">
                                    {option}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          )}
                        />
                      </div>
                    </div>
                  );
                } catch {
                  // Ultimate fallback for old text-based questions
                  return (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Requirements Response</label>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md border-l-4 border-gray-400">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Question from recruiter:</strong>
                        </p>
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {job.main_requirement_data}
                        </p>
                      </div>
                      <Textarea
                        placeholder="Describe in detail how you meet the requirements for this position..."
                        className="min-h-[100px]"
                        {...register("main_requirements")}
                        rows={4}
                      />
                    </div>
                  );
                }
              }
            })()}
            {errors.main_requirements && (
              <p className="text-red-500">{errors.main_requirements.message}</p>
            )}
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Resume Upload</label>
            <Input
              type="file"
              accept=".pdf, .doc, .docx"
              className="flex-1 file:text-gray-500"
              {...register("resume")}
            />
            {errors.resume && (
              <p className="text-red-500 text-sm">{errors.resume.message}</p>
            )}
          </div>
          {errorApply?.message && (
            <p className="text-red-500">{errorApply?.message}</p>
          )}
          {loadingApply && <BarLoader width={"100%"} color="#36d7b7" />}
          <Button type="submit" variant="default" size="lg">
            Apply
          </Button>
        </form>
        </div>

        <DrawerFooter className="flex-shrink-0">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}