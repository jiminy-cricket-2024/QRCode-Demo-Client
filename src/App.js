import { BrowserRouter, Routes, Route } from "react-router-dom";
import ListView from "./components/list-view/list-view.component";
import CreateQR from "./components/create-qr/create-qr.component";
import Tracker from "./components/tracker/tracker.component";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            <Route path="/track/:id" element={<Tracker />} />
            <Route path="/list" element={<ListView />} />
            <Route path="/" element={<CreateQR />} />
            {/* <Route path="*" element={<NoMatch />} /> */}
          </Routes>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;
