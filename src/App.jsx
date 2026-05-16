import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const [text, setText] = useState("");

  const [variables, setVariables] = useState([]);

  const [terminales, setTerminales] = useState([]);

  const [producciones, setProducciones] = useState([]);

  const analizarTexto = () => {

    const variablesEncontradas = [];

    const regexVariables = /([A-Za-z_][A-Za-z0-9_]*)\s*::/g;

    let matchVariable;

    while ((matchVariable = regexVariables.exec(text)) !== null) {

      const variable = matchVariable[1];

      if (!variablesEncontradas.includes(variable)) {
        variablesEncontradas.push(variable);
      }
    }


    const terminalesEncontradas = [];

    const regexTerminales = /’([^’]+)’/g;

    let matchTerminal;

    while ((matchTerminal = regexTerminales.exec(text)) !== null) {

      const terminal = matchTerminal[1];

      if (!terminalesEncontradas.includes(terminal)) {
        terminalesEncontradas.push(terminal);
      }
    }

    const produccionesEncontradas = [];
    const lineas = text.split("\n");

    lineas.forEach((linea) => {
      const match = linea.match(
        /([A-Za-z_][A-Za-z0-9_]*)\s*::\s*(.+)/
      );

      if (match) {
        const variable = match[1];
        const produccionesTexto = match[2];

        const listaProducciones =produccionesTexto.split("|");

        listaProducciones.forEach((produccion) => {
          const produccionLimpia = produccion.replaceAll("’", " ").trim();

          produccionesEncontradas.push({
            variable: variable,
            produccion: produccionLimpia,
          });
        });
      }
    });


    setVariables(variablesEncontradas);
    setTerminales(terminalesEncontradas);
    setProducciones(produccionesEncontradas);
  };

  useEffect(() => {

    const handleKeyDown = (event) => {

      if (event.key === "F5") {

        event.preventDefault();

        analizarTexto();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };

  }, [text]);

  return (
    <div className="container">

      <div className="left-column">

        <div className="editor-header">

          <h2>Entrada (editor de texto)</h2>

          <button
            className="action-button"
            onClick={analizarTexto}
          >
            F5
          </button>

        </div>

        <textarea
          className="text-editor"
          placeholder="Escribe tu gramática aquí..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="bottom-row">

          <div className="bottom-left">

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Variable</th>
                  </tr>
                </thead>

                <tbody>

                  {
                    variables.map((variable, index) => (
                      <tr>
                        <td>{variable}</td>
                      </tr>
                    ))
                  }

                </tbody>

              </table>

            </div>

            <div className="table-container">
              <table>

                <thead>
                  <tr>
                    <th>Terminal</th>
                  </tr>
                </thead>

                <tbody>

                  {
                    terminales.map((terminal, index) => (
                      <tr>
                        <td>{terminal}</td>
                      </tr>
                    ))
                  }

                </tbody>

              </table>

            </div>

          </div>

         <div className="bottom-right">
          {/* <div className="table-header">
            Matriz de producciones
          </div> */}

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>V</th>
                  <th>Producciones</th>
                </tr>
              </thead>
              <tbody>
                {
                  producciones.map((item, index) => (

                    <tr key={index}>

                      <td>{item.variable}</td>

                      <td>{item.produccion}</td>

                    </tr>

                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
      <div className="right-column">
        <div className="editor-gramatical">
          <h2>Gramática sin Recursividad por la izquierda</h2>
        </div>
        <textarea
          className="text-editor"
          placeholder=""
        />
      </div>
    </div>
  );
}

export default App;