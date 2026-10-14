import Image from "next/image";
import CustomButton from "@/components/StyledLink";
import Section from "@/components/Section";
const SquaredBackground = "/SquaredBackground.png";
export default function GetStarted() {
  return (
    <Section id="get-started">
      <div className="card-shadow overflow-clip rounded-xl px-1 py-8 md:px-1 md:py-20 bg-white border border-gray relative mt-5 mb-3">
        <div className="flex flex-col items-center gap-6 relative z-10 text-center">
          <h1 className="font-cal md:leading-tight text-[35px] md:text-[50px] max-w-xl text-center">
            Learn without limits. Prove what you know.
          </h1>
          <p className="text-[#6b7280] text-sm md:text-base max-w-lg">
            Join ambitious engineers mastering technical skills with video watch auditing,
            proctored assessments, and verifiable PDF credentials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <CustomButton href="/register">Create Free Account</CustomButton>
            <CustomButton variant="light" href="/courses">Browse Course Catalog</CustomButton>
          </div>
        </div>
        <Image
          fill
          src={SquaredBackground}
          alt="Get Started Bg"
          style={{
            objectFit: "cover",
            objectPosition: "left",
            maskImage:
              "radial-gradient(circle, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 80%), linear-gradient(rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 0.7) 100%)",
          }}
        />
      </div>
    </Section>
  );
}
