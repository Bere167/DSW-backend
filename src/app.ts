import express from "express";
import { tiposclienteRouter } from "./tiposcliente/tiposcliente.routers.js";


const app = express()
app.use(express.json())

app.use('/api/tiposcliente',tiposclienteRouter)

//para cuando el url esta mal escrito
app.use((req, res) => {
  return res.status(404).send({message: 'Ruta no encontrada'})
})

//defino puerto en el que se va a correr el servidor
app.listen(4000,()=>{
  console.log('Server is running on http://localhost:4000/')
})