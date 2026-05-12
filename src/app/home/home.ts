import { Component, OnInit, signal } from '@angular/core';
import { Cliente, Tablas } from '../database/tablas.supabase';
import { SupabaseService } from '../database/supabase.service';
import { TablaColumna, TablaDatosComponent } from '../shared/tabla-datos/tabla.component';

@Component({
  selector: 'app-home',
  imports: [TablaDatosComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  constructor(private supabaseService: SupabaseService){}

  ABECEDARIO = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ"
  // -- Signals
  finishedLoading = signal(false);
  clientes = signal<Cliente[]>([])
  clientesFiltrados = signal<Cliente[]>([])

  columnasClientes: TablaColumna[] = [
    { field: 'id', header: 'ID Cliente', sortable: true },
    { field: 'nombre', header: 'Nombre', sortable: true },
    { field: 'apellido1', header: '1er apellido', sortable: true },
    { field: 'apellido2', header: '2do apellido', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'telefono', header: 'Teléfono', sortable: true },
  ]

  errorMsg = signal('');

  filtroLetra(letra:string){
    console.log(`Filtrar por letra -> ${letra}`)
    this.clientesFiltrados.set(
      this.clientes().filter(c => c.nombre[0].toLowerCase() == letra.toLowerCase())
    )
  }


  ngOnInit(): void {
    this.cargarTodo()
  }

  async cargarTodo(){
    this.finishedLoading.set(false)
    await this.cargarClientes()
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
}
