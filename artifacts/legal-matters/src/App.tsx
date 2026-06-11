import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useAuth } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import MattersList from "@/pages/matters/index";
import NewMatter from "@/pages/matters/new";
import MatterWorkspace from "@/pages/matters/[id]/workspace";
import MatterOutput from "@/pages/matters/[id]/output";
import { MainLayout } from "@/components/layout/main-layout";
import LandingPage from "@/pages/landing";

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#7C5CBF",
    colorForeground: "#1A1723",
    colorMutedForeground: "#6b7280",
    colorDanger: "#ef4444",
    colorBackground: "#ffffff",
    colorInput: "#f5f3ff",
    colorInputForeground: "#1A1723",
    colorNeutral: "#e5e1f0",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: "0.3rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-xl w-[440px] max-w-full overflow-hidden shadow-xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "font-serif text-[#1A1723]",
    headerSubtitle: "text-[#6b7280]",
    socialButtonsBlockButtonText: "text-[#1A1723]",
    formFieldLabel: "text-[#1A1723]",
    footerActionLink: "text-[#7C5CBF]",
    footerActionText: "text-[#6b7280]",
    dividerText: "text-[#6b7280]",
    identityPreviewEditButton: "text-[#7C5CBF]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-[#1A1723]",
    logoBox: "flex justify-center",
    logoImage: "h-10",
    socialButtonsBlockButton: "border border-[#e5e1f0] bg-white",
    formButtonPrimary: "bg-[#7C5CBF] hover:bg-[#6b4fa8]",
    formFieldInput: "bg-[#f5f3ff] border-[#e5e1f0] text-[#1A1723]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#e5e1f0]",
    alert: "bg-red-50 border-red-200",
    otpCodeFieldInput: "border-[#e5e1f0] bg-[#f5f3ff]",
    formFieldRow: "gap-2",
    main: "gap-4",
  },
};

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/matters" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function AppRoutes() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/matters" component={MattersList} />
        <Route path="/matters/new" component={NewMatter} />
        <Route path="/matters/:id/output">
          {(params) => <ProtectedRoute component={() => <MatterOutput />} />}
        </Route>
        <Route path="/matters/:id" component={MatterWorkspace} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function ClerkLoading() {
  const { isLoaded } = useAuth();
  if (isLoaded) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Sign in to Legalpad" } },
        signUp: { start: { title: "Create your account", subtitle: "Get started with Legalpad" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkLoading />
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/{*rest}">
            <Show when="signed-in">
              <AppRoutes />
            </Show>
            <Show when="signed-out">
              <Redirect to="/" />
            </Show>
          </Route>
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

import React from "react";

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
