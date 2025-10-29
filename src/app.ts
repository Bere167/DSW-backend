import express from "express"
import { corsMiddleware } from "./middleware/cors.js";
import './models/associations.js';
import { tipoproductoRouter} from "./tipoproducto/tipoproducto.routers.js";
import { productoRouter } from "./producto/producto.router.js";
import { usuarioRouter } from "./usuario/usuario.routers.js";
import { productosPedidoRouter } from './productos_pedido/prod_ped.routers.js';
import 'dotenv/config'
import { pedidoRouter } from "./pedido/pedido.routters.js";


const app = express()
app.use(corsMiddleware)

app.use(express.json())


app.use('/api/tipoproducto',tipoproductoRouter)
app.use('/api/producto', productoRouter)
app.use('/api/usuario', usuarioRouter)
app.use('/api/pedido', pedidoRouter)
app.use('/api/productos_pedido', productosPedidoRouter);

//para cuando el url esta mal escrito
app.use((req, res) => {
  return res.status(404).send({message: 'Ruta no encontrada'})
})

//defino puerto en el que se va a correr el servidor
app.listen(4000,()=>{
  console.log('Server is running on http://localhost:4000/')
})