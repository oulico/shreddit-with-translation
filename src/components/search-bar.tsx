"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import type {Prisma, Bowl} from "@prisma/client";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash.debounce";

import {Icons} from "~/components/icons";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command";
import {useOnClickOutside} from "~/hooks/use-on-click-outside";

export function SearchBar() {
    const [input, setInput] = useState("");
    const commandRef = useRef<HTMLDivElement>(null);

    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setInput("");
    }, [pathname]);

    useOnClickOutside(commandRef, () => {
        setInput("");
    });

    const request = debounce(async () => {
        await refetch();
    }, 1000);

    const debounceRequest = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        request();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {
        data: queryResults,
        // isFetching,
        isFetched,
        refetch,
    } = useQuery({
        queryFn: async () => {
            if (!input) return [];

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const {data} = await axios.get(`/api/search?q=${input}`);

            return data as (Bowl & {
                _count: Prisma.BowlCountOutputType;
            })[];
        },
        queryKey: ["search-query"],
        enabled: false,
    });

    return (
        <Command
            ref={commandRef}
            className="relative z-50 max-w-lg overflow-visible rounded-lg border"
        >
            <CommandInput
                className="border-none outline-none ring-0 focus:border-none focus:outline-none"
                value={input}
                onValueChange={(text) => {
                    setInput(text);
                    debounceRequest();
                }}
                // isLoading={isFetching}
                placeholder="Search communities..."
            />

            {input.length > 0 && (
                <CommandList
                    className="absolute inset-x-0 top-full rounded-b-md bg-white shadow dark:bg-primary-foreground">
                    {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
                    {(queryResults?.length ?? 0) > 0 ? (
                        <CommandGroup heading="Communities">
                            {queryResults?.map((bowl) => (
                                <CommandItem
                                    onSelect={(e) => {
                                        router.push(`/b/${e}`);
                                        router.refresh();
                                    }}
                                    key={bowl.id}
                                    value={bowl.name}
                                >
                                    <Icons.users className="mr-2 h-4 w-4"/>
                                    <a href={`/b/${bowl.name}`}>b/{bowl.name}</a>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null}
                </CommandList>
            )}
        </Command>
    );
}
