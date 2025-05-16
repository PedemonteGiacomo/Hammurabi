import React, { useState, useMemo } from "react";
import TopBar from "../components/TopBar";
import HelloWidget from "../components/HelloWidget";
import defaultSchema from "../schema/components/HelloWidget.schema.json";

const HelloPage: React.FC = () => {
  const [json, setJson] = useState<string>(
    JSON.stringify(defaultSchema, null, 2)
  );

  // try‑parse once per keystroke; if JSON is invalid we ignore it
  const override = useMemo(() => {
    try {
      return JSON.parse(json);
    } catch {
      return null; // user is still typing – keep last valid variant
    }
  }, [json]);

  return (
    <>
      <TopBar />
      <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
        {/* 📝 live JSON editor */}
        <textarea
          style={{ flex: 1, minHeight: 400, fontFamily: "monospace" }}
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />

        {/* 👋 preview area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Pass the parsed JSON as a one‑off override if it’s valid */}
          <HelloWidget __override__={override ?? undefined} />
        </div>
      </div>
    </>
  );
};

export default HelloPage;