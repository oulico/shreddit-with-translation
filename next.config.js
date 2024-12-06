/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    images: {domains: ["avatars.githubusercontent.com", "utfs.io", "lh3.googleusercontent.com"]},

    /** We already do linting and typechecking as separate tasks in CI */
    eslint: {ignoreDuringBuilds: true},
    typescript: {ignoreBuildErrors: true},
};

export default config;
