import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import HowItWorksCard from "./HIWCard";
import ConnectYourCalender from "./ConnectYourCalender";
import SetYourAvailability from "./SetYourAvailability";
import ChooseHowToMeet from "./ChooseHowToMeet";
import EarnCertificateVisual from "./EarnCertificateVisual";
import Label from "./HIWIcons/Label";

const HowItWorks = () => {
  const cards = [
    {
      title: "Discover a course",
      description:
        "Explore accredited technical paths across Full-Stack, Cloud Architecture, AI, and Cybersecurity.",
      children: <ConnectYourCalender />,
    },
    {
      title: "Learn through lessons",
      description:
        "Stream high-definition lectures with granular video watch auditing. 90% unique playback required.",
      children: <SetYourAvailability />,
    },
    {
      title: "Complete assessments",
      description:
        "Take server-authoritative anti-cheat quizzes with automated focus tracking and time limits.",
      children: <ChooseHowToMeet />,
    },
    {
      title: "Earn verified certificates",
      description:
        "Download cryptographic vector PDF credentials backed by public SHA-256 verification codes.",
      children: <EarnCertificateVisual />,
    },
  ];

  return (
    <Section id="how-it-works">
      <div className="py-6 lg:py-20 px-1">
        <SectionHeader>
          <SectionHeader.Label Icon={<Label />}>
            How it works
          </SectionHeader.Label>
          <SectionHeader.Title>
            Your path to verified technical mastery
          </SectionHeader.Title>
          <SectionHeader.Description>
            Four structured steps from curriculum enrollment to industry-recognized credential issuance.
          </SectionHeader.Description>
        </SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((eachCard, i) => (
            <HowItWorksCard
              key={`cards[${i}]`}
              sNo={`0${i + 1}`}
              {...eachCard}
            />
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorks;

