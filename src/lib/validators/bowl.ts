import {z} from "zod";

export const BowlValidator = z.object({
    name: z.string().min(3).max(21),
});

export const BowlSubscriptionValidator = z.object({
    bowlId: z.string(),
});

export type CreateBowlPayload = z.infer<typeof BowlValidator>;
export type SubscribeToBowlPayload = z.infer<
    typeof BowlSubscriptionValidator
>;
