export enum Tablas {
  CLIENTES = 'clientes'
}

export class Cliente {
    id!: number;
    fecha_creacion?: string;
    nombre!: string;
    apellido1!: string;
    apellido2!: string;
    telefono!: string | null;
    correo!: string | null;

    constructor(data: Partial<Cliente> = {}) {
        Object.assign(this, data);
    }

    static empty(): Cliente {
        return new Cliente({});
    }

    get nombreCompleto(): string | null {
        const res = `${this.nombre ?? ""} ${this.apellido1 ?? ""} ${this.apellido2 ?? ""}`.trim();
        return res == "" ? null : res
    }
}