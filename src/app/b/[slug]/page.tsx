import {notFound} from "next/navigation";

import {MiniCreatePost, PostFeed} from "~/components";
import {INFINITE_SCROLL_PAGINATION_RESULTS} from "~/config";
import {getServerAuthSession} from "~/server/auth";
import {prisma} from "~/server/db";

interface BowlPageProps {
    params: { slug: string };
}

export default async function BowlPage({params}: BowlPageProps) {
    const {slug} = params;

    const session = await getServerAuthSession();

    const bowl = await prisma.bowl.findFirst({
        where: {name: slug},
        include: {
            posts: {
                include: {
                    author: true,
                    comments: true,
                    bowl: true,
                    votes: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: INFINITE_SCROLL_PAGINATION_RESULTS,
            },
        },
    });

    if (!bowl) return notFound();

    return (
        <>
            <h1 className="h-14 text-3xl font-bold md:text-4xl">
                b/{bowl.name}
            </h1>
            <MiniCreatePost session={session}/>
            <PostFeed initialPosts={bowl.posts} bowlName={bowl.name}/>
        </>
    );
}
