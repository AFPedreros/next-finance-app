import { Input } from "@nextui-org/input";
import { cn } from "@nextui-org/theme";
import React from "react";

import { SearchIcon } from "@/components/icons";

type SearchInputProps = React.HTMLAttributes<HTMLDivElement>;

export const SearchInput = ({ className }: SearchInputProps) => {
  return (
    <Input
      aria-label="Search"
      classNames={{
        base: "px-1",
        inputWrapper: cn(
          className,
          "bg-default-400/20 data-[hover=true]:bg-default-500/30 group-data-[focus=true]:bg-default-500/20",
        ),
        input:
          "placeholder:text-default-600 group-data-[has-value=true]:text-foreground",
      }}
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="flex-shrink-0 text-default-600 [&>g]:stroke-[2px]" />
      }
      type="search"
    />
  );
};
