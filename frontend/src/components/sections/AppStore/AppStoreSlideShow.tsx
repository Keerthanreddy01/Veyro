"use client";
import { useMemo } from "react";
import useToggleState from "@/hooks/useToggleState";
import { AnimatePresence, motion } from "motion/react";
import Image, { StaticImageData } from "next/image";
import CrossSVG from "@/components/CrossSVG";
const GoogleClassroomLogo = "/logos/google-classroom.svg";
const CanvasLogo = "/logos/canvas.svg";
const VSCodeLogo = "/logos/vscode.svg";
const GitHubLogo = "/logos/github.svg";
const DiscordLogo = "/logos/discord.svg";
const NotionLogo = "/logos/notion.svg";
const GoogleDriveLogo = "/logos/google-drive.svg";
const GoogleMeetLogo = "/AppStore/GoogleMeetLogo.png";
const MicrosoftTeamsLogo = "/logos/microsoft-teams.svg";
const ZoomLogo = "/AppStore/ZoomLogo.png";
const GoogleCalenderLogo = "/AppStore/GoogleCalenderLogo.png";
const BlackboardLogo = "/logos/blackboard.svg";
const MoodleLogo = "/logos/moodle.svg";
const QuizletLogo = "/logos/quizlet.svg";
const VeyroLogo = "/logo-veyro.png";

interface imgPropsType {
  width: number;
  height: number;
  alt: string;
  src: string;
}
const imgProps: imgPropsType[] = [
  { width: 42, height: 42, alt: "Canvas LMS", src: CanvasLogo },
  { width: 40, height: 40, alt: "VS Code", src: VSCodeLogo },
  { width: 40, height: 40, alt: "GitHub", src: GitHubLogo },
  { width: 40, height: 40, alt: "Discord", src: DiscordLogo },
  { width: 38, height: 38, alt: "Notion", src: NotionLogo },
  { width: 38, height: 38, alt: "Google Drive", src: GoogleDriveLogo },
  { width: 42, height: 42, alt: "Google Meet", src: GoogleMeetLogo },
  { width: 46, height: 46, alt: "Google Classroom", src: GoogleClassroomLogo },
  { width: 40, height: 40, alt: "Microsoft Teams", src: MicrosoftTeamsLogo },
  { width: 40, height: 40, alt: "Zoom", src: ZoomLogo },
  { width: 38, height: 38, alt: "Google Calendar", src: GoogleCalenderLogo },
  { width: 40, height: 40, alt: "Blackboard", src: BlackboardLogo },
  { width: 38, height: 38, alt: "Moodle", src: MoodleLogo },
  { width: 38, height: 38, alt: "Quizlet", src: QuizletLogo },
  { width: 40, height: 40, alt: "Veyro AI", src: VeyroLogo },
];
export default function AppStoreSlideShow() {
  const { ref, state } = useToggleState<HTMLDivElement>(
    {
      from: 0,
      to: imgProps.length,
    },
    3500
  );

  const filteredImageProps = useMemo(() => {
    const temp: imgPropsType[] = [];
    let i = state;
    while (temp.length < 8) {
      temp.unshift(imgProps[i]);
      i = (i + 1) % imgProps.length;
    }
    return temp;
  }, [state]);
  return (
    <div
      ref={ref}
      aria-hidden
      role="presentation"
      className="[clip-path:inset(2px)] relative grid grid-cols-4 grid-rows-2 divide-x divide-y divide-gray w-full max-w-[450px] aspect-[2] m-10  bg-white overflow-hidden"
    >
      <CrossSVG
        className="absolute rounded-full size-6 border-none"
        style={{
          left: "calc(25% - 12px)",
          top: "calc(50% - 12px)",
        }}
        fill="#ffffff"
      />
      <CrossSVG
        className="absolute rounded-full size-6 border-none"
        style={{ left: "calc(50% - 12px)", top: "calc(50% - 12px)" }}
        fill="#ffffff"
      />
      <CrossSVG
        className="absolute rounded-full size-6 border-none"
        style={{ left: "calc(75% - 12px)", top: "calc(50% - 12px)" }}
        fill="#ffffff"
      />
      <AnimatePresence mode="popLayout">
        {filteredImageProps.map(({ width, height, src, alt }: imgPropsType) => (
          <div key={alt} className="grid place-items-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              layoutId={alt}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ ease: "linear" }}
              className="relative z-20"
            >
              <Image width={width} alt={alt} src={src} height={height} />
            </motion.div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
