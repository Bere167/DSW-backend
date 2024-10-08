import mysql from 'mysql2/promise'

//TIPOS DE CLIENTES

db.tiposcliente.insertOne({
    tipoclienteClass: 'Minorista', 
    desctipo: 'Sin compra mínima',
    porcdescuento: 0,
});

db.tiposcliente.insertOne({
    tipoclienteClass: "Mayorista",
    desctipo: "Cliente con compra minima de 10 productos",
    porcdescuento: 0.2
});

// query
db.tiposcliente.find()
db.tiposcliente.find({ tipoclienteClass: 'Mayorista' })
db.tiposcliente.find({ porcdescuento: { $gt: 0.1 } }) //mayor a 0.1
db.tiposcliente.find({ porcdescuento: { $gt: 0.1 } }, { desctipo: 1, tipoclienteClass: 1 }) //digo que atributos quiero ver,el id que es por defecto se incuye igual
db.tiposcliente.find({ porcdescuento: { $gt: 0.1 } }, { desctipo: 1, tipoclienteClass: 1, _id: 0 })//excluyo el id
db.tiposcliente.find({ _id: ObjectId('66ac57ef68d4e068418617bf') }) //change the id according to the autogenerated value

//update
db.tiposcliente.updateOne({ tipoclienteClass: 'Mayorista' }, { $set: { porcdescuento: 0.3 } }) //cambiamos el porcentaje de descuento

//delete
db.tiposcliente.deleteOne({ tipoclienteClass: 'Mayorista' })

//TIPOS DE EMPLEADOS

db.tiposEmpleado.insertOne({
    dni_empleado: '12345678',
    nombre:'Juan',
    apelldio:'Perez',
    tel:'123456789',
    mail:'juan.perez@example.com',
    domicilio:'Calle Falsa 123',
    cuil:'20-12345678-9',
    usurario:'jperez',
})

db.tiposEmpleado.insertOne({
    dni_empleado: '87654321',
    nombre:'Maria',
    apelldio:'Gomez',
    tel:'987654321',
    mail:'maria.gomez@gamil.com',
    domicilio:'Guemes 123',
    cuil:'20-87654321-9',
    usurario:'mgomez',
})

db.tiposEmpleado.find()
db.tiposEmpleado.find({ dni_empleado: '87654321' })
db.tiposEmpleado.find({ _id: ObjectId('66ad34eb3116d4f1eb8617c0') }) //change the id according to the autogenerated value

//update
db.tiposEmpleado.updateOne({ dni_empleado: '87654321' }, { $set: { tel: '9845722' } }) //cambiamos el telefono

//delete
db.tiposEmpleado.deleteOne({ dni_empleado: '87654321' })

//TIPOS DE PRODUCTOS

db.tiposProducto.insertOne({
    name:'Procesador',
    desctipo:'El procesador es la pieza central del rendimiento de los programas.',
})


db.tiposProducto.insertOne({
    name:'Placa de video',
    desctipo:'La placa de video es la encargada de procesar las imágenes que se ven en la pantalla.',
})

db.tiposProducto.find()
db.tiposProducto.find({ name: 'Placa de video' })
db.tiposProducto.find({ _id: ObjectId('66ad34cc3116d4f1eb8617be') }) //change the id according to the autogenerated value

//update
db.tiposProducto.updateOne({ name: 'Placa de video' }, { $set: { desctipo: 'La placa de video es la encargada de procesar las imágenes' } }) //cambiamos la descripción

//delete
db.tiposProducto.deleteOne({ name: 'Placa de video' })