"use client";

import {startTransition} from "react";
import {useRouter} from "next/navigation";
import {useMutation} from "@tanstack/react-query";
import axios, {AxiosError} from "axios";

import {Button} from "~/components/ui/button";
import {useToast} from "~/components/ui/use-toast";
import {useCustomToasts} from "~/hooks/use-custom-toasts";
import {type SubscribeToBowlPayload} from "~/lib/validators/bowl";

interface JoinLeaveToggleProps {
    isSubscribed: boolean;
    bowlId: string;
    bowlName: string;
}

export function JoinLeaveToggle({
                                    isSubscribed,
                                    bowlId,
                                    bowlName,
                                }: JoinLeaveToggleProps) {
    const {toast} = useToast();
    const {loginToast} = useCustomToasts();
    const router = useRouter();

    const {mutate: subscribe, isLoading: isSubLoading} = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToBowlPayload = {
                bowlId,
            };

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const {data} = await axios.post("/api/bowl/subscribe", payload);
            return data as string;
        },

        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast();
                }
            }

            return toast({
                title: "There was a problem.",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        },

        onSuccess: () => {
            startTransition(() => {
                // Refresh the current route and fetch new data from the server
                // without losing client-side browser or React state.
                router.refresh();
            });
            toast({
                title: "Subscribed!",
                description: `You are now subscribed to b/${bowlName}`,
            });
        },
    });

    const {mutate: unsubscribe, isLoading: isUnsubLoading} = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToBowlPayload = {
                bowlId,
            };

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const {data} = await axios.post("/api/bowl/unsubscribe", payload);
            return data as string;
        },
        onError: (err: AxiosError) => {
            toast({
                title: "Error",
                description: err.response?.data as string,
                variant: "destructive",
            });
        },
        onSuccess: () => {
            startTransition(() => {
                // Refresh the current route and fetch new data from the server without
                // losing client-side browser or React state.
                router.refresh();
            });
            toast({
                title: "Unsubscribed!",
                description: `You are now unsubscribed from b/${bowlName}`,
            });
        },
    });

    return isSubscribed ? (
        <Button
            className="mb-4 mt-1 w-full"
            isLoading={isUnsubLoading}
            onClick={() => unsubscribe()}
        >
            Leave Community
        </Button>
    ) : (
        <Button
            className="mb-4 mt-1 w-full"
            isLoading={isSubLoading}
            onClick={() => subscribe()}
        >
            Join Community
        </Button>
    );
}
