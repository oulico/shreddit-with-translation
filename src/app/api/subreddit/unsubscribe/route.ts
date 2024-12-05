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

        // Check if user is subscribed or not
        const subscriptionExists = await prisma.subscription.findFirst({
            where: {
                bowlId,
                userId: session.user.id,
            },
        });

        if (!subscriptionExists) {
            return new Response(
                "This bowl is missing your flavor!",
                {
                    status: 400,
                },
            );
        }

        // If subscribed, unsubscribe user from bowl
        await prisma.subscription.delete({
            where: {
                userId_bowlId: {
                    bowlId,
                    userId: session.user.id,
                },
            },
        });

        return new Response(bowlId);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, {status: 400});
        }

        return new Response(
            "The bowl isn't ready to let go of your flavor yet. Please try again soon!",
            {status: 500},
        );
    }
}
