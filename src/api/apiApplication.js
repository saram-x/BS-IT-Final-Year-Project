import supabaseClient, { supabaseUrl } from "@/utils/supabase";

// Submit job application with resume upload
export async function applyToJob(token, _, jobData) {
  console.log("🔐 API received token:", token ? "Token present" : "No token");
  console.log("📝 API received job data:", jobData);
  
  const supabase = await supabaseClient(token);

  // Generate unique filename for resume
  const random = Math.floor(Math.random() * 90000);
  const fileName = `resume-${random}-${jobData.candidate_id}`;

  // Upload resume to storage
  const { error: storageError } = await supabase.storage
    .from("resumes")
    .upload(fileName, jobData.resume);

  if (storageError) throw new Error("Error uploading Resume");

  // Get public URL for uploaded resume
  const resume = `${supabaseUrl}/storage/v1/object/public/resumes/${fileName}`;

  console.log("📤 About to insert application with data:", {
    ...jobData,
    resume,
  });

  // Insert application record with resume URL
  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        ...jobData,
        resume,
      },
    ])
    .select();

  if (error) {
    console.error("❌ Supabase error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      statusCode: error.statusCode
    });
    throw new Error(`Error submitting Application: ${error.message} (Code: ${error.code})`);
  }

  return data;
}

// Update application status for recruiter management
export async function updateApplicationStatus(token, options, statusData) {
  console.log("🔄 Updating application status:", { options, statusData });
  
  const supabase = await supabaseClient(token);
  
  // Extract parameters from the passed arguments
  let application_id, status;
  
  if (statusData) {
    // Called as fn(token, options, statusData)
    application_id = statusData.application_id;
    status = statusData.status;
  } else if (options && options.application_id) {
    // Called as fn(token, { application_id, status })
    application_id = options.application_id;
    status = options.status;
  }
  
  console.log("🔄 Using application_id:", application_id, "status:", status);
  
  if (!application_id || !status) {
    console.error("❌ Missing application_id or status:", { application_id, status });
    return null;
  }

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", application_id)
    .select();

  if (error) {
    console.error("Error Updating Application Status:", error);
    return null;
  }
  
  if (data.length === 0) {
    console.error("No application found with ID:", application_id);
    return null;
  }

  console.log("✅ Application status updated successfully:", data);
  return data;
}

// Get all applications for a specific user
export async function getApplications(token, { user_id }) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("applications")
    .select("*, job:jobs(title, company:companies(name))")
    .eq("candidate_id", user_id);

  if (error) {
    console.error("Error fetching Applications:", error);
    return null;
  }

  return data;
}
// milestone: Improved search and filtering logic for roles

// milestone 13: Optimized repeated API requests and stale state refreshes

// milestone 26: Improved FAQ and help content readability

// milestone 34: Reviewed message thread state handling and CTA layout
