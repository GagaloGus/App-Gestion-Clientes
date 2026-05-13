import {
  Component, Input, Output, EventEmitter,
  signal, computed, ContentChildren, QueryList,
  TemplateRef, AfterContentInit,
  input,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TablaColumna {
  field: string;       // campo del objeto
  header: string;      // texto del header
  sortable?: boolean;  // se puede ordenar?
  template?: string;   // nombre de template personalizado (opcional)
  nowrap?:boolean;
  width?:number;
}

export interface TablaAccion {
  tipo: 'detalles' | 'editar' | 'eliminar' | 'custom';
  label?: string;
  title?: string;
  visible?: (row: any) => boolean; // mostrar condicionalmente
}

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.scss'
})
export class TablaDatosComponent implements OnInit {

  @Input() columnas: TablaColumna[] = [];
  @Input() datos: any[] = [];
  @Input() acciones: TablaAccion[] = [
    { tipo: 'detalles' },
    { tipo: 'editar' },
    { tipo: 'eliminar' }
  ];
  @Input() cargando = false;
  @Input() mensajeVacio = 'No hay datos';
  @Input() clickFila = false; // activa onclick en el tr
  @Input() hayAcciones = false;
  @Input() columnaOrden: string | null = null;

  // Templates personalizados por nombre de campo
  @Input() cellTemplates: Record<string, TemplateRef<any>> = {};

  
  @Output() filaClick     = new EventEmitter<any>();
  @Output() detallesClick = new EventEmitter<any>();
  @Output() editarClick   = new EventEmitter<any>();
  @Output() eliminarClick = new EventEmitter<any>();

  // Ordenación
  sortCol = signal<string | null>(this.columnaOrden);
  sortAsc = signal(true);

  ngOnInit() {
    this.sortCol.set(this.columnaOrden);
  }

  toggleSort(col: string) {
    if (this.sortCol() === col) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortCol.set(col);
      this.sortAsc.set(true);
    }
  }

  get datosSorted(): any[] {
    console.log(this.sortCol())
    const col = this.sortCol();
    if (!col) return this.datos;
    const asc = this.sortAsc() ? 1 : -1;
    return [...this.datos].sort((a, b) => {
      const va = a[col] ?? '';
      const vb = b[col] ?? '';
      if (va < vb) return -1 * asc;
      if (va > vb) return 1 * asc;
      return 0;
    });
  }

  sortIcon(col: string): string {
    if (this.sortCol() !== col) return '↕';
    return this.sortAsc() ? '▲' : '▼';
  }

  onFilaClick(row: any) {
    if (this.clickFila) this.filaClick.emit(row);
  }
}