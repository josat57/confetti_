/**
 * Vendor Profile Hooks
 * React Query hooks for vendor profile management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorService, VendorProfile } from "@/services/vendor.service";
import { toast } from "react-toastify";

/**
 * Get vendor profile
 */
export function useVendorProfile() {
  return useQuery({
    queryKey: ["vendor", "profile"],
    queryFn: vendorService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update vendor profile
 */
export function useUpdateVendorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<VendorProfile>) =>
      vendorService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["vendor", "profile"], data);
      queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });
}

/**
 * Upload logo
 */
export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => vendorService.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      toast.success("Logo uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload logo");
    },
  });
}

/**
 * Upload cover image
 */
export function useUploadCoverImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => vendorService.uploadCoverImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      toast.success("Cover image uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to upload cover image"
      );
    },
  });
}

/**
 * Upload media (photo/video)
 */
export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      file,
      metadata,
    }: {
      type: "photo" | "video";
      file: File;
      metadata?: any;
    }) => vendorService.uploadMedia(type, file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      toast.success("Media uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload media");
    },
  });
}

/**
 * Delete media
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      mediaId,
      type,
    }: {
      mediaId: string;
      type: "photo" | "video";
    }) => vendorService.deleteMedia(mediaId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      toast.success("Media deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete media");
    },
  });
}

/**
 * Get profile stats
 */
export function useVendorStats() {
  return useQuery({
    queryKey: ["vendor", "stats"],
    queryFn: vendorService.getProfileStats,
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Update business hours
 */
export function useUpdateBusinessHours() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      hours: Array<{
        day: string;
        open: string;
        close: string;
        closed: boolean;
      }>
    ) => vendorService.updateBusinessHours(hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      toast.success("Business hours updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update business hours"
      );
    },
  });
}

/**
 * Update branding (Professional+)
 */
export function useUpdateBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branding: {
      primaryColor?: string;
      secondaryColor?: string;
      font?: string;
      customCSS?: string;
    }) => vendorService.updateBranding(branding),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", "profile"] });
      toast.success("Branding updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update branding");
    },
  });
}
