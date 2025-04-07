// src/components/InputsPanel.tsx
import React from 'react';

const InputsPanel: React.FC = () => {
  return (
    <section id="inputs">
      <form className="row g-3">
        <div className="col-md-3 input-column">
          <label htmlFor="patientID" className="form-label">
            Patient ID
          </label>
          <input type="text" className="form-control" id="patientID" />
        </div>

        <div className="col-md-3 input-column">
          <label htmlFor="study" className="form-label">
            Study
          </label>
          <input type="text" className="form-control" id="study" />
        </div>

        <div className="col-md-3 input-column">
          <label htmlFor="series" className="form-label">
            Series
          </label>
          <input type="text" className="form-control" id="series" />
        </div>

        <div className="col-md-3 input-column">
          <label htmlFor="instance" className="form-label">
            Instance
          </label>
          <input type="text" className="form-control" id="instance" />
        </div>
      </form>
    </section>
  );
};

export default InputsPanel;
