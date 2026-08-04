"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UpdateListingPayload {
  name: string;
  description: string;
  price_per_unit: number;
  unit_type: string;
  quantity: number;
  status: string;
}

export async function updateListing(
  listingId: string,
  payload: UpdateListingPayload
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to edit a listing." };
  }

  const { error } = await supabase
    .from("listings")
    .update({
      name: payload.name.trim(),
      description: payload.description.trim() || null,
      price_per_unit: Number(payload.price_per_unit),
      unit_type: payload.unit_type,
      quantity: Number(payload.quantity),
      status: payload.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", listingId)
    .eq("profile_id", user.id);

  if (error) {
    console.error("Error updating listing:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/my-listings");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { success: true };
}

export async function deleteListing(
  listingId: string
): Promise<{ success: boolean; error?: string; archived?: boolean; message?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to delete a listing." };
  }

  // Attempt hard delete first
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("profile_id", user.id);

  if (error) {
    // If foreign key constraint fails (e.g. existing orders reference this listing), archive it
    if (
      error.code === "23503" ||
      error.message?.toLowerCase().includes("foreign key") ||
      error.message?.toLowerCase().includes("constraint")
    ) {
      const { error: archiveError } = await supabase
        .from("listings")
        .update({ status: "inactive", updated_at: new Date().toISOString() })
        .eq("id", listingId)
        .eq("profile_id", user.id);

      if (archiveError) {
        return { success: false, error: archiveError.message };
      }

      revalidatePath("/my-listings");
      revalidatePath("/marketplace");
      revalidatePath("/dashboard");
      revalidatePath("/profile");

      return {
        success: true,
        archived: true,
        message:
          "This listing is linked to past orders, so it was marked as Inactive to preserve transaction history.",
      };
    }

    console.error("Error deleting listing:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/my-listings");
  revalidatePath("/marketplace");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { success: true, archived: false };
}
