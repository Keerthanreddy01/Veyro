import Image from "next/image";
import CustomButton from "@/components/StyledLink";
import Section from "@/components/Section";
const SquaredBackground = "/SquaredBackground.png";
interface imgPropProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}
export default function GetStarted() {
  const imgProps: imgPropProps[] = [
    {
      src: "/achievements/G2.svg",
      alt: "Featured on G2",
      width: 75,
      height: 36,
    },
    {
      src: "/achievements/Google.svg",
      alt: "Featured on Google",
      width: 75,
      height: 36,
    },
    {
      src: "/achievements/ProductHunt.svg",
      alt: "Featured on Product Hunt",
      width: 75,
      height: 36,
    },
    {
      src: "/achievements/ProductOfTheDay.svg",
      alt: "Product of the Day",
      width: 122,
      height: 37,
    },
    {
      src: "/achievements/ProductOfTheMonth.svg",
      alt: "Product of the Month",
      width: 122,
      height: 37,
    },
    {
      src: "/achievements/ProductOfTheWeek.svg",
      alt: "Product of the Week",
      width: 122,
      height: 37,
    },
  ];

  return (
    <Section id="get-started">
      <div className="card-shadow  overflow-clip rounded-xl px-1 py-6 md:px-1 md:py-20 bg-white border border-gray relative mt-5 mb-3">
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
          <div className="max-w-[900px] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-7 lg:gap-8">
            {imgProps.map(({ src, alt, width, height }: imgPropProps) => (
              <Image
                key={alt}
                src={src}
                width={width}
                height={height}
                alt={alt}
                className="m-auto"
              />
            ))}
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
