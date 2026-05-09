import Image from "next/image";

interface Props {
  className?: string;
  /**
   * "light" → white logo for dark backgrounds (default)
   * "dark"  → dark/black logo for light backgrounds
   */
  variant?: "dark" | "light";
}

export function AllonsLogo({ className, variant = "light" }: Props) {
  const src = variant === "light" ? "/allons-logo-white.png" : "/allons-logo.png";
  return (
    <Image
      src={src}
      alt="Allons"
      width={420}
      height={150}
      priority
      className={className}
    />
  );
}
