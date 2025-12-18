import { BrowserRouter, Routes, Route } from "react-router-dom";
import CrearGrupo from "./pages/CrearGrupo";
import Grupo from "./pages/Grupo";
import Revelar from "./pages/Revelar";

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CrearGrupo />} />
          <Route path="/grupo/:id" element={<Grupo />} />
          <Route path="/revelar/:token" element={<Revelar />} />
        </Routes>
      </BrowserRouter>
    </div>

  );
}

export default App;
