import SectionHeader from "../../SectionHeader";
import AppStoreSlideShow from "./AppStoreSlideShow";
import Section from "../../Section";
import Label from "./AppStoreIcons/Label";
export default function AppStore() {
  return (
    <Section id="app-store">
      <div className="card-shadow py-6 md:py-10 px-1 md:px-8 bg-white mb-1 rounded-xl border border-gray flex flex-col md:flex-row gap-4 md:gap-8 items-center">
        <div>
          <SectionHeader className="md:text-left md:items-start">
            <SectionHeader.Label Icon={<Label />}>
              Architecture
            </SectionHeader.Label>
            <SectionHeader.Title>
              Purpose-built learning infrastructure
            </SectionHeader.Title>
            <SectionHeader.Description>
              Veyro comes pre-engineered with server-authoritative anti-cheat proctoring,
              real-time video watch telemetry, vector PDF certificate generation, and RESTful curriculum APIs.
            </SectionHeader.Description>
            <SectionHeader.StyledLink
              variant="light"
              href="/courses"
              className="mt-4 w-fit py-1 max-md:mx-auto rounded-[16px] bg-gradient-to-b from-[rgba(255,255,255,0.9)]"
            >
              Explore Course Catalog
            </SectionHeader.StyledLink>
          </SectionHeader>
        </div>
        <AppStoreSlideShow />
      </div>
    </Section>
  );
}
