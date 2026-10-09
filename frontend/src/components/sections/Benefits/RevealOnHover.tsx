"use client";
import GridItem from "./GridItem";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import GridItemCover from "./GridItemCover";
interface dataSchema {
  title: string;
  description: string;
  img: string;
}
export default function RevealOnHover() {
  const [data] = useState([
    {
      title: "Monetized courses",
      description:
        "Monetize technical curricula and private mentorship through Stripe integration.",
      img: "bg-AcceptedPayments",
    },
    {
      title: "Veyro Classroom",
      description: "Veyro Classroom is our in-house video learning and streaming platform.",
      img: "bg-BuiltInVideoConferencing",
    },
    {
      title: "Permanent credential links",
      description:
        "Graduates receive a permanent tamper-proof verification link at veyro.com/verify/...",
      img: "bg-ShortBookingLinks",
    },
    {
      title: "Privacy-first proctoring",
      description:
        "Anti-cheat integrity checks respect student privacy while preventing academic dishonesty.",
      img: "bg-PrivacyFirst",
    },
    {
      title: "Global accessibility",
      description:
        "Deliver courses and technical code labs to students worldwide in 65+ languages.",
      img: "bg-65+Languages",
    },
    {
      title: "Embeddable badges",
      description: "Embed verified certificates and progress badges directly onto personal portfolios.",
      img: "bg-EasyEmbeds",
    },
    {
      title: "Developer toolchain",
      description: "Effortlessly connect GitHub, VS Code, and terminal sandboxes.",
      img: "bg-AllYourFavoriteApps ",
    },
    {
      title: "Curriculum builder",
      description: "Customize chapters, lessons, time-limited quizzes, and pass criteria.",
      img: "bg-SimpleCustomization",
    },
  ]);
  const mediaQuery = useMediaQuery<"base" | "sm">(["base", "sm"]);
  const breakPointsMappedToRows = {
    base: 4,
    sm: 2,
  };

  if (typeof mediaQuery != "string") {
    return null;
  }
  const formattedData: dataSchema[][] = Array.from(
    { length: breakPointsMappedToRows[mediaQuery] },
    (_, i) =>
      data.slice(
        i * (data.length / breakPointsMappedToRows[mediaQuery]),
        i * (data.length / breakPointsMappedToRows[mediaQuery]) +
          data.length / breakPointsMappedToRows[mediaQuery]
      )
  );

  return (
    <div className="grid grid-rows-2 border-y border-y-gray divide-y divide-[#c0c2c4] font-matter">
      {formattedData.map((chunk: dataSchema[], i: number) => (
        <div
          key={"chunk-" + i}
          className="flex justify-around max-sm:gap-4 sm:justify-center"
        >
          {chunk.map((eachData: dataSchema) => (
            <GridItemCover key={eachData.title}>
              <GridItem {...eachData} />
            </GridItemCover>
          ))}
        </div>
      ))}
    </div>
  );
}
