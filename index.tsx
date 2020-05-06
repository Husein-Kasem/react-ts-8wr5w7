import React, { Component } from "react";
import { render } from "react-dom";
import Hello from "./Hello";
import "./style.css";
import { data, lines } from "./data";
import StepsChart from "./StepsChart";

interface AppProps {}
interface AppState {
  name: string;
}

const App = () => (
  <div>
    <StepsChart data={data} lines={lines} identifier="chart1" title={"title"} />
  </div>
);

render(<App />, document.getElementById("root"));
