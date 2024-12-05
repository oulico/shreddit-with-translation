import {type NextRequest} from "next/server";
import {z} from "zod";

import {getServerAuthSession} from "~/server/auth";
import {prisma} from "~/server/db";

export async function GET(req: NextRequest) {
    const url = new URL(req.url);

    const session = await getServerAuthSession();

    let joinedCommunitiesIds: string[] = [];

    if (session) {
        const joinedCommunities = await prisma.subscription.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                bowl: true,
            },
        });

        joinedCommunitiesIds = joinedCommunities.map((sub) => sub.bowl.id);
    }

    try {
        const {limit, page, bowlName} = z
            .object({
                limit: z.string(),
                page: z.string(),
                bowlName: z.string().nullish().optional(),
            })
            .parse({
                bowlName: url.searchParams.get("bowlName"),
                limit: url.searchParams.get("limit"),
                page: url.searchParams.get("page"),
            });

        let whereClause = {};

        // Check if user is browsing a specific bowl, and if not, whether
        // they're logged in (show custom feed) or not (show generic feed)
        if (bowlName) {
            whereClause = {
                bowl: {
                    name: bowlName,
                },
            };
        } else if (session) {
            whereClause = {
                bowl: {
                    id: {
                        in: joinedCommunitiesIds,
                    },
                },
            };
        }

        const posts = await prisma.post.findMany({
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit), // Skip should start from 0 for page 1
            orderBy: {
                createdAt: "desc",
            },
            include: {
                bowl: true,
                votes: true,
                author: true,
                comments: true,
            },
            where: whereClause,
        });

        return new Response(JSON.stringify(posts));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, {status: 400});
        }

        return new Response("Could not fetch posts. Please try again later", {
            status: 500,
        });
    }
}
