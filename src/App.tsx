import { BrowserRouter, Route, Routes } from "react-router-dom";

import './App.css';
import "@cloudscape-design/global-styles/index.css"

//import TopNav from "./components/Common/TopNav";
import HomePage from "./components/home/HomePage";
import ToDos from "./components/home/ToDos";
import ScaList from "./components/home/ScaList";

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<ScaList />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/todos" element={<ToDos />} />
          <Route path="/scas" element={<ScaList />} />
        </Routes>
      </BrowserRouter>
      
  );
}

export default App;