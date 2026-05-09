import Image from "next/image";

interface Props {
  className?: string;
}

export function AllonsLogo({ className }: Props) {
  return (
    <Image
      src="/allons-logo-white.png"
      alt="Allons"
      width={420}
      height={150}
      priority
      className={className}
      style={{ height: "auto" }}
    />
  );
}
