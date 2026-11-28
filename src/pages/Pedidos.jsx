import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { productosApi } from '../services/api.js'
import { guardarSesion } from '../services/sesion.js'

const moneda = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

export default function Pedidos({ rol }) {
  const [pedidos, setPedidos] = useState(null)
  const [error, setError] = useState('')
  const [confirmando, setConfirmando] = useState(null)
  const esCliente = rol === 'CLIENTE'

  useEffect(() => {
    const solicitud = new AbortController()
    productosApi.get(esCliente ? '/pedidos/mis-pedidos' : '/pedidos', { signal: solicitud.signal })
      .then(({ data }) => setPedidos(data))
      .catch(fallo => {
        if (solicitud.signal.aborted) return
        if (fallo.response?.status === 401) guardarSesion(null)
        else setError('No se pudieron cargar los pedidos.')
      })
    return () => solicitud.abort()
  }, [esCliente])

  async function confirmar(id) {
    setError('')
    setConfirmando(id)
    try {
      const { data } = await productosApi.put('/pedidos/' + id + '/confirmacion')
      setPedidos(actuales => actuales.map(pedido => pedido.id === id ? data : pedido))
    } catch (fallo) {
      if (fallo.response?.status === 401) guardarSesion(null)
      else setError(fallo.response?.status === 409 ? 'El pedido no se pudo confirmar. Revisa el stock y el estado del pedido.' : 'No se pudo confirmar el pedido.')
    } finally {
      setConfirmando(null)
    }
  }

  return (
    <section className="container py-5">
      <h1>{esCliente ? 'Mis pedidos' : 'Pedidos'}</h1>
      {rol === 'ADMINISTRADOR' && <Link to="/admin">Volver al panel</Link>}
      {error && <p role="alert" className="alert alert-danger mt-3">{error}</p>}
      {!pedidos && !error && <p role="status">Cargando pedidos…</p>}
      {pedidos?.length === 0 && <p>Todavía no hay pedidos.</p>}
      {pedidos?.map(pedido => (
        <details className="border rounded p-3 mt-3" key={pedido.id}>
          <summary>Pedido #{pedido.id} · {pedido.estado} · {moneda.format(pedido.total)}</summary>
          <dl className="mt-3 mb-2">
            <dt>Método de pago</dt><dd>{pedido.metodoPago}</dd>
            <dt>Entrega</dt><dd>{pedido.entrega?.comuna}, {pedido.entrega?.region}</dd>
            <dt>Despacho</dt><dd>{moneda.format(pedido.costoEnvio)}</dd>
          </dl>
          <ul>{pedido.items.map(item => <li key={item.productoId}>{item.nombre} × {item.cantidad}</li>)}</ul>
          {rol === 'ADMINISTRADOR' && pedido.estado === 'PENDIENTE' && (
            <button type="button" className="btn btn-perfulandia" disabled={confirmando !== null} onClick={() => confirmar(pedido.id)}>
              {confirmando === pedido.id ? 'Confirmando…' : 'Confirmar inventario'}
            </button>
          )}
        </details>
      ))}
    </section>
  )
}
