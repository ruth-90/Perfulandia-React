
import axios from 'axios'

// Creamos una instancia de Axios para comunicarnos
// con nuestro microservicio de productos Spring Boot.
const productosApi = axios.create({

  // Dirección base de nuestro backend.
  baseURL: 'http://localhost:8081/api/v1',

  // Tiempo máximo de espera de la solicitud: 10 segundos.
  timeout: 10000,

  // Indicamos que enviaremos y recibiremos datos JSON.
  headers: {
    'Content-Type': 'application/json'
  }
})

// Exportamos la instancia para utilizarla
// desde otros archivos de nuestro frontend.
export { productosApi }
