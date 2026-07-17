import Image from "next/image";
import clsx from "clsx";

type LogoProps = {
  size?: "sm" | "md" | "lg";
};

export default function Logo({ size = "md" }: LogoProps) {
  const sizes = {
    sm: {
      image: 38,
      text: "text-xl",
    },
    md: {
      image: 48,
      text: "text-2xl",
    },
    lg: {
      image: 62,
      text: "text-4xl",
    },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2 select-none">
      <Image
        src="/logo.png"
        alt="Notera Logo"
        width={s.image}
        height={s.image}
        priority
        className="object-contain"
      />

      <span className={clsx("font-bold tracking-tight text-zinc-900", s.text)}>
        Notera
      </span>
    </div>
  );
}