import { useEffect, useState } from "react";
import "./App.css";
import logo from "./assets/icon_cosmos.png"

function App() {

  const [text, setText] = useState("");
  const [variables, setVariables] = useState([]);
  const [terminales, setTerminales] = useState([]);
  const [producciones, setProducciones] = useState([]);
  const [gramaticaSinRecursion, setGramaticaSinRecursion] = useState([]);
  const [variablesSinRecursion, setVariablesSinRecursion] = useState([]);

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
    const regexTerminales = /'([^']+)'/g;

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
          const produccionLimpia = produccion.replaceAll("'", " ").trim();

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
    eliminarRecursividadIzquierda(produccionesEncontradas);
  };

  const eliminarRecursividadIzquierda = (listaProd) => {
    /*
      Agrupar producciones por variable
    */
    const agrupadas = {};

    listaProd.forEach((item) => {
      if (!agrupadas[item.variable]) {
        agrupadas[item.variable] = [];
      }
      agrupadas[item.variable].push(item.produccion);
    });

    const resultado = [];
    const listaDeVariables = [];
    /*
      Analizar variable por variable
    */
    Object.keys(agrupadas).forEach((variable) => {
      const listaProducciones = agrupadas[variable];
      const recursivas = [];
      const noRecursivas = [];

      listaProducciones.forEach((prod) => {

        const simbolos = prod.split(" ");

        /*
          ¿Inicia con la misma variable?
        */
        if (simbolos[0] === variable) {
          /*
            Guardar α
          */
          const resto = simbolos.slice(1).join(" ");
          recursivas.push(resto);
        } else {
          noRecursivas.push(prod);
        }
      });

      /*
        Si NO tiene recursividad
      */
      if (recursivas.length === 0) {
        listaProducciones.forEach((prod) => {
          resultado.push({
            variable,
            produccion: prod,
          });
        });
      } else {

        /*
          Crear nueva variable
        */
        const nuevaVariable = `${variable}!`;
        /*
          A :: β A'
        */
        noRecursivas.forEach((beta) => {
          resultado.push({
            variable,
            produccion: `${beta} ${nuevaVariable}`,
          });
        });

        /*
          A' :: α A'
        */
        recursivas.forEach((alpha) => {
          resultado.push({
            variable: nuevaVariable,
            produccion: `${alpha} ${nuevaVariable}`,
          });
        });

        /*
          A' :: ε
        */
        resultado.push({
          variable: nuevaVariable,
          produccion: "ε",
        });
      }
    });
    
    resultado.forEach(gsr =>{
      if(!listaDeVariables.includes(gsr.variable)){
        listaDeVariables.push(gsr.variable)
      }
    })

    setGramaticaSinRecursion(resultado);
    setVariablesSinRecursion(listaDeVariables);
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
    <div>
      <div className="header">
        <div className="icon-box">
          <img src={logo} alt="logo" />
          <h1>Cosmos</h1>
        </div>
        <div>
          <h3>Alvaro Miguel González Hic 9490-22-4805</h3>
        </div>
      </div>
      <hr />
      <div className="container">
        <div className="left-column">

          <div className="editor-header">

            <h2>Entrada (editor de texto)</h2>

            <button
              className="action-button"
              onClick={analizarTexto}
              title="Presiona para ejecutar el programa"
            >
              Ejecutar
            </button>

          </div>

          <textarea
            className="text-editor"
            placeholder="Escribe tu gramática aquí..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />


          <div className="bottom-row">
            <div className="bottom-left-container">
              <div className="bottom-left-container-title">
                <p><b>Vectores</b></p>
                <hr />
              </div>
              <div className="bottom-left">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th><b>V</b></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        variables.map((variable, index) => (
                          <tr key={index}>
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
                        <th><b>T</b></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        terminales.map((terminal, index) => (
                          <tr key={index}>
                            <td>{terminal}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bottom-right-container">
              <div className="bottom-right-container-title">
                <p><b>Matriz de producciones</b></p>
                <hr />
              </div>
              <div className="bottom-right">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th><b>V</b></th>
                        <th><b>Producciones</b></th>
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
        </div>
        <div className="right-column">
          <div className="editor-gramatical">
            <h2>Gramática sin Recursividad por la izquierda</h2>
          </div>
          <textarea
            className="text-editor"
            placeholder=""
            value={            
              variablesSinRecursion.map(vsr =>{
                const produccionesXVariable = gramaticaSinRecursion.filter(gsr => gsr.variable == vsr);
                
                const texto = produccionesXVariable.map(pxv => pxv.produccion.replaceAll(" ", "")).join("|");
              
                return `${vsr.length > 1 ? vsr.trim() : vsr.trim().concat(" ")}:: ${texto}`
              }).join("\n")
            }

          />

          <div className="bottom-row">
            <div className="bottom-left-container">
              <div className="bottom-left-container-title">
                <p><b>Vectores</b></p>
                <hr />
              </div>
              <div className="bottom-left">
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th><b>V</b></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        variablesSinRecursion.map((variable, index) => (
                          <tr key={index}>
                            <td>{variable}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="bottom-right-container">
              <div className="bottom-right-container-title">
                <p><b>Matriz de producciones</b></p>
                <hr />
              </div>
              <div className="bottom-right">
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
                        gramaticaSinRecursion.map(
                          (item, index) => (
                            <tr key={index}>
                              <td>{item.variable}</td>
                              <td>{item.produccion}</td>
                            </tr>
                          )
                        )
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;