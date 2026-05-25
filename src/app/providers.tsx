"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { UserProvider } from "@/context/UserContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </UserProvider>
  );
}