import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/layout/AppShell";
import { HandTrackingProvider } from "@/components/HandTracking";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AtomicViewer from "./pages/AtomicViewer";
import VirtualLab from "./pages/VirtualLab";
import MoleculeViewer from "./pages/MoleculeViewer";
import CrystalLattice from "./pages/CrystalLattice";
import ElectronicConfig from "./pages/ElectronicConfig";
import AIAssistant from "./pages/AIAssistant";
import Creators from "./pages/Creators";
import QuantumBox from "./pages/simulations/QuantumBox";
import LennardJones from "./pages/simulations/LennardJones";
import DeBroglieScaler from "./pages/simulations/DeBroglieScaler";
import GibbsFreeEnergy from "./pages/simulations/GibbsFreeEnergy";
import IdealVsRealGas from "./pages/simulations/IdealVsRealGas";
import SystemTypes from "./pages/simulations/SystemTypes";
import StateVsPath from "./pages/simulations/StateVsPath";
import CompressibilityFactor from "./pages/simulations/CompressibilityFactor";
import FirstLawCalc from "./pages/simulations/FirstLawCalc";
import MaxwellRelations from "./pages/simulations/MaxwellRelations";
import PESExplorer from "./pages/PESExplorer";
import NotFound from "./pages/NotFound";
import ScientificCalculator from "./components/ScientificCalculator";

const queryClient = new QueryClient();

function GlobalBackground() {
  const location = useLocation();
  if (location.pathname === "/") return null;
  return (
    <div className="fixed inset-0 z-0 pointer-events-none grid-lines-bg [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-50" />
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HandTrackingProvider>
          <GlobalBackground />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/atomic-viewer" element={<AtomicViewer />} />
              <Route path="/virtual-lab" element={<VirtualLab />} />
              <Route path="/molecule" element={<MoleculeViewer />} />
              <Route path="/crystal" element={<CrystalLattice />} />
              <Route path="/config" element={<ElectronicConfig />} />
              <Route path="/ai" element={<AIAssistant />} />
              <Route path="/creators" element={<Creators />} />
            </Route>
            <Route path="/simulations/quantum-box" element={<QuantumBox />} />
            <Route path="/simulations/lennard-jones" element={<LennardJones />} />
            <Route path="/simulations/de-broglie" element={<DeBroglieScaler />} />
            <Route path="/simulations/gibbs-free-energy" element={<GibbsFreeEnergy />} />
            <Route path="/simulations/ideal-vs-real-gas" element={<IdealVsRealGas />} />
            <Route path="/simulations/system-types" element={<SystemTypes />} />
            <Route path="/simulations/state-vs-path" element={<StateVsPath />} />
            <Route path="/simulations/compressibility" element={<CompressibilityFactor />} />
            <Route path="/simulations/first-law" element={<FirstLawCalc />} />
            <Route path="/simulations/maxwell-relations" element={<MaxwellRelations />} />
            <Route path="/pes" element={<PESExplorer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ScientificCalculator />
        </HandTrackingProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
