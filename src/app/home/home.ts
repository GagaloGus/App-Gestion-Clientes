import { Component, computed, OnInit, signal } from '@angular/core';
import { NgClass } from "@angular/common";
import { CanvasAnimCirculos } from '@shared/canvas/anim-circulos.canvas';
import { TablaDatosComponent, TablaColumna } from '@shared/tabla-datos/tabla.component';
import { SupabaseService } from '@database/supabase.service';
import { Cliente, Sesion, Tablas } from '@database/tablas.supabase';

@Component({
  selector: 'app-home',
  imports: [TablaDatosComponent, NgClass, CanvasAnimCirculos],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  constructor(private supabaseService: SupabaseService){}
  // -- CLIENTE
  clientes = signal<Cliente[]>([])
  clientesFiltrados = signal<Cliente[]>([])
  clienteSeleccionado = signal<Cliente|null>(null)

  columnasClientes: TablaColumna[] = [
    { field: 'nombre', header: 'Nombre' },
    { field: 'apellido1', header: '1er apellido' },
    { field: 'apellido2', header: '2do apellido' },
    { field: 'telefono', header: 'Teléfono' },
    { field: 'fecha_nacimiento', header: 'Fecha de Nacimiento' },

  ]

  // -- SESIONES
  sesiones = signal<Sesion[]>([])

  columnasSesiones: TablaColumna[] = [
    {field: 'tratamiento', header:'Tratamiento', width:50},
    {field: 'notas', header:'Notas', width:50},
  ]

  sesionesFiltradas = computed(()=>{
    if(!this.clienteSeleccionado())
      return this.sesiones()
    else{
      return this.sesiones().filter(s => s.id_cliente == this.clienteSeleccionado()?.id)
    }
  })

  
  // -- OTRAS
  ABECEDARIO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
  finishedLoading = signal(false);
  finishedLoading_Sesiones = signal(false);
  errorMsg = signal('');
  filtro_letra = "";

  async cambiarFiltroLetra(letra:string){
    this.finishedLoading.set(false)
    if(this.filtro_letra == letra)
      this.filtro_letra = ''
    else
      this.filtro_letra = letra

    console.log(`Filtrar por letra -> ${letra} : ${this.filtro_letra} : ${letra == this.filtro_letra}`)
    this.clientesFiltrados.update(()=>{
      if (this.filtro_letra != '')
        return this.clientes().filter(c => c.nombre[0].toLowerCase() == letra.toLowerCase())
      else
        return this.clientes()
    }

    )
    await delay(50)
    this.finishedLoading.set(true)
  }


  ngOnInit(): void {
    this.cargarTodo()
  }

  async cargarTodo(){
    this.finishedLoading.set(false)
    this.finishedLoading_Sesiones.set(false)

    await this.cargarClientes()
    await this.cargarSesiones()
    this.finishedLoading_Sesiones.set(true)

    this.finishedLoading.set(true)
  }

  async cargarClientes(){
    try {
      const data = await this.supabaseService.getAll(Tablas.CLIENTES, "nombre");
      this.clientes.set(data.map((v: any) => new Cliente(v)));
      this.clientesFiltrados.set(this.clientes())
    } catch (err: any) {
      this.errorMsg.set('Error al cargar clientes: ' + err.message);
      console.error('Error al cargar clientes:', err.message);
    }
  }

  async cargarSesiones(){
    try {
      const data = await this.supabaseService.getAll(Tablas.SESIONES);
      this.sesiones.set(data.map((v: any) => new Sesion(v)));
    } catch (err: any) {
      this.errorMsg.set('Error al cargar sesiones: ' + err.message);
      console.error('Error al cargar sesiones:', err.message);
    }
  }
}

/**
 * En funciones ASYNC detiene durante x milisegundos el flujo de la funcion
 * @param ms milisegundos
 */
function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}