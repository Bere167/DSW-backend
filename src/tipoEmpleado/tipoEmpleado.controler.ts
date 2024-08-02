import { Request, Response, NextFunction } from 'express';
import { TipoEmpleadoRepository } from './tipoEmpleado.repository.js';
import { TipoEmpleado } from './tipoEmpleado.entity.js';

const repository = new TipoEmpleadoRepository();

function sanitizeTipoEmpleadoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    dni_empleado: req.body.dni_empleado,
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    tel: req.body.tel,
    mail: req.body.mail,
    domicilio: req.body.domicilio,
    cuil: req.body.cuil,
    usuario: req.body.usuario,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

// Obtener una lista de todos los tipos de empleado
async function findAll(req: Request, res: Response) {
  res.json({ data:  await repository.findAll() });
}

// Obtener un tipo de empleado por id
async function findOne(req: Request, res: Response) {
  const tipoEmpleado = await repository.findOne({ id: req.params.id });
  if (!tipoEmpleado) {
    return res.status(404).send({ message: 'Empleado no encontrado' });
  }
  res.json({ data: tipoEmpleado });
}

// Crear un tipo de empleado
async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput;

  const tipoEmpleadoInput = new TipoEmpleado(
    input.dni_empleado,
    input.nombre,
    input.apellido,
    input.tel,
    input.mail,
    input.domicilio,
    input.cuil,
    input.usuario
  );

  const tipoEmpleado = await repository.add(tipoEmpleadoInput);
  return res.status(201).send({ message: 'Empleado creado exitosamente', data: tipoEmpleado });
}

// Modificar un tipo de empleado (todas las propiedades)
async function update(req: Request, res: Response) {
  const tipoEmpleado = await repository.update(req.params.id, req.body);

  if (!tipoEmpleado) {
    return res.status(404).send({ message: 'Empleado no encontrado' });
  }

  return res.status(200).send({ message: 'Empleado modificado exitosamente', data: tipoEmpleado });
}

// Borrar un tipo de empleado
async function remove(req: Request, res: Response) {
  const id = req.params.id;
  const tipoEmpleado = await repository.delete({ id: req.params.id });

  if (!tipoEmpleado) {
    return res.status(404).send({ message: 'Empleado no encontrado' });
  } else {
    return res.status(200).send({ message: 'Empleado borrado exitosamente' });
  }
}

export { sanitizeTipoEmpleadoInput, findAll, findOne, add, update, remove };
