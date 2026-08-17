import { RiCheckDoubleFill } from "@remixicon/react";

export const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <RiCheckDoubleFill className="text-primary" />

      <h1 className="font-semibold text-lg md:text-xl dark:text-white">
        VERIFY
      </h1>
    </div>
  );
};
