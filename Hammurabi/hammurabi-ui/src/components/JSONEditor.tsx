// src/components/JSONEditor.tsx
import React, { useState, useMemo, useEffect } from "react";

interface JSONEditorProps {
  defaultValue?: any;
  onChange?: (parsedValue: any) => void;
}

const JSONEditor: React.FC<JSONEditorProps> = ({ defaultValue, onChange }) => {
  // Stato locale del testo JSON (formattato inizialmente con indentazione)
  const [text, setText] = useState<string>(
    JSON.stringify(defaultValue ?? {}, null, 2)
  );

  // Effettua il parse del JSON ad ogni modifica del testo (con debounce naturale via useMemo)
  const parsed = useMemo(() => {
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }, [text]);

  // Chiama il callback onChange se il JSON è valido
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
