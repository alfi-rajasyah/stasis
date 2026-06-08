export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|manifest.json|sw.js|login).*)"],
};
