"use client";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface Props {
  route: string;
  iconPosition: string;
  imgSrc: string;
  placeholder: string;
  otherClasses: string;
}

const LocalSearchbar = ({
  iconPosition,
  imgSrc,
  otherClasses,
  placeholder,
  route,
}: Props) => {
  return (
    <div
      className={` ${otherClasses} background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4`}
    >
      {iconPosition === "left" && (
        <Image
          src={imgSrc}
          alt="search icon"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}

      <Input
        placeholder={placeholder}
        type="text"
        // value={""}
        // onChange={() => {}}
        className="paragraph-regular no-focus placeholder text-dark400_light700 background-light800_darkgradient border-none shadow-none outline-none "
      />

      {iconPosition === "right" && (
        <Image
          src={imgSrc}
          alt="search icon"
          width={24}
          height={24}
          className="cursor-pointer"
        />
      )}
    </div>
  );
};

export default LocalSearchbar;
