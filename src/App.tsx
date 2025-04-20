import { BrowserRouter, Route, Routes } from "react-router-dom";

import './App.css';
import "@cloudscape-design/global-styles/index.css"

//import TopNav from "./components/Common/TopNav";
import HomePage from "./components/home/HomePage";
import ToDos from "./components/home/ToDos";
import ScaList from "./components/home/ScaList";
import ScaDetail from "./components/home/ScaDetail";
import AddSca from "./components/home/AddSca";

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<ScaList />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/todos" element={<ToDos />} />
          <Route path="/scas" element={<ScaList />} />
          <Route path="/scadetail" element={<ScaDetail />} />
          <Route path="/addsca" element={<AddSca />} />
        </Routes>
      </BrowserRouter>
      
  );
}

export default App;