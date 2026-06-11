import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import MattersList from "@/pages/matters/index";
import NewMatter from "@/pages/matters/new";
import MatterWorkspace from "@/pages/matters/[id]/workspace";
import MatterOutput from "@/pages/matters/[id]/output";
import { MainLayout } from "@/components/layout/main-layout";

const queryClient = new QueryClient();

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/matters" component={MattersList} />
        <Route path="/matters/new" component={NewMatter} />
        <Route path="/matters/:id" component={MatterWorkspace} />
        <Route path="/matters/:id/output" component={MatterOutput} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
