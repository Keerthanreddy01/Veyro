import SectionHeader from "@/components/SectionHeader";
import RevealOnHover from "./RevealOnHover";
import Label from "./BenefitsIcons/Label";
import BenefitsCard from "./BenefitsCard";
import Section from "@/components/Section";
import AvoidMeetingOverload from "./AvoidMeetingOverload";
import CustomBookingLink from "./CustomBookingLink";
import AutomatedRemainders from "./AutomatedReminders";
import StreamlineBookersExperience from "./StreamlineBookersExperience";

export default function Benefits() {
  const benefitsData = [
    {
      title: "Personalized learning & pacing",
      description:
        "Learn at your own pace with configurable daily goals, automated milestone reminders, and buffer periods between quiz attempts.",
      children: <AvoidMeetingOverload />,
    },
    {
      title: "Verifiable certificates & credentials",
      description:
        "Every completed curriculum issues a tamper-proof PDF credential with public cryptographic SHA-256 validation at veyro.com/verify/...",
      children: <CustomBookingLink />,
    },
    {
      title: "Measurable progress & watch telemetry",
      description:
        "Real-time watch audit streams prevent skipping and ensure at least 90% unique video playback before unlocking exams.",
      children: <AutomatedRemainders />,
    },
    {
      title: "Video lessons & secure assessments",
      description:
        "Seamlessly sync lesson schedules with your calendar, track study hours, and take server-proctored quizzes with focus-loss protection.",
      children: <StreamlineBookersExperience />,
    },
  ];
  return (
    <Section id="benefits">
      <div className="py-6 lg:py-20 px-1 ">
        <div className="flex flex-col items-center">
          <SectionHeader>
            <SectionHeader.Label Icon={<Label />}>Benefits</SectionHeader.Label>
            <SectionHeader.Title>
              The complete distance learning ecosystem
            </SectionHeader.Title>
            <SectionHeader.Description>
              Discover our purpose-built features for students, instructors, and institutions.
            </SectionHeader.Description>
            <SectionHeader.StyledLink
              href="/register"
              className="mt-2"
            >
              Start Learning
            </SectionHeader.StyledLink>
          </SectionHeader>
        </div>
        <div className="grid md:grid-cols-2 gap-10 py-6">
          {benefitsData.map((eachCard, i) => (
            <BenefitsCard key={`benefitsData[${i}]`} {...eachCard} />
          ))}
        </div>
        <div className="text-center -mx-4">
          <SectionHeader>
            <SectionHeader.Title className="my-10">
              …and so much more!
            </SectionHeader.Title>
          </SectionHeader>
          <RevealOnHover />
        </div>
      </div>
    </Section>
  );
}
