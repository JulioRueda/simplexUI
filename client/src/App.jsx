import { useState, useEffect } from 'react'
import { Container, Box, TextField, Slider, Typography, Paper, Stack } from '@mui/material';
import './App.css';
import { BlockMath, InlineMath } from 'react-katex';
//import 'katex/dist/katex.min.css';
import Plot from 'react-plotly.js';

function App() {

  //const backendURL = "http://localhost:8081";
  const backendURL = "https://simplexui-production.up.railway.app";

  const layout = {
    // title: 'Mi Gráfico con Plotly',
    xaxis: {
      title: 'time'
    },
    yaxis: {
      title: 'x'
    },
    // width: 800,
    // height:300,
    margin: {
      l: 60,  // Margen izquierdo
      r: 10,  // Margen derecho
      t: 10,  // Margen superior
      b: 30,  // Margen inferior
    },
    responsive: true,
    autosize: true
  };

// Estado para la matriz de números (2x3 como ejemplo)
const initialMatrix = [
  [1, 2, 3],
  [4, 5, 6],
  [3, 1, 3]
];

const [matrix, setMatrix] = useState(initialMatrix);
const [imageUrl, setImageUrl] = useState(null);
const [data, setData] = useState(
  [
    {
      x: Array.from({ length: 1000 }, (v, i) => i * (50 / 999)),
      y: Array.from({ length: 1000 }, (v, i) => i * (50 / 999)),
      type: 'scatter',
      mode: 'lines',
      marker: { color: 'blue' },
      name:"x1"
    },
    {
      x: Array.from({ length: 1000 }, (v, i) => i * (50 / 999)),
      y: Array.from({ length: 1000 }, (v, i) => i * (50 / 999)),
      type: 'scatter',
      mode: 'lines',
      marker: { color: 'green' },
      name: "x2",
    },
    {
      x: Array.from({ length: 1000 }, (v, i) => i * (50 / 999)),
      y: Array.from({ length: 1000 }, (v, i) => i * (50 / 999)),
      type: 'scatter',
      mode: 'lines',
      marker: { color: 'red' },
      name: "x3"
    }
  ]
);

// Función para manejar cambios en los inputs de la matriz
const handleMatrixChange = (row, col, value) => {
  // Si el valor está vacío, asignamos 0, de lo contrario, convertimos el valor a número
  const newValue = value === '' ? 0 : parseFloat(value);

  // Verificamos si el valor es un número válido
  if (!isNaN(newValue)) {
    const newMatrix = [...matrix];
    newMatrix[row][col] = newValue;
    setMatrix(newMatrix);
  } else {
    // Si no es un número válido, no hacemos nada (o podemos asignar un valor predeterminado como 0)
    console.error('Valor no válido');
  }
};

// Función para manejar el cambio en un deslizador
const handleSliderChange = (row, col, value) => {
  const newMatrix = [...matrix];
  newMatrix[row][col] = parseFloat(value);
  setMatrix(newMatrix);
};

// Función para enviar la matriz al backend
const sendDataToBackend = async (matrixData) => {
  try {
    const response = await fetch(`${backendURL}/generate-graph`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ matrix: matrixData }),
    });

    if (response.ok) {
      const data = await response.blob();
      const imageUrl = URL.createObjectURL(data);
      setImageUrl(imageUrl);
      updateSeries();
    } else {
      console.error('Error en la solicitud:', response.statusText);
    }
  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
  }
};

const updateSeries = async () => {
  try {
    const response = await fetch(`${backendURL}/plot_time`, {
      method: 'GET',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      // body: JSON.stringify({ matrix: matrixData }),
    });
    let jsonData = await response.json(); 
    console.log(jsonData[1])
    
    const newData = data.slice()
    newData[0].y = jsonData[0]
    newData[1].y = jsonData[1]
    newData[2].y = jsonData[2]
    setData(newData);

  } catch (error) {
    console.error('Error al enviar la solicitud:', error);
  }
};

