"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Loader2, MapPin, Star, BadgeCheck, Phone, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { vendorsService } from "@/services/planner/vendors.service";
import VendorBookingForm from "@/components/planner/vendors/VendorBookingForm";
import MessageButton from "@/components/messages/MessageButton";
import type { CreateBookingInput, Vendor } from "@/types/planner";

/** Vendor profile for planners (from the vendor directory "View Profile") */
export default function PlannerVendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const res: any = await vendorsService.getVendor(id);
        if (active) setVendor(res?.data || res?.vendor || null);
        const favs = await vendorsService.getFavorites().catch(() => null);
        if (active && favs?.vendors) setFavorite(favs.vendors.some((v: any) => v._id === id));
      } catch {
        if (active) setVendor(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  async function toggleFavorite() {
    try {
      if (favorite) await vendorsService.removeFromFavorites(id);
      else await vendorsService.addToFavorites(id);
      setFavorite(!favorite);
    } catch {
      toast.error("Couldn't update favourites");
    }
  }

  async function submitBooking(data: CreateBookingInput) {
    try {
      await vendorsService.createBooking(data);
      toast.success("Booking request sent");
      setBooking(false);
      router.push("/planner/dashboard/bookings");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send booking request");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">This vendor couldn't be found.</p>
        <Link href="/planner/dashboard/vendors" className="text-teal-600 hover:underline text-sm">
          Back to the vendor directory
        </Link>
      </div>
    );
  }

  const name = vendor.businessName || vendor.name;
  const city = vendor.address?.city || vendor.location?.city;
  const state = vendor.address?.state || vendor.location?.state;
  const photos: string[] = (vendor.photos || []).map((p: any) => p.url).filter(Boolean);
  const services: Array<{ name: string; description?: string }> = (vendor.services || []).map((s: any) =>
    typeof s === "string" ? { name: s } : s
  );
  const price =
    vendor.priceRange?.min > 0
      ? `₦${Number(vendor.priceRange.min).toLocaleString()}${
          vendor.priceRange.max > vendor.priceRange.min ? ` – ₦${Number(vendor.priceRange.max).toLocaleString()}` : ""
        }`
      : null;

  return (
    <div className="p-6 max-w-4xl space-y-6">
      <Link href="/planner/dashboard/vendors" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-teal-700">
        <ArrowLeft className="w-4 h-4" /> Vendor directory
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {name}
              {vendor.isVerified && <BadgeCheck className="w-5 h-5 text-teal-600" aria-label="Verified" />}
            </h1>
            <p className="text-teal-700 text-sm font-medium mt-1 capitalize">{String(vendor.category || "").replace(/_/g, " ")}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
              {vendor.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {Number(vendor.rating).toFixed(1)} ({vendor.reviewCount || 0})
                </span>
              )}
              {(city || state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {[city, state].filter(Boolean).join(", ")}
                </span>
              )}
              {price && <span>{price}</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border ${
                favorite ? "border-red-200 bg-red-50 text-red-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${favorite ? "fill-red-500" : ""}`} />
              {favorite ? "Saved" : "Save"}
            </button>
            <MessageButton
              participantId={vendor._id}
              subject={`Enquiry for ${name}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-teal-200 text-teal-700 hover:bg-teal-50 disabled:opacity-50"
            />
            <button
              onClick={() => setBooking(true)}
              className="px-4 py-2 rounded-lg text-sm text-white bg-teal-600 hover:bg-teal-700"
            >
              Book
            </button>
          </div>
        </div>

        {vendor.description && <p className="mt-4 text-gray-700 whitespace-pre-line">{vendor.description}</p>}

        {(vendor.phone || vendor.email) && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            {vendor.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" /> {vendor.phone}
              </span>
            )}
            {vendor.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> {vendor.email}
              </span>
            )}
          </div>
        )}
      </div>

      {services.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold mb-3">Services</h2>
          <ul className="space-y-2">
            {services.map((s, i) => (
              <li key={`${s.name}-${i}`} className="text-sm">
                <span className="font-medium text-gray-900">{s.name}</span>
                {s.description && <span className="text-gray-600"> — {s.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {photos.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold mb-3">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.slice(0, 12).map((url) => (
              <img key={url} src={url} alt={name} className="w-full h-32 object-cover rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {booking && (
        <VendorBookingForm
          vendor={{ ...(vendor as Vendor), businessName: name }}
          onSubmit={submitBooking}
          onCancel={() => setBooking(false)}
        />
      )}
    </div>
  );
}
