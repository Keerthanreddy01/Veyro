import Section from "@/components/Section";
import SectionHeader from "@/components/SectionHeader";
import StyledLink from "@/components/StyledLink";
import { cn } from "@/utils/cn";

export default function SchedulingFor({ className }: { className?: string }) {
  const useCases = [
    {
      role: "For Students",
      tag: "Self-Paced Mastery",
      description:
        "Access structured engineering curricula, stream lessons with verified watch auditing, test your skills in proctored assessments, and earn verifiable credentials.",
      cta: "Explore Courses",
      href: "/courses",
      icon: "🎓",
      color: "bg-[#369EFF]/10 text-[#0066cc]",
    },
    {
      role: "For Instructors",
      tag: "Curriculum Studio",
      description:
        "Author comprehensive multi-module courses, create time-limited quizzes, manage draft revisions, and review real-time cohort analytics.",
      cta: "Instructor Studio",
      href: "/instructor/courses/new",
      icon: "👨‍🏫",
      color: "bg-[#ff9447]/10 text-[#d96514]",
    },
    {
      role: "For Organizations",
      tag: "Institutional Integrity",
      description:
        "Train engineering teams and university cohorts with server-authoritative anti-cheat assessments, full-screen lock enforcement, and compliance audit logging.",
      cta: "Create Organization",
      href: "/register",
      icon: "🏛️",
      color: "bg-[#25d0ab]/10 text-[#0d9475]",
    },
  ];

  return (
    <Section id="use-cases">
      <div className={cn("py-8 lg:py-20 px-1 font-matter", className)}>
        <SectionHeader>
          <div className="inline-block py-1 px-3 text-xs font-semibold rounded-full bg-[#e5e7eb] text-[#374151] mb-2">
            Learning Use Cases
          </div>
          <SectionHeader.Title>
            Engineered for every stage of technical education
          </SectionHeader.Title>
          <SectionHeader.Description>
            Tailored workflows for ambitious learners, passionate educators, and academic institutions.
          </SectionHeader.Description>
        </SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {useCases.map((uc) => (
            <div
              key={uc.role}
              className="card-shadow bg-white border border-gray rounded-2xl p-6 flex flex-col justify-between hover:border-black/30 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{uc.icon}</span>
                  <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", uc.color)}>
                    {uc.tag}
                  </span>
                </div>
                <h3 className="font-cal text-2xl text-primary-black mb-2">{uc.role}</h3>
                <p className="text-sm text-[#6f6f6f] leading-relaxed mb-6">{uc.description}</p>
              </div>
              <StyledLink href={uc.href} variant="light" className="w-full text-center text-sm py-2">
                {uc.cta} →
              </StyledLink>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

