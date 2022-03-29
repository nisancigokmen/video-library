import { Route, Routes } from "react-router-dom";
import "./App.css";
import { HomePage } from "./Components/homePage/HomePage";
import { Navbar } from "./Components/navbar/Navbar";
import {Footer } from "./Components/footer/Footer"
import { PageNotFound } from "./Components/pageNotFound/PageNotFound";
function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<HomePage/>}></Route>
        <Route path='*' exact={true} element={<PageNotFound/>} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
