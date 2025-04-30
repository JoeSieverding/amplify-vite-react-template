import {  Route, Routes } from "react-router-dom";

import './App.css';
import "@cloudscape-design/global-styles/index.css"

//import TopNav from "./components/Common/TopNav";
import HomePage from "./components/home/HomePage";
import ScaList from "./components/home/ScaList";
import ScaDetail from "./components/home/ScaDetail";
import AddSca from "./components/home/AddSca";
import ScaMilestoneList from "./components/home/ScaMilestoneList";
import MilestoneUpdateForm from './components/home/MilestoneUpdateForm';
import ScaImportChatBot from './components/home/ScaImportChatBot';
import ScaAnalyticsChatBot from "./components/home/ScaAnalyticsChatBot";

function App() {

  return (
  
        <Routes>
          <Route path="*" element={<ScaList />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/scas" element={<ScaList />} />
          <Route path="/scadetail" element={<ScaDetail />} />
          <Route path="/addsca" element={<AddSca />} />
          <Route path="/scamilestonelist" element={<ScaMilestoneList />} />
          <Route path="/milestoneupdateform" element={<MilestoneUpdateForm />} />
          <Route path="/scaimportchatbot" element={<ScaImportChatBot />} />
          <Route path="/scaanalyticschatbot" element={<ScaAnalyticsChatBot />} />
        </Routes>

      
  );
}

export default App;