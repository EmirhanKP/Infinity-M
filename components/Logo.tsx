import Image from "next/image";

export default function Logo({
  className = "h-8 w-8",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/reloop-logo.png"
      alt="Reloop logo"
      className={className}
      width={1254}
      height={1254}
      sizes="40px"
      unoptimized
    />
  );
}
