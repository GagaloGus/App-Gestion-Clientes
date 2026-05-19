import { Component, computed, OnInit, signal } from '@angular/core';
import { NgClass } from "@angular/common";
import { CanvasAnimCirculos } from '@shared/canvas/anim-circulos.canvas';
import { TablaDatosComponent, TablaColumna } from '@shared/tabla-datos/tabla.component';
import { SupabaseService } from '@database/supabase.service';
import { Cliente, Sesion, Tablas } from '@database/tablas.supabase';
import { ModalNuevoClienteComponent } from '../modals/nuevo-cliente/modal-nuevo-cliente';
import { ModalNuevaSesionComponent } from '../modals/nueva-sesion/modal-nueva-sesion';

@Component({
  selector: 'app-home',
  imports: [TablaDatosComponent, NgClass, CanvasAnimCirculos, ModalNuevoClienteComponent, ModalNuevaSesionComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  constructor(private supabaseService: SupabaseService) { }

  // ── CLIENTES
  clientes = signal<Cliente[]>([])
  clientesFiltrados = signal<Cliente[]>([])
  clienteSeleccionado = signal<Cliente | null>(null)

  columnasClientes: TablaColumna[] = [
    { field: 'nombre', header: 'Nombre' },
    { field: 'apellido1', header: '1er apellido' },
    { field: 'apellido2', header: '2do apellido' },
    { field: 'telefono', header: 'Teléfono' },
    { field: 'fecha_nacimiento', header: 'Fecha de Nacimiento' },
  ]

  // ── SESIONES
  sesiones = signal<Sesion[]>([])

  columnasSesiones: TablaColumna[] = [
    { field: 'tratamiento', header: 'Tratamiento', width: 50 },
    { field: 'notas', header: 'Notas', width: 50 },
  ]

  sesionesFiltradas = computed(() => {
    if (!this.clienteSeleccionado())
      return this.sesiones()
    else
      return this.sesiones().filter(s => s.id_cliente == this.clienteSeleccionado()?.id)
  })

  // ── MODALS
  showModalNuevoCliente = false;
  showModalNuevaSesion = false;

  // ── OTRAS
  ABECEDARIO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
  finishedLoading = signal(false);
  finishedLoading_Sesiones = signal(false);
  errorMsg = signal('');
  filtro_letra = "";

  ngOnInit(): void {
    this.cargarTodo()
  }

  async cargarTodo() {
    this.finishedLoading.set(false)
    this.finishedLoading_Sesiones.set(false)
    await this.cargarClientes()
    await this.cargarSesiones()
    this.finishedLoading_Sesiones.set(true)
    this.finishedLoading.set(true)
  }

  async cargarClientes() {
    try {
      const data = await this.supabaseService.getAll(Tablas.CLIENTES, "nombre");
      this.clientes.set(data.map((v: any) => new Cliente(v)));

      // Respetar el filtro activo en lugar de resetear siempre al total
      this.clientesFiltrados.set(
        this.filtro_letra !== ''
          ? this.clientes().filter(c => c.nombre[0].toLowerCase() === this.filtro_letra.toLowerCase())
          : this.clientes()
      );
    } catch (err: any) {
      this.errorMsg.set('Error al cargar clientes: ' + err.message);
    }
  }

  async cargarSesiones() {
    try {
      const data = await this.supabaseService.getAll(Tablas.SESIONES);
      this.sesiones.set(data.map((v: any) => new Sesion(v)));
    } catch (err: any) {
      this.errorMsg.set('Error al cargar sesiones: ' + err.message);
    }
  }

  async cambiarFiltroLetra(letra: string) {
    this.finishedLoading.set(false)
    this.filtro_letra = this.filtro_letra === letra ? '' : letra
    this.clientesFiltrados.update(() =>
      this.filtro_letra !== ''
        ? this.clientes().filter(c => c.nombre[0].toLowerCase() === letra.toLowerCase())
        : this.clientes()
    )
    await delay(50)
    this.finishedLoading.set(true)
  }

  // ── Callbacks de modales
  async onClienteCreado() {
    await this.cargarClientes();
  }

  async onSesionCreada() {
    await this.cargarSesiones();
  }

  // ── Eliminar cliente
  async eliminarCliente(cliente: Cliente) {
    try {
      await this.supabaseService.deleteRow(Tablas.CLIENTES, 'id', cliente.id);
      if (this.clienteSeleccionado()?.id === cliente.id)
        this.clienteSeleccionado.set(null);
      await this.cargarClientes();
    } catch (err: any) {
      this.errorMsg.set('Error al eliminar cliente: ' + err.message);
    }
  }

  // ── Eliminar sesion
  async eliminarSesion(sesion: Sesion) {
    try {
      await this.supabaseService.deleteRow(Tablas.SESIONES, 'id', sesion.id);
      await this.cargarSesiones();
    } catch (err: any) {
      this.errorMsg.set('Error al eliminar sesión: ' + err.message);
    }
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}