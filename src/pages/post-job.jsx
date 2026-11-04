import { getCompanies } from "@/api/apiCompanies";
import { addNewJob } from "@/api/apiJobs";
import AddCompanyDrawer from "@/components/add-company-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { State } from "country-state-city";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";

// Zod validation schema for job posting form
const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  location: z.string().min(1, { message: "Select a location" }),
  company_id: z.string().min(1, { message: "Select or Add a new Company" }),
  requirements: z.string().min(1, { message: "Requirements are required" }),
});

// Job posting form for recruiters with comprehensive validation
const PostJob = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for managing multiple custom questions
  const [customQuestions, setCustomQuestions] = useState([
    {
      id: Date.now(),
      question: "What is your experience level?",
      options: ["Beginner", "Intermediate"],
      newOption: ""
    }
  ]);

  // Form setup with validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { location: "", company_id: "", requirements: "" },
    resolver: zodResolver(schema),
  });

  // Job creation API call
  const {
    loading: loadingCreateJob,
    error: errorCreateJob,
    data: dataCreateJob,
    fn: fnCreateJob,
  } = useFetch(addNewJob);

  // Functions to manage custom questions
  const addCustomQuestion = () => {
    console.log("🔥 Adding new question");
    setCustomQuestions([
      ...customQuestions,
      {
        id: Date.now(),
        question: "",
        options: ["", ""],
        newOption: ""
      }
    ]);
  };

  const removeCustomQuestion = (questionId) => {
    console.log("🗑️ Removing question:", questionId);
    setCustomQuestions(prevQuestions => {
      if (prevQuestions.length > 1) {
        return prevQuestions.filter(q => q.id !== questionId);
      }
      return prevQuestions;
    });
  };

  const updateQuestion = (questionId, field, value) => {
    console.log("✏️ Updating question:", questionId, field, value);
    
    setCustomQuestions(prevQuestions => {
      console.log("Before update - prevQuestions:", prevQuestions);
      const updatedQuestions = prevQuestions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      );
      console.log("After mapping - updatedQuestions:", updatedQuestions);
      return updatedQuestions;
    });
  };

  const addOptionToQuestion = (questionId) => {
    console.log("➕ Adding option to question:", questionId);
    
    setCustomQuestions(prevQuestions => {
      console.log("Current customQuestions state:", prevQuestions);
      const question = prevQuestions.find(q => q.id === questionId);
      console.log("Found question:", question);
      console.log("Question newOption value:", question?.newOption);
      console.log("Question existing options:", question?.options);
      
      if (question && question.newOption && question.newOption.trim() && !question.options.includes(question.newOption.trim())) {
        console.log("✅ Adding new option:", question.newOption.trim());
        const newOptions = [...question.options, question.newOption.trim()];
        console.log("New options array:", newOptions);
        
        return prevQuestions.map(q => 
          q.id === questionId 
            ? { ...q, options: newOptions, newOption: '' }
            : q
        );
      } else {
        console.log("❌ Cannot add option. Reasons:");
        console.log("- Question found:", !!question);
        console.log("- newOption exists:", !!(question?.newOption));
        console.log("- newOption not empty:", !!(question?.newOption?.trim()));
        console.log("- Option not duplicate:", !question?.options.includes(question?.newOption?.trim()));
        return prevQuestions;
      }
    });
  };

  const removeOptionFromQuestion = (questionId, optionIndex) => {
    setCustomQuestions(prevQuestions => {
      const question = prevQuestions.find(q => q.id === questionId);
      if (question && question.options.length > 2) {
        return prevQuestions.map(q => 
          q.id === questionId 
            ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
            : q
        );
      }
      return prevQuestions;
    });
  };

  const updateOptionInQuestion = (questionId, optionIndex, value) => {
    setCustomQuestions(prevQuestions => {
      const question = prevQuestions.find(q => q.id === questionId);
      if (question) {
        const updatedOptions = [...question.options];
        updatedOptions[optionIndex] = value;
        return prevQuestions.map(q => 
          q.id === questionId 
            ? { ...q, options: updatedOptions }
            : q
        );
      }
      return prevQuestions;
    });
  };

  // Handle form submission
  const onSubmit = (data) => {
    console.log("🚀 Form submitted with data:", data);
    console.log("📝 Current custom questions:", customQuestions);
    
    // Validate custom questions
    const validQuestions = customQuestions.filter(q => {
      const validOptions = q.options.filter(opt => opt.trim() !== "");
      return q.question.trim() !== "" && validOptions.length >= 2;
    });

    console.log("✅ Valid questions:", validQuestions);

    if (validQuestions.length === 0) {
      console.log("❌ No valid questions found");
      toast({
        title: "❌ No Valid Questions",
        description: "Please add at least one question with a minimum of 2 options.",
        variant: "destructive",
      });
      return;
    }

    // Create the questions data structure
    const questionsData = validQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options.filter(opt => opt.trim() !== ""),
      type: "radio"
    }));

    console.log("🚀 Submitting job with data:", data);
    console.log("👤 User ID:", user.id);
    console.log("🔑 User role:", user?.unsafeMetadata?.role);
    console.log("📝 Questions data:", questionsData);
    
    fnCreateJob({
      ...data,
      recruiter_id: user.id,
      isOpen: true,
      main_requirement_data: JSON.stringify(questionsData),
    });
  };

  // Navigate to jobs page after successful creation
  useEffect(() => {
    if (dataCreateJob?.length > 0) {
      toast({
        title: "🎉 Job posted successfully!",
        description: `"${dataCreateJob[0].title}" has been posted and is now live on the platform.`,
        variant: "default",
      });
      navigate("/jobs");
    }
  }, [dataCreateJob, navigate, toast]);

  // Show error notification on job creation failure
  useEffect(() => {
    if (errorCreateJob) {
      toast({
        title: "❌ Error posting job",
        description: errorCreateJob.message || "Failed to post the job. Please try again.",
        variant: "destructive",
      });
    }
  }, [errorCreateJob, toast]);

  // Fetch companies for dropdown selection
  const {
    loading: loadingCompanies,
    data: companies,
    fn: fnCompanies,
  } = useFetch(getCompanies);

  // Load companies when component mounts
  useEffect(() => {
    if (isLoaded) {
      fnCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // Show loading until data is ready
  if (!isLoaded || loadingCompanies) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  // Redirect if user is not a recruiter
  if (user?.unsafeMetadata?.role !== "recruiter") {
    return <Navigate to="/jobs" />;
  }

  return (
    <div>
      {/* Page title */}
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
        Post a Job
      </h1>
      {/* Job posting form */}
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("❌ Form validation errors:", errors);
          toast({
            title: "❌ Form Validation Error",
            description: "Please fill in all required fields correctly.",
            variant: "destructive",
          });
        })}
        className="flex flex-col gap-4 p-4 pb-0"
      >
        {/* Job title input */}
        <Input placeholder="Job Title" {...register("title")} />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        {/* Job description textarea */}
        <Textarea placeholder="Job Description" {...register("description")} />
        {errors.description && (
          <p className="text-red-500">{errors.description.message}</p>
        )}

        {/* Location and company selection row */}
        <div className="flex gap-4 items-center">
          {/* Location dropdown - Pakistan states */}
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {State.getStatesOfCountry("PK").map(({ name }) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {/* Company selection dropdown */}
          <Controller
            name="company_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Company">
                    {field.value
                      ? companies?.find((com) => com.id === Number(field.value))
                          ?.name
                      : "Company"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies?.map(({ name, id }) => (
                      <SelectItem key={name} value={id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {/* Add new company drawer */}
          <AddCompanyDrawer fetchCompanies={fnCompanies} />
        </div>
        {/* Error messages for location and company */}
        {errors.location && (
          <p className="text-red-500">{errors.location.message}</p>
        )}
        {errors.company_id && (
          <p className="text-red-500">{errors.company_id.message}</p>
        )}

        {/* Job requirements markdown editor */}
        <Controller
          name="requirements"
          control={control}
          render={({ field }) => (
            <MDEditor value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.requirements && (
          <p className="text-red-500">{errors.requirements.message}</p>
        )}

        {/* Multiple Custom Questions Builder */}
        <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <label className="text-sm font-medium">
                Custom Questions for Candidates (Radio Button)
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Create multiple questions with radio button options for candidates to answer.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomQuestion}
            >
              <Plus size={16} className="mr-1" />
              Add Question
            </Button>
          </div>

          {/* Questions List */}
          <div className="space-y-6">
            {customQuestions.map((question, questionIndex) => (
              <div key={question.id} className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium">Question {questionIndex + 1}</h4>
                  {customQuestions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomQuestion(question.id)}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>

                {/* Question Input */}
                <div className="mb-4">
                  <Textarea 
                    placeholder="e.g., 'What is your experience level with React.js?'"
                    value={question.question}
                    onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Radio Options Management */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium">Answer Options</label>
                  
                  {/* Display current options */}
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <div className="w-4 h-4 border border-gray-400 rounded-full"></div>
                        <Input
                          value={option}
                          onChange={(e) => updateOptionInQuestion(question.id, optionIndex, e.target.value)}
                          placeholder={`Option ${optionIndex + 1}`}
                          className="flex-1"
                        />
                        {question.options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOptionFromQuestion(question.id, optionIndex)}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add new option */}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border border-gray-400 rounded-full opacity-50"></div>
                    <Input
                      value={question.newOption || ''}
                      onChange={(e) => updateQuestion(question.id, 'newOption', e.target.value)}
                      placeholder="Type new option and click + to add..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addOptionToQuestion(question.id);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log("🔥 Add option button clicked for question:", question.id);
                        console.log("Current newOption:", question.newOption);
                        addOptionToQuestion(question.id);
                      }}
                      disabled={!question.newOption || !question.newOption.trim()}
                      title="Add this option to the question"
                    >
                      <Plus size={16} />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500">
            Each question requires minimum 2 options. Candidates will select one option per question.
          </p>
        </div>
        {/* Error messages */}
        {errors.errorCreateJob && (
          <p className="text-red-500">{errors?.errorCreateJob?.message}</p>
        )}
        {errorCreateJob?.message && (
          <p className="text-red-500">{errorCreateJob?.message}</p>
        )}
        {/* Loading state */}
        {loadingCreateJob && <BarLoader width={"100%"} color="#36d7b7" />}
        {/* Submit button */}
        <Button 
          type="submit" 
          variant="default" 
          size="lg" 
          className="mt-2"
          onClick={() => console.log("🔥 Submit button clicked!")}
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default PostJob;