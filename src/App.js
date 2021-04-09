import './App.css';
import {useEffect, useState} from "react";
import Camera from "./components/Camera";


function App() {

  return (
      <div className={"container-fluid justify-content-center align-content-center align-items-center"} style={{}} >
          <h1 className={"text-center"}>Pulsify</h1>
          <Camera/>
      </div>

  );
}


export default App;
