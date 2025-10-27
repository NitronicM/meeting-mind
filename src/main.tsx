import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import AppRouter from "./helpers/AppRouter"

const root = document.getElementById("root") as HTMLElement

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={await AppRouter()} />
    </Routes>
  </BrowserRouter>,
);
