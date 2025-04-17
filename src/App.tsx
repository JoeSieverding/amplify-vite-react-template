import { BrowserRouter, Route, Routes } from "react-router-dom";

import './App.css';
import "@cloudscape-design/global-styles/index.css"

//import TopNav from "./components/Common/TopNav";
import HomePage from "./components/home/HomePage";
import ToDos from "./components/home/ToDos";

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<HomePage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/todos" element={<ToDos />} />
        </Routes>
      </BrowserRouter>
      
  );
}

export default App;