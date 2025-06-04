// src/components/JSONEditor.tsx
import React, { useState, useMemo, useEffect } from "react";

interface JSONEditorProps {
  defaultValue?: any;
  onChange?: (parsedValue: any) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ defaultValue, onChange }) => {
  // Local state of the JSON text (initially formatted with indentation)
  const [text, setText] = useState<string>(
    JSON.stringify(defaultValue ?? {}, null, 2)
  );

  // Parse the JSON on each text change (naturally debounced via useMemo)
  const parsed = useMemo(() => {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }, [text]);

  // Call the onChange callback if the JSON is valid
  useEffect(() => {
    if (onChange) {
      onChange(parsed);
    }
  }, [parsed, onChange]);

  return (
    <textarea
      style={{ flex: 1, minHeight: "400px", fontFamily: "monospace" }}
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  );
};

export default JSONEditor;
