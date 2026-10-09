import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import TestimonialsClient from "./TestimonialsClient";
import Label from "./TestimonialsIcons/Label";

export default function Testimonials() {
  return (
    <Section id="testimonials">
      <div className="pt-20 pb-28 space-y-10">
        <SectionHeader>
          <SectionHeader.Label Icon={<Label />}>
            Learner Feedback
          </SectionHeader.Label>
          <SectionHeader.Title>
            Proven by students & instructors
          </SectionHeader.Title>
          <SectionHeader.Description>
            Perspectives from beta cohort learners and educators mastering technical curricula on Veyro (Beta Showcase).
          </SectionHeader.Description>
        </SectionHeader>
        <TestimonialsClient />
      </div>
    </Section>
  );
}
