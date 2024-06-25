import { Repository } from "../shared/repository.js";
import { TipoEmpleado } from "./tipoEmpleado.entity.js";

const tipoEmpleados: TipoEmpleado[] = [
  new TipoEmpleado(
    '12345678',
    'Juan',
    'Perez',
    '123456789',
    'juan.perez@example.com',
    'Calle Falsa 123',
    '20-12345678-9',
    'jperez',
    'user-jperez-2024-1234-dsw',
  ),
];

export class TipoEmpleadoRepository implements Repository<TipoEmpleado> {
  
  public findAll(): TipoEmpleado[] | undefined {
    return tipoEmpleados;
  }

  public findOne(item: { id: string }): TipoEmpleado | undefined {
    return tipoEmpleados.find((tipoEmpleado) => tipoEmpleado.id === item.id);
  }

  public add(item: TipoEmpleado): TipoEmpleado | undefined {
    tipoEmpleados.push(item);
    return item;
  }

  public update(item: TipoEmpleado): TipoEmpleado | undefined {
    const tipoEmpleadoIdx = tipoEmpleados.findIndex((tipoEmpleado) => tipoEmpleado.id === item.id);

    if (tipoEmpleadoIdx !== -1) {
      tipoEmpleados[tipoEmpleadoIdx] = { ...tipoEmpleados[tipoEmpleadoIdx], ...item };
    }
    return tipoEmpleados[tipoEmpleadoIdx];
  }

  public delete(item: { id: string }): TipoEmpleado | undefined {
    const tipoEmpleadoIdx = tipoEmpleados.findIndex((tipoEmpleado) => tipoEmpleado.id === item.id);

    if (tipoEmpleadoIdx !== -1) {
      const deletedTipoEmpleado = tipoEmpleados[tipoEmpleadoIdx];
      tipoEmpleados.splice(tipoEmpleadoIdx, 1);
      return deletedTipoEmpleado;
    }
  }
}
