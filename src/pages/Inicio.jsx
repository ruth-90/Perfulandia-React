import Carrusel from '../components/Carrusel.jsx'
import Beneficios from '../components/Beneficios.jsx'
import '../styles/inicio.css'

export default function Inicio() {
    return (
        <>
            {/* Carrusel principal de Perfulandia */}
            <Carrusel />
            {/* Sección de beneficios */}
            <Beneficios />
        </>
    )
}