import {notFound} from "next/navigation";

import {PostFeed} from "~/components/post/post-feed";
import {INFINITE_SCROLL_PAGINATION_RESULTS} from "~/config";
import {getServerAuthSession} from "~/server/auth";
import {prisma} from "~/server/db";

export async function CustomFeed() {
    const session = await getServerAuthSession();

    // Only rendered if session exists, so this will not happen
    if (!session) return notFound();

    const followedCommunities = await prisma.subscription.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            bowl: true,
        },
    });

    const posts = await prisma.post.findMany({
        where: {
            bowl: {
                name: {
                    in: followedCommunities.map(({bowl}) => bowl.name),
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            votes: true,
            author: true,
            comments: true,
            bowl: true,
        },
        take: INFINITE_SCROLL_PAGINATION_RESULTS,
    });

    return <PostFeed initialPosts={posts}/>;
}
