import supabaseClient from "@/utils/supabase";

// Send a new message between recruiter and candidate
export async function sendMessage(token, _, messageData) {
  console.log("📨 Sending message:", messageData);
  const supabase = await supabaseClient(token);

  // Enhanced validation for message data
  if (!messageData.application_id || !messageData.sender_id || !messageData.content) {
    throw new Error("Missing required message data: application_id, sender_id, or content");
  }

  // Validate application_id format (should be a positive integer)
  const appId = Number(messageData.application_id);
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new Error(`Invalid application_id format: ${messageData.application_id}. Must be a positive integer.`);
  }

  // Ensure content is not empty
  if (!messageData.content.trim()) {
    throw new Error("Message content cannot be empty");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert([{
      application_id: appId,
      sender_id: messageData.sender_id,
      sender_name: messageData.sender_name || 'Unknown User',
      content: messageData.content.trim(),
      is_read: false
    }])
    .select();

  if (error) {
    console.error("❌ Error sending message:", error);
    if (error.code === "42P01") {
      throw new Error("Messages table doesn't exist. Please run the database setup first.");
    }
    if (error.code === "23503") {
      throw new Error("Invalid application_id. The application may not exist or you don't have permission to message it.");
    }
    throw new Error("Failed to send message: " + error.message);
  }

  console.log("✅ Message sent successfully:", data[0]);
  return data[0];
}

// Get all messages for a specific application
export async function getMessages(token, { application_id }) {
  console.log("📬 Fetching messages for application:", application_id);
  
  // Validate application_id format (should be a positive integer)
  const appId = Number(application_id);
  if (!Number.isInteger(appId) || appId <= 0) {
    console.error("❌ Invalid application_id format:", application_id);
    return [];
  }

  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("application_id", appId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Error fetching messages:", error);
    // If table doesn't exist or other error, return empty array instead of throwing
    if (error.code === "42P01") {
      console.warn("Messages table doesn't exist yet. Returning empty array.");
      return [];
    }
    throw new Error("Failed to fetch messages: " + error.message);
  }

  console.log("📨 Retrieved messages:", data);
  // Ensure we always return an array, even if data is null
  return data || [];
}

// Mark messages as read
export async function markMessagesAsRead(token, { application_id, user_id }) {
  console.log("✅ Marking messages as read for application:", application_id);
  
  // Validate application_id format (should be a positive integer)
  const appId = Number(application_id);
  if (!Number.isInteger(appId) || appId <= 0) {
    console.error("❌ Invalid application_id format:", application_id);
    return [];
  }

  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("application_id", appId)
    .neq("sender_id", user_id)
    .select();

  if (error) {
    console.error("❌ Error marking messages as read:", error);
    return [];
  }

  console.log("✅ Messages marked as read:", data);
  return data;
}

// milestone 9: Polished section headers and empty states across the portal

// milestone 10: Reviewed company metadata presentation and image fallbacks

// milestone 11: Updated application detail cards for clearer review flow

// milestone 22: Reviewed role-based UI states for recruiter and applicant flows

// milestone 25: Updated checklist behavior in post-job publication workflow

// milestone 28: Finished final UX polish and release readiness pass
