import { Request, Response, NextFunction } from "express";
import { ProductoRepository } from "./producto.repository.js";
import { Producto } from "./producto.entity.js";

const repository = new ProductoRepository();

function sanitizeProductoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre_prod: req.body.nombre_prod,
    precio: req.body.precio,
    desc_prod: req.body.desc_prod,
    cant_stock: req.body.cant_stock,
    imagen: req.body.imagen,
    id_tipoprod: req.body.id_tipoprod
  };
  // Elimina campos undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

// --- VALIDACIÓN DE CAMPOS OBLIGATORIOS Y TIPOS ---
function validateProductoInput(input: any): string | null {
  if (!input.nombre_prod || typeof input.nombre_prod !== 'string') {
    return 'El nombre del producto es obligatorio y debe ser texto.';
  }
  if (input.precio === undefined || typeof input.precio !== 'number' || input.precio <= 0) {
    return 'El precio es obligatorio y debe ser un número mayor a cero.';
  }
  if (input.id_tipoprod === undefined || typeof input.id_tipoprod !== 'number') {
    return 'El tipo de producto es obligatorio y debe ser un número.';
  }
  if (input.cant_stock !== undefined && (typeof input.cant_stock !== 'number' || input.cant_stock < 0)) {
    return 'El stock debe ser un número igual o mayor a cero.';
  }
  return null;
}


async function findAll(req: Request, res: Response) {
  res.json({ data: await repository.findAll() });
}

async function findOne(req: Request, res: Response) {
  const id = req.params.id;
  const producto = await repository.findOne({ id });
  if (!producto) {
    return res.status(404).send({ message: 'Producto no encontrado' });
  }
  res.json({ data: producto });
}

async function findByName(req: Request, res: Response) {
  const nombre = req.params.nombre;
  const producto = await repository.findByName(nombre);
  if (!producto) {
    return res.status(404).send({ message: 'Producto no encontrado' });
  }
  res.json({ data: producto });
}

async function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput;
  const error = validateProductoInput(input);
  if (error) {
    return res.status(400).send({ message: error });
  }

   // Validar que no exista un producto con el mismo nombre
  const existente = await repository.findByName(input.nombre_prod);
  if (existente) {
    return res.status(409).send({ message: 'Ya existe un producto con ese nombre.' });
  }

  const productoInput = new Producto(
    input.nombre_prod,
    input.precio,
    undefined, // idproducto, lo asigna el repo
    input.desc_prod,
    input.cant_stock,
    input.imagen,
    input.id_tipoprod
  );
   try {
    const producto = await repository.add(productoInput);
    return res.status(201).send({ message: 'Producto creado exitosamente', data: producto });
  } catch (error: any) {
    return res.status(400).send({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
    const id = req.params.id;
    const input = req.body.sanitizedInput;

  // Validar que el producto exista antes de modificar
  const productoActual = await repository.findOne({ id });
  if (!productoActual) {
    return res.status(404).send({ message: 'Producto no encontrado' });
  }

    // Evitar actualizaciones vacías
  if (!input || Object.keys(input).length === 0) {
    return res.status(400).send({ message: 'No se enviaron campos para modificar.' });
  }

    // Validar tipos y valores solo para los campos enviados
  if (input.nombre_prod !== undefined && typeof input.nombre_prod !== 'string') {
    return res.status(400).send({ message: 'El nombre del producto debe ser texto.' });
  }
  if (input.precio !== undefined && (typeof input.precio !== 'number' || input.precio <= 0)) {
    return res.status(400).send({ message: 'El precio debe ser un número mayor a cero.' });
  }
  if (input.id_tipoprod !== undefined && typeof input.id_tipoprod !== 'number') {
    return res.status(400).send({ message: 'El tipo de producto debe ser un número.' });
  }
  if (input.cant_stock !== undefined && (typeof input.cant_stock !== 'number' || input.cant_stock < 0)) {
    return res.status(400).send({ message: 'El stock debe ser un número igual o mayor a cero.' });
  }

    // Validar que el nuevo nombre no esté duplicado
  if (
    input.nombre_prod !== undefined &&
    input.nombre_prod !== productoActual.nombre_prod
  ) {
    const existente = await repository.findByName(input.nombre_prod);
    if (existente && existente.idproducto !== Number(id)) {
      return res.status(409).send({ message: 'Ya existe un producto con ese nombre.' });
    }
  }

    // Validar que el nuevo tipo de producto exista si se modifica
  if (
    input.id_tipoprod !== undefined &&
    input.id_tipoprod !== productoActual.id_tipoprod
  ) {
    if (!(await repository['tipoProductoExists'](input.id_tipoprod))) {
      return res.status(400).send({ message: 'El tipo de producto especificado no existe.' });
    }
  }

  const producto = await repository.update(id, req.body.sanitizedInput);
  return res.status(200).send({ message: 'Producto modificado exitosamente', data: producto });
}

async function remove(req: Request, res: Response) {
  const id = req.params.id;
  // Validar que el producto exista antes de borrar
  const productoActual = await repository.findOne({ id });
  if (!productoActual) {
    return res.status(404).send({ message: 'Producto no encontrado' });
  }
  await repository.delete({ id });
  return res.status(200).send({ message: 'Producto borrado exitosamente' });
}

export { sanitizeProductoInput, findAll, findOne, add, update, remove };