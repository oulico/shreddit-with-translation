import {type NextRequest} from "next/server";
import {z} from "zod";

import {BowlValidator} from "~/lib/validators/bowl";
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
        const {name} = BowlValidator.parse(body);

        // Check if bowl already exists
        const bowlExists = await prisma.bowl.findFirst({
            where: {name},
        });

        if (bowlExists) {
            return new Response("This bowl is already being served!", {status: 409});
        }

        // Else, create bowl and associate it with the user
        const bowl = await prisma.bowl.create({
            data: {
                name,
                creatorId: session.user.id,
            },
        });

        // Subscribe creator to be the bowl they create
        await prisma.subscription.create({
            data: {
                userId: session.user.id,
                bowlId: bowl.id,
            },
        });

        return new Response(bowl.name);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, {status: 422});
        }

        return new Response("Could not create bowl. Please try again later.", {
            status: 500,
        });
    }
}
