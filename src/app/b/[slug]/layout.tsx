import Link from "next/link";
import {notFound} from "next/navigation";
import {format} from "date-fns";

import {JoinLeaveToggle, ToFeedButton} from "~/components";
import {buttonVariants} from "~/components/ui/button";
import {getServerAuthSession} from "~/server/auth";
import {prisma} from "~/server/db";
import type {ReactNode} from "react";

interface LayoutProps {
    children: ReactNode;
    params: { slug: string };
}

export default async function Layout({
                                         children,
                                         params: {slug},
                                     }: LayoutProps) {
    const session = await getServerAuthSession();

    const bowl = await prisma.bowl.findFirst({
        where: {name: slug},
        include: {
            posts: {
                include: {
                    author: true,
                    votes: true,
                },
            },
        },
    });

    const subscription = !session?.user
        ? undefined
        : await prisma.subscription.findFirst({
            where: {
                bowl: {
                    name: slug,
                },
                user: {
                    id: session.user.id,
                },
            },
        });

    const isSubscribed = !!subscription;

    if (!bowl) return notFound();

    const memberCount = await prisma.subscription.count({
        where: {
            bowl: {
                name: slug,
            },
        },
    });

    return (
        <div className="mx-auto h-full max-w-7xl pt-12 sm:container">
            <div>
                <ToFeedButton/>

                <div className="grid grid-cols-1 gap-y-4 py-6 md:grid-cols-3 md:gap-x-4">
                    <ul className="col-span-2 flex flex-col space-y-6">{children}</ul>

                    {/* Info Sidebar */}
                    <div
                        className="order-first h-fit overflow-hidden rounded-lg border border-secondary text-gray-500 dark:text-gray-400 md:order-last">
                        <div className="bg-secondary px-6 py-4">
                            <p className="py-3 font-semibold text-secondary-foreground">
                                About b/{bowl.name}
                            </p>
                        </div>

                        <dl className="divide-y divide-secondary px-6 py-4 text-sm leading-6">
                            <div className="flex justify-between gap-x-4 py-3">
                                <dt>Created</dt>
                                <dd>
                                    <time dateTime={bowl.createdAt.toDateString()}>
                                        {format(bowl.createdAt, "MMMM d, yyyy")}
                                    </time>
                                </dd>
                            </div>

                            <div className="flex justify-between gap-x-4 py-3">
                                <dt>Members</dt>
                                <dd className="flex items-start gap-x-2">
                                    <div>{memberCount}</div>
                                </dd>
                            </div>

                            {bowl.creatorId === session?.user?.id ? (
                                <div className="flex justify-between gap-x-4 py-3">
                                    <dt>You created this community</dt>
                                </div>
                            ) : null}

                            {bowl.creatorId !== session?.user?.id ? (
                                <JoinLeaveToggle
                                    isSubscribed={isSubscribed}
                                    bowlId={bowl.id}
                                    bowlName={bowl.name}
                                />
                            ) : null}

                            <Link
                                href={`${slug}/submit`}
                                className={buttonVariants({
                                    variant: "secondary",
                                    className:
                                        "mb-8 w-full text-secondary-foreground hover:backdrop-brightness-100",
                                })}
                            >
                                Create Post
                            </Link>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
