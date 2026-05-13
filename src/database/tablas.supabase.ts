export enum Tablas {
  CLIENTES = 'clientes',
  SESIONES = 'sesiones'
}

export class Sesion{
    id!: number;
    id_cliente!: number | null;
    tratamiento!: string |null;
    notas!: string |null;

    constructor(data: Partial<Sesion> = {}) {
        Object.assign(this, data);
    }

    static empty(): Sesion {
        return new Sesion({});
    }

    nombre_cliente(clientes : Cliente[]): string{
        if(this.id_cliente){
            var c = clientes.find(c => c.id == this.id_cliente)
            if(c) 
                return c.nombreCompleto
            else
                return ""
        }
        else
            return ""
    }
}

export class Cliente {
    id!: number;
    fecha_creacion?: string;
    nombre!: string;
    apellido1!: string;
    apellido2!: string;
    telefono!: string | null;
    correo!: string | null;
    fecha_nacimiento!: string | null;
    notas!: string | null;

    constructor(data: Partial<Cliente> = {}) {
        Object.assign(this, data);
    }

    static empty(): Cliente {
        return new Cliente({});
    }

    get nombreCompleto(): string {
        const res = `${this.nombre ?? ""} ${this.apellido1 ?? ""} ${this.apellido2 ?? ""}`.trim();
        return res
    }
}