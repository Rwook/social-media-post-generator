import { ToastProvider } from "./hooks/useToast";
import { ToastStack } from "./components/ToastStack";
import { GeneratorPage } from "./pages/GeneratorPage";

export default function App() {
  return (
    <ToastProvider>
      <GeneratorPage />
      <ToastStack />
    </ToastProvider>
  );
}
