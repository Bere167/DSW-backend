import { Router } from 'express';
import { sanitizeTipoEmpleadoInput,findAll, findOne, add, update, remove  } from './tipoEmpleado.controler.js';

const tipoEmpleadoRouter = Router();

tipoEmpleadoRouter.get('/',findAll);

tipoEmpleadoRouter.get('/:id',findOne);

tipoEmpleadoRouter.post('/',sanitizeTipoEmpleadoInput,add);

tipoEmpleadoRouter.put('/:id',update);

tipoEmpleadoRouter.patch('/:id', update)

tipoEmpleadoRouter.delete('/:id',remove);

export default tipoEmpleadoRouter;
