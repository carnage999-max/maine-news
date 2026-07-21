import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
    pages: {
        signIn: "/admin/login",
    },
});

export const config = {
    matcher: ["/admin/:path*"],
};
