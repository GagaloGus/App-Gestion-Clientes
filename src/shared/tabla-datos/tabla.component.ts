import {
  Component, Input, Output, EventEmitter, TemplateRef,
  OnInit, OnDestroy, signal, inject, ViewEncapsulation
} from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TablaColumna {
  field: string;
  header: string;
  sortable?: boolean;
  nowrap?: boolean;
  width?: number;
}

export interface TablaAccion {
  tipo: 'detalles' | 'editar' | 'eliminar' | 'custom';
  label?: string;
  title?: string;
  visible?: (row: any) => boolean;
}

@Component({
  selector: 'app-tabla',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabla.component.html',
  styleUrl: './tabla.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class TablaDatosComponent implements OnInit, OnDestroy {

  private document = inject(DOCUMENT);

  @Input() columnas: TablaColumna[] = [];
  @Input() datos: any[] = [];
  @Input() acciones: TablaAccion[] = [
    { tipo: 'detalles' },
    { tipo: 'editar' },
    { tipo: 'eliminar' }
  ];
  @Input() cargando = false;
  @Input() mensajeVacio = 'No hay datos';
  @Input() clickFila = false;
  @Input() hayAcciones = false;
  @Input() columnaOrden: string | null = null;
  @Input() confirmarEliminarTexto = '¿Seguro que quieres eliminar este registro?';
  @Input() cellTemplates: Record<string, TemplateRef<any>> = {};

  @Output() filaClick     = new EventEmitter<any>();
  @Output() detallesClick = new EventEmitter<any>();
  @Output() editarClick   = new EventEmitter<any>();
  @Output() eliminarClick = new EventEmitter<any>();

  // ── Confirmación via portal al body
  filaAEliminar = signal<any | null>(null);
  private overlayEl: HTMLElement | null = null;

  pedirConfirmacion(row: any) {
    this.filaAEliminar.set(row);
    this.montarOverlay();
  }

  private montarOverlay() {
    const overlay = this.document.createElement('div');
    overlay.className = 'tabla-confirm-overlay';
    overlay.innerHTML = `
      <div class="tabla-confirm-box">
        <svg width="32" height="32" viewBox="0 0 16 16" fill="#dc3545">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
        </svg>
        <p class="tabla-confirm-texto">${this.confirmarEliminarTexto}</p>
        <div class="tabla-confirm-acciones">
          <button class="btn btn-outline-secondary btn-sm" id="tabla-confirm-cancelar">Cancelar</button>
          <button class="btn btn-danger btn-sm" id="tabla-confirm-ok">Sí, eliminar</button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.cancelarEliminar();
    });

    overlay.querySelector('#tabla-confirm-cancelar')!
      .addEventListener('click', () => this.cancelarEliminar());

    overlay.querySelector('#tabla-confirm-ok')!
      .addEventListener('click', () => this.confirmarEliminar());

    this.document.body.appendChild(overlay);
    this.overlayEl = overlay;

    requestAnimationFrame(() => overlay.classList.add('tabla-confirm-visible'));
  }

  private desmontar() {
    if (this.overlayEl) {
      this.overlayEl.remove();
      this.overlayEl = null;
    }
  }

  confirmarEliminar() {
    this.eliminarClick.emit(this.filaAEliminar());
    this.filaAEliminar.set(null);
    this.desmontar();
  }

  cancelarEliminar() {
    this.filaAEliminar.set(null);
    this.desmontar();
  }

  // ── Ordenación
  sortCol = signal<string | null>(null);
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

  ngOnDestroy() {
    this.desmontar();
  }
}