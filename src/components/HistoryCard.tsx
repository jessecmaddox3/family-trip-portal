"use client";

import { useState } from "react";
import type { TripHistoryEntry } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { assetPath } from "@/lib/assets";

export default function HistoryCard({
  trip,
  hasTrip,
}: {
  trip: TripHistoryEntry;
  hasTrip: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMeals = trip.meals && trip.meals.length > 0;
  const hasActivities = trip.activities && trip.activities.length > 0;
  const hasDetails =
    hasMeals ||
    hasActivities ||
    trip.golf ||
    trip.notes ||
    trip.traditions?.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sand-100 p-5">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="font-heading text-xl font-bold text-ocean-500">
          {trip.year}
        </h2>
        <div className="flex items-center gap-2">
          {trip.attendeeCount && (
            <span className="text-[10px] bg-ocean-50 text-ocean-400 px-2 py-0.5 rounded-full">
              {trip.attendeeCount.adults + (trip.attendeeCount.kids || 0)}{" "}
              people
            </span>
          )}
          <span className="text-xs text-drift-300">{trip.dates}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs">
          {trip.accommodationType === "house-and-condos" ||
          trip.accommodationType === "house"
            ? "🏠"
            : "🏢"}
        </span>
        <p className="text-sm text-drift-400">{trip.location}</p>
      </div>

      <h3 className="font-heading text-lg text-ocean-500 mb-2">{trip.name}</h3>
      {trip.heroImage && (
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3">
          <Image
            src={assetPath(trip.heroImage)}
            alt={`Illustration for ${trip.name}`}
            fill
            sizes="(max-width:768px) 90vw, 400px"
            className="object-cover"
          />
        </div>
      )}
      {trip.accommodation && (
        <p className="text-sm text-drift-400 mb-2">
          Stay: {trip.accommodation}
        </p>
      )}
      <p className="text-sm text-drift-300 mb-3">{trip.highlight}</p>
      {trip.photoCount !== undefined && (
        <p className="text-xs text-drift-400 mb-3">
          {trip.photoCount} photos in the archive
        </p>
      )}

      {/* Action buttons row */}
      <div className="flex flex-wrap gap-2">
        {hasTrip && (
          <Link
            href={`/trip/${trip.year}`}
            className="text-xs font-medium text-coral-300 hover:text-coral-400 transition-colors"
          >
            View trip details &rarr;
          </Link>
        )}
        {trip.photoAlbumUrl && (
          <a
            href={assetPath(trip.photoAlbumUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-seaglass-400 hover:text-seaglass-500 transition-colors"
          >
            📸 View photos &rarr;
          </a>
        )}
        {hasDetails && (
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="text-xs font-medium text-ocean-400 hover:text-ocean-500 transition-colors ml-auto"
          >
            {expanded ? "Show less" : "More details"}
          </button>
        )}
      </div>

      {/* Expandable details */}
      {expanded && hasDetails && (
        <div className="mt-4 pt-4 border-t border-sand-100 space-y-3">
          {hasMeals && (
            <div>
              <p className="text-xs font-semibold text-drift-400 uppercase tracking-wide mb-1">
                Meals{" "}
                {trip.mealFormat === "competition"
                  ? "(Competition)"
                  : trip.mealFormat === "themed"
                    ? "(Themed Nights)"
                    : ""}
              </p>
              <div className="space-y-0.5">
                {trip.meals!.map((meal, i) => (
                  <p key={i} className="text-xs text-drift-400">
                    <span className="text-drift-300">{meal.night}:</span>{" "}
                    {meal.chefs}
                    {meal.dish && (
                      <span className="text-seaglass-400"> - {meal.dish}</span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}

          {trip.golf && (
            <div>
              <p className="text-xs font-semibold text-drift-400 uppercase tracking-wide mb-1">
                Golf
              </p>
              <p className="text-xs text-drift-400">
                {trip.golf.course}
                {trip.golf.date && ` · ${trip.golf.date}`}
                {trip.golf.players && ` - ${trip.golf.players} players`}
                {trip.golf.costPerPlayer !== undefined &&
                  ` ($${trip.golf.costPerPlayer}/player)`}
              </p>
            </div>
          )}

          {hasActivities && (
            <div>
              <p className="text-xs font-semibold text-drift-400 uppercase tracking-wide mb-1">
                Activities
              </p>
              <div className="flex flex-wrap gap-1">
                {trip.activities!.map((act) => (
                  <span
                    key={act}
                    className="text-[10px] bg-sand-50 text-drift-400 px-2 py-0.5 rounded-full border border-sand-100"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>
          )}

          {trip.traditions && trip.traditions.length > 0 && (
            <p className="text-sm text-drift-400">
              Traditions: {trip.traditions.join(", ")}
            </p>
          )}
          {trip.notes && (
            <p className="text-xs text-drift-300 italic">{trip.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
