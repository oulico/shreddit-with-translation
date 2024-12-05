"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {useMutation} from "@tanstack/react-query";
import axios, {AxiosError} from "axios";

import {Button} from "~/components/ui/button";
import {Input} from "~/components/ui/input";
import {toast} from "~/components/ui/use-toast";
import {useCustomToasts} from "~/hooks/use-custom-toasts";
import {type CreateBowlPayload} from "~/lib/validators/bowl";

export default function CreateBowl() {
    const [input, setInput] = useState("");
    const router = useRouter();
    const {loginToast} = useCustomToasts();

    const {mutate: createCommunity, isLoading} = useMutation({
        mutationFn: async () => {
            const payload: CreateBowlPayload = {
                name: input,
            };

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const {data} = await axios.post("/api/bowl", payload);
            return data as string;
        },

        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 409) {
                    return toast({
                        title: "Bowl already exists.",
                        description: "Please choose a different name for your bowl.",
                        variant: "destructive",
                    });
                } else if (err.response?.status === 422) {
                    return toast({
                        title: "Invalid bowl name.",
                        description: "Please choose a name between 3 and 21 letters.",
                        variant: "destructive",
                    });
                } else if (err.response?.status === 401) {
                    return loginToast();
                }
            }

            toast({
                title: "Something went wrong.",
                description: "Could not create bowl. Please try again.",
                variant: "destructive",
            });
        },

        onSuccess: (data) => {
            router.push(`/b/${data}`);
        },
    });

    return (
        <div className="container mx-auto flex h-full max-w-3xl items-center">
            <div className="relative h-fit w-full space-y-6 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Create a Community</h1>
                </div>

                <hr className="h-1"/>

                <div>
                    <p className="pb-2 text-xl font-medium">Name</p>
                    <p className="pb-2 text-sm">
                        Community names (including capitalization) cannot be changed.
                    </p>

                    <div className="relative">
                        <p className="absolute inset-y-0 left-0 grid w-8 place-items-center text-sm font-medium tracking-wider">
                            b/
                        </p>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="pl-6"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        disabled={isLoading}
                        variant="outline"
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>

                    <Button
                        isLoading={isLoading}
                        disabled={input.length === 0}
                        onClick={() => createCommunity()}
                    >
                        Start a Fresh Bowl
                    </Button>
                </div>
            </div>
        </div>
    );
}
