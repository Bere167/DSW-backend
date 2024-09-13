create database if not exists tiendaInformatica;

use tiendaInformatica;

## uncomment if you are not using docker
## create user if not exists dsw@'%' identified by 'dsw';
## grant select, update, insert, delete on tiendaInformatica.* to dsw@'%';


create table if not exists `tiendaInformatica`.`tiposEmpleado` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NULL,
  `apellido` VARCHAR(255) NULL,
  //`characterClass` VARCHAR(255) NULL,
  `mail` VARCHAR(255) NULL,
  `domicilio` VARCHAR(255) NULL,
  `tel` INT UNSIGNED NULL,
  `dni_empleado` INT UNSIGNED NULL,
  `cuil` INT UNSIGNED NULL,
  `usuario` VARCHAR(255) NULL,
  PRIMARY KEY (`id`));

create table if not exists `tiendaInformatica`.`tipoEmpleadoEmpleado` (
  `tipoEmpleadoId` INT UNSIGNED NOT NULL,
  `empleadoName` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`tipoEmpleadoId`, `empleadoName`),
  CONSTRAINT `fk_tipoEmpleadoEmpleado_tipoEmpleado`
    FOREIGN KEY (`tipoEmpleadoId`)
    REFERENCES `tiendaInformatica`.`tiposEmpleado` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE);

insert into tiendaInformatica.tiposEmpleado values(1,'Juan Gonzalez','',11,101,11,22);
insert into tiendaInformatica.tipoEmpleadoEmpleado values(1,);
insert into tiendaInformatica.tipoEmpleadoEmpleado values(1,'Death Star');