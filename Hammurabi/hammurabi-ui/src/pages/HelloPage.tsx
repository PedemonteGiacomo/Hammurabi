import React from "react";
import TopBar from "../components/TopBar";
import HelloWidget from "../components/HelloWidget";

const HelloPage: React.FC = () => (
  <>
    <TopBar />
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <HelloWidget />
    </div>
  </>
);

export default HelloPage;
