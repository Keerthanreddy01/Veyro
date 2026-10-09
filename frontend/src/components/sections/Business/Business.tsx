import BusinessSlideShow from "./BusinessSlideShow";
import CustomButton from "@/components/StyledLink";
import SectionHeader from "@/components/SectionHeader";
import Section from "@/components/Section";
import Label from "./BusinessIcons/Label";
const Business = () => {
  return (
    <Section id="business">
      <div className="py-6 lg:py-20 md:grid md:grid-cols-2 md:gap-10 space-y-6">
        <div className="flex flex-col justify-end max-lg:items-center">
          <SectionHeader className="md:text-left md:items-start">
            <SectionHeader.Label Icon={<Label />}>Cohort Learning</SectionHeader.Label>
            <SectionHeader.Title>
              Built for instructors, bootcamps and organizations
            </SectionHeader.Title>
            <SectionHeader.Description>
              {
                "Empower your engineering cohorts with structured learning pathways. Author multi-module curricula, enforce 90% video playback milestones, proctor assessments with automated focus checks, and issue cryptographically verifiable credentials."
              }
            </SectionHeader.Description>
          </SectionHeader>
          <CustomButton className="w-fit" href="/register">
            Get Started Free
          </CustomButton>
        </div>
        <BusinessSlideShow />
      </div>
    </Section>
  );
};
export default Business;
