"use server";

import { createClient } from "@/lib/supabase/server";

export async function createNotification(
  profileId: string,
  type: string,
  title: string,
  message: string | null = null,
  data: any = null
) {
  const supabase = await createClient();
  const { error } = await supabase.from("notifications").insert({
    profile_id: profileId,
    type,
    title,
    message,
    data,
    read: false,
  });

  if (error) {
    console.error("Failed to create notification:", error);
    return false;
  }
  return true;
}

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Failed to mark notification read:", error);
    return false;
  }
  return true;
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("profile_id", user.id)
    .eq("read", false);

  if (error) {
    console.error("Failed to mark all read:", error);
    return false;
  }
  return true;
}
