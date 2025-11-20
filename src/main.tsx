import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import AppRouter from "./pages/AppRouter";
import AnalyzeAudio from "./pages/AnalyzeAudio/AnalyzeAudio";

const root = document.getElementById("root") as HTMLElement

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<AppRouter/>} />
    </Routes>
  </BrowserRouter>,
);