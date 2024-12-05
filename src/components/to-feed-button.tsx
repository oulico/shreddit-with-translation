"use client";

import {usePathname} from "next/navigation";

import {Icons} from "~/components/icons";
import {buttonVariants} from "./ui/button";

// If path is `/b/mycommunity`, return to `/`
// if path is `/b/mycommunity/post/id`, return to /b/mycommunity
const getBowlPath = (pathname: string) => {
    const splitPath = pathname.split("/");

    if (splitPath.length === 3) return "/";
    else if (splitPath.length > 3) return `/${splitPath[1]}/${splitPath[2]}`;
    // Return default path in case pathname does not match expected format
    else return "/";
};

export function ToFeedButton() {
    const pathname = usePathname();
    const bowlPath = getBowlPath(pathname);

    return (
        <a href={bowlPath} className={buttonVariants({variant: "ghost"})}>
            <Icons.chevronLeft className="mr-1 h-4 w-4"/>
            {bowlPath === "/" ? "Today's Mix" : "Bowl Feed"}
        </a>
    );
}
