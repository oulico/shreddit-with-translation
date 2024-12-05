type SiteConfig = {
    name: string;
    url: string;
    description: string;
    creator: string;
    authors: { name: string; url: string }[];
    keywords: string[];
    ogImage?: string;
    links: {
        github: string;
        twitter?: string;
    };
};

export const siteConfig: SiteConfig = {
    name: "Bibim",
    url: "https://bibim.world",
    description: "함께하면 더 나은",
    creator: "Lee Junghyun",
    authors: [{name: "Lee Junghyun", url: "https://bibim.world"}],
};
