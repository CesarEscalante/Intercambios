import { Routes, Route } from "react-router-dom";
import CrearGrupo from "./pages/CrearGrupo";
import Grupo from "./pages/Grupo";
import Revelar from "./pages/Revelar";

function App() {
  return (
    <div className="app">
        <Routes>
          <Route path="/" element={<CrearGrupo />} />
          <Route path="/grupo" element={<Grupo />} />
          <Route path="/revelar" element={<Revelar />} />
        </Routes>
    </div>

  );
}

export default App;
