import {type NextRequest} from "next/server";
import {z} from "zod";

import {BowlSubscriptionValidator} from "~/lib/validators/bowl";
import {getServerAuthSession} from "~/server/auth";
import {prisma} from "~/server/db";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerAuthSession();

        // Check if user is signed in
        if (!session?.user) {
            return new Response("Unauthorized", {status: 401});
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const body = await req.json();
        const {bowlId} = BowlSubscriptionValidator.parse(body);

        // Check if user is already subscribed to bowl
        const subscriptionExists = await prisma.subscription.findFirst({
            where: {
                bowlId,
                userId: session.user.id,
            },
        });

        if (subscriptionExists) {
            return new Response("You've already subscribed to this bowl", {
                status: 400,
            });
        }

        // Else, create subscription and associate it with the user
        await prisma.subscription.create({
            data: {
                bowlId,
                userId: session.user.id,
            },
        });

        return new Response(bowlId);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, {status: 400});
        }

        return new Response(
            "Could not subscribe to bowl at this time. Please try again later",
            {status: 500},
        );
    }
}
