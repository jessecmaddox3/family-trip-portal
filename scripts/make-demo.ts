/** Independently authored fictional case. Never reads an existing trip or private input. */
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  dateLabel,
  datesBetween,
  dayBounds,
  localInstant,
  localDate,
} from "../src/lib/time";
import { buildActivityWindows } from "../src/lib/tides";
import { ruleSchema, tidesSchema } from "../src/lib/schemas";
import type { TidePoint } from "../src/lib/types";
async function main() {
  const destination = process.argv[2];
  if (!destination || process.argv.length !== 3)
    throw new Error("Usage: npx tsx scripts/make-demo.ts NEW-EMPTY-DIRECTORY");
  const root = path.resolve(destination);
  await fs.mkdir(root); // EEXIST protects customized copies.
  async function json(file: string, value: unknown) {
    const target = path.join(root, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(value, null, 2) + "\n", {
      flag: "wx",
    });
  }
  const zone = "America/New_York";
  await json("portal.config.json", {
    brandName: "Cedar Bay Crew",
    title: "Cedar Bay Crew · Family Trip Portal",
    description:
      "A complete fictional trip portal: schedules, shared meals, packing, tide planning and memories.",
    currentYear: 2034,
    historyIntro:
      "An invented tradition, told through three imaginary get-togethers. These are examples you can replace with your own story.",
    footer: "Bring something to share. Leave room for a slow morning.",
    demo: true,
    demoNow: "2034-08-01T12:00:00-04:00",
  });
  const segment = (
    startMinutes: number,
    endMinutes: number,
    quality: "good" | "excellent" | "fair",
    reason: string,
  ) => ({ startMinutes, endMinutes, quality, reason });
  const commonRules = [
    {
      id: "beach",
      activity: "beach",
      label: "Beach picnic",
      anchor: "H",
      segments: [
        segment(
          -120,
          -30,
          "good",
          "An earlier picnic slot in this organizer's example plan.",
        ),
        segment(
          -30,
          30,
          "excellent",
          "The preferred picnic slot, chosen for the group schedule.",
        ),
        segment(30, 60, "good", "An alternate picnic slot."),
      ],
    },
    {
      id: "shelling",
      activity: "shelling",
      label: "Shell sketching",
      anchor: "L",
      segments: [
        segment(
          -90,
          -15,
          "good",
          "Optional sketchbook time before the example low.",
        ),
        segment(
          -15,
          15,
          "excellent",
          "The organizer's preferred sketchbook break.",
        ),
        segment(15, 90, "fair", "A later sketchbook break if lunch runs long."),
      ],
    },
    {
      id: "paddle",
      activity: "kayaking",
      label: "Paddle planning check",
      anchor: "either",
      segments: [
        segment(
          -30,
          30,
          "fair",
          "A reminder to check weather, access and actual currents. Tide height does not predict slack water.",
        ),
      ],
    },
    {
      id: "fishing",
      activity: "fishing",
      label: "Fishing meetup",
      anchor: "H",
      segments: [
        segment(
          -180,
          -60,
          "good",
          "A meetup preference only; check local conditions and rules.",
        ),
      ],
    },
    {
      id: "walk",
      activity: "nature-walk",
      label: "Cedar loop walk",
      anchor: "L",
      selection: "first-per-day",
      anchorHours: [0, 12],
      weekdays: [1, 2, 3, 4, 5, 6],
      openHours: [7, 18],
      segments: [
        segment(
          -60,
          60,
          "good",
          "The invented nature loop is closed Sundays; this example clips to opening hours.",
        ),
      ],
    },
  ];
  for (const year of [2033, 2034]) {
    const start = year === 2034 ? "2034-08-12" : "2033-07-03",
      end = year === 2034 ? "2034-08-16" : "2033-07-06",
      dates = datesBetween(start, end),
      base = `content/trips/${year}`;
    const featured = dates[2];
    const rules = [
      ...commonRules,
      {
        id: "gathering",
        activity: "gathering",
        label: "Lantern story circle",
        anchor: "H",
        selection: "first-per-day",
        anchorHours: [12, 24],
        dates: [featured],
        segments: [
          segment(
            -45,
            90,
            "excellent",
            "An invented story circle. Its time follows this example rule, not a real event.",
          ),
        ],
        url: `/trip/${year}/schedule/`,
      },
    ].map((r) => ruleSchema.parse(r));
    await json(`${base}/trip.json`, {
      year,
      name: `Cedar Bay ${year}`,
      tagline:
        year === 2034
          ? "A little planning. A lot of porch time."
          : "The year of the homemade kites.",
      destination: "Cedar Bay",
      startDate: start,
      endDate: end,
      timeZone: zone,
      checkIn: `${start}T16:00:00-04:00`,
      checkOut: `${end}T10:00:00-04:00`,
      mealIntro:
        "Choose a cooking pair, then keep the menu simple enough to enjoy the evening.",
      mealNotes:
        "The organizer records menus and assignments here. Bring receipts if your own group chooses to split costs.",
      featuredEvent: {
        title: "Lantern story circle",
        description:
          "The fictional crew is bringing a short made-up story to share under paper lanterns. The archive shows how a portal can keep a special gathering beside the schedule.",
        url: "/history/",
      },
      house: {
        name: "Paper Lantern Cottage",
        address:
          "An imaginary cottage in fictional Cedar Bay. No real address or booking.",
        beds: 5,
        maxGuests: 10,
        amenities: [
          "Covered porch",
          "Shared kitchen",
          "Board-game shelf",
          "Outdoor rinse station",
        ],
        rules: [
          "Leave sandy shoes by the door",
          "Label anything in the shared fridge",
          "Keep the porch quiet after 10 PM",
        ],
      },
    });
    await json(
      `${base}/schedule.json`,
      dates.map((d, i) => ({
        date: d,
        dayOfWeek: dateLabel(d, zone, { weekday: "long" }),
        label:
          i === 0
            ? "Arrive and settle in"
            : i === dates.length - 1
              ? "One last breakfast"
              : i === 2
                ? "Stories by lantern light"
                : "Choose your own pace",
        events:
          i === 0
            ? [
                {
                  time: "4:00 PM",
                  title: "Cottage check-in",
                  description: "Find a room and put the kettle on.",
                  location: "Paper Lantern Cottage",
                  type: "travel",
                  highlight: true,
                },
                {
                  time: "6:30 PM",
                  title: "Build-your-own supper",
                  description: "The welcome board is ready in the kitchen.",
                  type: "meal",
                },
              ]
            : i === dates.length - 1
              ? [
                  {
                    time: "8:00 AM",
                    title: "Leftover breakfast",
                    description:
                      "Use what is left and share a favorite imaginary memory.",
                    type: "meal",
                  },
                  {
                    time: "10:00 AM",
                    title: "Check-out",
                    description: "Sweep the porch and close the cottage.",
                    type: "travel",
                    highlight: true,
                  },
                ]
              : [
                  {
                    time: "9:00 AM",
                    title: "Slow morning",
                    description: "Coffee, drawing and an optional wander.",
                    type: "free",
                  },
                  {
                    time: "11:00 AM",
                    title: "Paper kite workshop",
                    description:
                      "Try a new design on the lawn, if conditions suit.",
                    location: "Cottage lawn",
                    type: "activity",
                  },
                  {
                    time: "6:00 PM",
                    title: "Shared dinner",
                    description:
                      "See the meal plan for the cooking team and dietary notes.",
                    type: "meal",
                  },
                  ...(i === 2
                    ? [
                        {
                          time: "After dinner",
                          title: "Lantern story circle",
                          description:
                            "Share an invented story beside the paper lanterns.",
                          type: "ceremony",
                          highlight: true,
                        },
                      ]
                    : []),
                ],
      })),
    );
    const themes = [
      "Welcome board",
      "Garden bowls",
      "Flatbread workshop",
      "Pantry supper",
    ];
    await json(
      `${base}/meals.json`,
      dates
        .slice(0, -1)
        .map((d, i) => ({
          date: d,
          dayOfWeek: dateLabel(d, zone, { weekday: "long" }),
          theme: themes[i],
          chefs:
            i === 2
              ? []
              : [
                  i % 2 ? "Ellis Rowan" : "Noor Vale",
                  i % 2 ? "Quinn Rowan" : "Ari Vale",
                ],
          menu:
            i === 1
              ? ["Roasted vegetables", "Rice and beans", "Lemon dressing"]
              : [
                  "A shared main dish",
                  "Seasonal fruit",
                  "Something crisp and green",
                ],
          dietaryNotes:
            i === 1
              ? [
                  "Keep the dressing separate for the fictional allergy example.",
                ]
              : [],
          headcount: { adults: 6, kids: 2 },
        })),
    );
    await json(`${base}/packing.json`, [
      {
        id: "kite",
        item: "Kite-making supplies",
        category: "Shared fun",
        claimedBy: "Ellis Rowan",
        quantity: 1,
        notes: "Paper, string and washable markers.",
      },
      {
        id: "games",
        item: "Small board games",
        category: "Shared fun",
        quantity: 2,
      },
      {
        id: "towels",
        item: "Beach towels",
        category: "Personal bags",
        quantity: 8,
        notes: "Everyone packs their own.",
      },
      {
        id: "coffee",
        item: "Coffee and tea",
        category: "Kitchen",
        claimedBy: "Noor Vale",
        quantity: 1,
      },
      {
        id: "lanterns",
        item: "Battery paper lanterns",
        category: "Shared fun",
        claimedBy: "Sage Fern",
        quantity: 3,
      },
      {
        id: "first-aid",
        item: "First-aid kit",
        category: "Shared supplies",
        quantity: 1,
      },
    ]);
    await json(`${base}/people.json`, [
      {
        name: "Noor Vale",
        family: "Vale group",
        attendance: "confirmed",
        role: "Welcome board",
        arrivalDate: start,
        departureDate: end,
      },
      {
        name: "Ari Vale",
        family: "Vale group",
        attendance: "confirmed",
        arrivalDate: start,
        departureDate: end,
      },
      {
        name: "Kit Vale",
        family: "Vale group",
        attendance: "confirmed",
        role: "Junior kite tester",
      },
      {
        name: "Ellis Rowan",
        family: "Rowan group",
        attendance: "confirmed",
        role: "Kite workshop",
        arrivalDate: start,
        departureDate: end,
      },
      {
        name: "Quinn Rowan",
        family: "Rowan group",
        attendance: "confirmed",
        dietaryNotes: "Fictional example: dressing served separately.",
      },
      {
        name: "Wren Rowan",
        family: "Rowan group",
        attendance: "confirmed",
        role: "Junior story collector",
      },
      {
        name: "Sage Fern",
        family: "Fern group",
        attendance: "confirmed",
        role: "Lantern setup",
        arrivalDate: start,
        departureDate: end,
      },
      {
        name: "Remy Fern",
        family: "Fern group",
        attendance: "tentative",
        notes: "Waiting on a fictional work schedule.",
      },
    ]);
    await json(`${base}/guide.json`, [
      {
        name: "Harbor Spoon",
        category: "restaurant",
        description: "An invented soup-and-sandwich counter for a rainy lunch.",
        hours: "Example: 11 AM to 3 PM",
        tip: "Replace this entry with a place you have checked.",
      },
      {
        name: "Crescent Cove",
        category: "beach",
        description: "An imaginary shoreline used to demonstrate a beach note.",
        tip: "This demo describes no real access or conditions.",
      },
      {
        name: "Cedar Loop",
        category: "activity",
        description: "An invented short nature loop.",
        hours: "Example: 7 AM to 6 PM, closed Sundays",
      },
      {
        name: "Basket & Branch",
        category: "grocery",
        description: "An invented small shop for the grocery-list example.",
      },
      {
        name: "How this guide works",
        category: "info",
        description:
          "The organizer edits this content file. Optional map, phone, hours and tip fields appear when provided.",
      },
    ]);
    await json(`${base}/photos.json`, [
      {
        type: "photo",
        src: "/media/cedar-bay.png",
        alt: "AI-generated imaginary cove and cottage",
        year,
        caption: "Cedar Bay exists only in this demo.",
        credit: "Generated with ChatGPT; fictional scenery.",
      },
      {
        type: "photo",
        src: "/media/trip-illustration.png",
        alt: "Illustrated trip scrapbook with cottage, calendar and dinner table",
        year,
        caption: "A place for the plan and the memories.",
        credit: "Original ChatGPT-generated project illustration.",
      },
      {
        type: "video",
        src: "/media/lantern-loop.webm",
        poster: "/media/cedar-bay.png",
        captions: "/media/lantern-loop.vtt",
        alt: "A silent original animated color-card demonstration",
        year,
        caption: "A local video example. No family footage.",
        credit: "Original synthetic motion card; silent.",
      },
      ...(year === 2034
        ? [
            {
              type: "album-link",
              alt: "The fictional 2033 album",
              year: 2033,
              caption: "Try linking a previous trip's gallery.",
              externalUrl: "/trip/2033/photos/",
            },
          ]
        : []),
    ]);
    const [first] = dayBounds(start, zone),
      [, last] = dayBounds(end, zone),
      highLow: TidePoint[] = [];
    // Independent analytic toy wave, not a model or copy of any real location's tides.
    const period = 13 * 3600000,
      origin = first + 90 * 60000;
    for (let i = -8; i < 32; i++) {
      const t = origin + (i * period) / 2;
      if (t > last + 2 * 86400000) break;
      highLow.push({
        timestamp: t,
        height: i % 2 === 0 ? 3.6 : -0.4,
        type: i % 2 === 0 ? "H" : "L",
      });
    }
    const source = {
      kind: "fictional" as const,
      description:
        "Invented cosine wave for interface practice. Not predictions for any real place.",
    };
    const tides = tidesSchema.parse({
      station: "Fictional Cedar Bay",
      timeZone: zone,
      units: "ft",
      datum: "fictional zero",
      generated: "2030-01-01T00:00:00Z",
      dateRange: { start, end },
      highLowSource: source,
      curveSource: source,
      curveIntervalMinutes: 15,
      days: dates.map((d, i) => {
        const [a, b] = dayBounds(d, zone);
        return {
          date: d,
          dayOfWeek: dateLabel(d, zone, { weekday: "long" }),
          label: dateLabel(d, zone, { month: "short", day: "numeric" }),
          ...(i === dates.length - 1
            ? {}
            : {
                sunrise: localInstant(d, "06:20", zone),
                sunset: localInstant(d, "19:40", zone),
                moonPhase: "Invented waxing-crescent example",
              }),
          sunSource: {
            kind: i === dates.length - 1 ? "unavailable" : "fictional",
            description:
              i === dates.length - 1
                ? "No sun or moon data in this example day."
                : "Invented sun and moon example, not an astronomical calculation.",
          },
          highLow: highLow.filter((p) => localDate(p.timestamp, zone) === d),
          curve: Array.from(
            { length: Math.ceil((b - a) / 900000) },
            (_, j) => ({
              timestamp: a + j * 900000,
              height: Number(
                (
                  1.6 +
                  2 *
                    Math.cos((2 * Math.PI * (a + j * 900000 - origin)) / period)
                ).toFixed(3),
              ),
            }),
          ),
          activities: buildActivityWindows(d, zone, highLow, rules),
        };
      }),
    });
    await json(`${base}/tides.json`, tides);
    await json(`templates/tide-rules-${year}.json`, rules);
  }
  await json("content/trips/history.json", [
    {
      year: 2034,
      name: "Lantern week",
      dates: "August 12 to 16",
      location: "Fictional Cedar Bay",
      highlight:
        "Paper lanterns, garden bowls and a deliberately slow morning.",
      accommodation: "Paper Lantern Cottage",
      accommodationType: "house",
      attendeeCount: { adults: 6, kids: 2 },
      meals: [
        {
          night: "Welcome",
          chefs: "Noor and Ari",
          dish: "A build-your-own supper",
        },
      ],
      mealFormat: "casual",
      activities: ["Kite workshop", "Story circle"],
      photoAlbumUrl: "/trip/2034/photos/",
      notes: "An independently invented demonstration.",
    },
    {
      year: 2033,
      name: "The kite experiment",
      dates: "July 3 to 6",
      location: "Fictional Cedar Bay",
      highlight: "Most of the kites flew. All of the sandwiches disappeared.",
      accommodation: "Paper Lantern Cottage",
      accommodationType: "house",
      attendeeCount: { adults: 6, kids: 2 },
      meals: [
        {
          night: "Welcome",
          chefs: "Noor and Ari",
          dish: "A shared main dish, fruit and greens",
        },
      ],
      mealFormat: "casual",
      golf: { course: "Imaginary putting lawn", players: 4, costPerPlayer: 0 },
      activities: ["Paper kites", "Porch drawing"],
      photoAlbumUrl: "/trip/2033/photos/",
    },
    {
      year: 2031,
      name: "The first picnic",
      dates: "One imaginary afternoon",
      location: "Fictional Willow Meadow",
      highlight:
        "The crew brought a picnic and invented a reason to do it again.",
      meals: [
        {
          night: "Picnic",
          chefs: "Everyone",
          dish: "Whatever fit in the baskets",
        },
      ],
      mealFormat: "casual",
      notes:
        "This older memory has no detailed trip folder. Its card should not link to a missing year.",
    },
  ]);
  await json("content/trips/traditions.json", [
    {
      id: "lanterns",
      name: "One small story",
      description: "Bring an invented story, or help someone finish theirs.",
      yearsActive: "Fictional tradition since 2031",
      icon: "✨",
      details: "A short story is enough. Passing is always welcome.",
      relatedLink: "/history/",
    },
    {
      id: "sketchbook",
      name: "The porch sketchbook",
      description: "Leave a drawing for the next imaginary guest.",
      yearsActive: "Every example trip",
      icon: "🎨",
    },
    {
      id: "leftovers",
      name: "Last-day breakfast",
      description: "Make the remaining groceries into one shared breakfast.",
      yearsActive: "Whenever the fridge allows",
      icon: "🥣",
    },
  ]);
  await json("content/trips/family-videos.json", {
    intro:
      "A sample archive with a locally stored motion card. No real home movies, people or accounts are included.",
    memorialIntro:
      "This optional section demonstrates a remembrance card using a wholly invented person and story.",
    channel: { name: "the sample video", url: "/media/lantern-loop.webm" },
    playlists: [
      {
        id: "lanterns",
        name: "Lantern workshop",
        person: "The fictional crew",
        relationship: "Shared example",
        videoCount: 1,
        url: "/media/lantern-loop.webm",
      },
    ],
    beachVideos: [
      {
        id: "motion-card",
        title: "The lantern motion card",
        date: "2033-07-04",
        year: 2033,
        url: "/media/lantern-loop.webm",
        thumbnail: "/media/cedar-bay.png",
        people: [],
      },
    ],
    memorial: [
      {
        name: "Mira Meadow",
        relationship: "Invented community storyteller",
        note: "In this fictional example, Mira taught the crew to leave room for an unfinished story.",
        videoCount: 0,
      },
    ],
  });
  console.log(
    `Created wholly fictional content in ${root}. No existing files were read or replaced.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
