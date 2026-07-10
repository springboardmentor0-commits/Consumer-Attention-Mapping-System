import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasToken =
      typeof window !== "undefined" && window.localStorage.getItem("cams_access_token");
    router.replace(hasToken ? "/dashboard" : "/login");
  }, [router]);

  return null;
}
