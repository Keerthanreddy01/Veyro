import * as motion from "motion/react-client";
import Image from "next/image";
import StyledLink from "@/components/StyledLink";
import Section from "@/components/Section";
import HeroClient from "./HeroClient";
import HeroBackground from "./Herobackground";

interface imgPropProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}
const imgProps: imgPropProps[] = [
  {
    src: "/achievements/TrustPilot.svg",
    alt: "Featured on Trust Pilot",
    width: 120,
    height: 54,
  },
  {
    src: "/achievements/ProductHunt.svg",
    alt: "Featured on Product Hunt",
    width: 116,
    height: 54,
  },
  {
    src: "/achievements/G2.svg",
    alt: "Featured on G2",
    width: 112,
    height: 54,
  },
];

export default function Hero() {
  return (
    <Section id="hero">
      <div className="card-shadow p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 mt-[84px] flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center bg-white rounded-2xl border border-gray font-matter overflow-hidden relative">
        {/* Left Column: Text & Primary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: "24px" }}
          animate={{ opacity: 1, y: "0px" }}
          transition={{ ease: "easeOut", duration: 0.5 }}
          className="relative z-10 w-full lg:col-span-6 xl:col-span-5 flex flex-col gap-4 lg:gap-6 max-lg:items-center max-lg:text-center"
        >
          <span className="rounded-full bg-[#f5f5f5] border border-gray font-matter text-[11px] sm:text-[12px] py-1 px-3.5 shadow-xs w-fit text-[#242424] max-lg:mx-auto">
            Veyro — Next-Generation Learning Management System
          </span>
          <h1 className="text-[34px] sm:text-[44px] md:text-[50px] lg:text-[40px] xl:text-[52px] font-cal text-primary-black leading-[1.08] text-balance">
            Learn without limits. Prove what you know.
          </h1>
          <p className="text-[#6B7280] text-sm sm:text-base lg:text-[15px] xl:text-[16px] leading-relaxed max-w-md lg:max-w-lg">
            Accredited technical curricula with 90% real-time video watch progress auditing,
            server-authoritative anti-cheat assessments, and cryptographic completion certificates.
          </p>
          <div className="w-full space-y-3 max-w-[420px] max-lg:mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <StyledLink
                href="/courses"
                className="flex-1"
              >
                <span>Explore Curricula</span>
              </StyledLink>
              <StyledLink
                variant="light"
                href="/register"
                className="flex-1 shadow-none"
              >
                Create Student Account
              </StyledLink>
            </div>
            <p className="text-center sm:text-left text-[#898989] text-[12px] sm:text-[13px]">
              Free enrollment • Verifiable certificates • Anti-cheat proctored
            </p>
          </div>
        </motion.div>

        {/* Right Column: Interactive Student Dashboard Preview */}
        <div className="relative z-20 w-full lg:col-span-6 xl:col-span-7 flex flex-col items-center lg:items-end">
          <div className="w-full max-w-xl lg:max-w-none">
            <HeroClient />
          </div>
          <div className="hidden xl:flex items-center justify-end gap-8 mt-5 px-2 opacity-85">
            {imgProps.map(({ src, width, height, alt }) => (
              <Image
                unoptimized
                key={alt}
                src={src}
                alt={alt}
                width={width}
                height={height}
                style={{
                  width,
                  height,
                }}
              />
            ))}
          </div>
        </div>

        <HeroBackground />
      </div>
    </Section>
  );
}