// useEffect para enviar automáticamente la matriz cuando cambie
useEffect(() => {
  if (matrix) {
    // Establecemos un retraso de 200 milisegundos antes de enviar los datos
    const timer = setTimeout(() => {
      sendDataToBackend(matrix);
      updateSeries();
    }, 150); // Espera 100 milisegundos


    // Limpiar el timer cuando el componente se desmonte o cuando `matrix` cambie
    return () => clearTimeout(timer);
  }
}, [matrix]);// Se ejecuta cada vez que `matrix` cambie


return (
  <div className='gridContainer'>
    <div className='cell c1'>
      {/* Sección Izquierda */}
      <Box sx={{width:"100%", height:"100%"}}>
        <Paper elevation={4} sx={{ width:"100%", height: "100%", display:"flex", alignItems:"center"}}>
          <Stack spacing={2}  >
            {/* izq_arriba: Matriz de números con inputs */}
            {matrix.map((row, rowIndex) => (
              <Box key={rowIndex}>
                <Stack direction="row" spacing={1}>
                  {row.map((value, colIndex) => (
                    <Box key={colIndex} flex={1} >
                      {/* Input de número */}
                      <TextField
                          sx={{
                            width: "4em", // Ajusta el ancho de la caja
                            height: "2em", // Ajusta la altura de la caja (puedes reducir este valor si es necesario)
                            fontSize: "20px", // Ajusta el tamaño del texto dentro de la caja
                            '& .MuiInputBase-input': {
                              fontSize: '15px', // Ajusta el tamaño del texto en el campo de entrada
                              height:"10px",
                            },
                            '& .MuiInputLabel-root': {
                              fontSize: '14px', // Ajusta el tamaño del texto de la etiqueta (label)
                            },
                            '& .MuiOutlinedInput-root': {
                              padding: '0px', // Ajusta el padding para hacer la caja más compacta
                            }
                          }}
                        label={`a [${rowIndex + 1}, ${colIndex + 1}]`}
                        type="number"
                        step = "any"
                        value={value}
                        onChange={(e) => handleMatrixChange(rowIndex, colIndex, e.target.value)}
                        variant="outlined"
                      />
                      {/* Deslizador correspondiente a cada número */}
                      <Slider
                       sx={{
                        padding:"0px",
                        width: 100, // Ancho del slider
                        height: 4,  // Altura del rail (línea de fondo)
                        '& .MuiSlider-thumb': {
                          width: 14,  // Tamaño del "thumb" (parte que se mueve)
                          height: 14, // Tamaño del "thumb"
                          backgroundColor: 'steelblue', // Color del thumb
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: 'steelblue', // Color del rail
                        },
                        '& .MuiSlider-track': {
                          backgroundColor: 'steelblue', // Color de la línea activa
                        }
                      }}
                        value={value}
                        min={-10}
                        max={10}
                        step={0.1}
                        onChange={(_, newValue) => handleSliderChange(rowIndex, colIndex, newValue)}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>
    </div>
    <div className='cell c2'>
            {/* Sección Derecha */}
      <Box sx={{width:"100%", height:"100%"}} >
          <Paper elevation={4} sx={{ width: "100%", height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {imageUrl ? (
              <img src={imageUrl} alt="Gráfico generado" style={{ width: '80%', height: 'auto' }} />
            ) : (
              <Typography variant="h5">Simplex del sistema</Typography>
            )}
          </Paper>
      </Box>
    </div>
    <div className='cell c3'>
    <Paper elevation={4} sx={{width:"100%", height:"100%"}}>
        
    </Paper>
    </div>
    <div className='cell c4'>
      <Paper elevation={4} sx={{width:"100%", height:"100%"}}>

      </Paper>
    </div>
    <div className='cell c5'>
      <Paper elevation={4} sx={{width:"100%", height:"100%"}}>
      <Plot 
        data={data}
        layout={layout}
        style={{ width: '100%', height: '100%', backgroundColor: "black" }}
      />
      </Paper>
   
    </div>
  
  </div>
);
}

export default App
