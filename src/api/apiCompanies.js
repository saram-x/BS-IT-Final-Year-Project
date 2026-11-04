import supabaseClient, { supabaseUrl } from "@/utils/supabase";

// Get all companies for dropdown lists and filters
export async function getCompanies(token) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase.from("companies").select("*");

  if (error) {
    console.error("Error fetching Companies:", error);
    return null;
  }

  return data;
}

// Create new company with logo upload
export async function addNewCompany(token, _, companyData) {
  const supabase = await supabaseClient(token);

  // Generate unique filename for logo
  const random = Math.floor(Math.random() * 90000);
  const fileName = `logo-${random}-${companyData.name}`;

  // Upload logo to storage
  const { error: storageError } = await supabase.storage
    .from("company-logo")
    .upload(fileName, companyData.logo);

  if (storageError) throw new Error("Error uploading Company Logo");

  // Get public URL for the uploaded logo
  const logo_url = `${supabaseUrl}/storage/v1/object/public/company-logo/${fileName}`;

  // Insert company record with logo URL
  const { data, error } = await supabase
    .from("companies")
    .insert([
      {
        name: companyData.name,
        logo_url: logo_url,
      },
    ])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error submitting Companys");
  }

  return data;
}