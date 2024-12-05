import type {Comment, Post, Bowl, User, Vote} from "@prisma/client";

export type ExtendedPost = Post & {
    author: User;
    comments: Comment[];
    bowl: Bowl;
    votes: Vote[];
};
