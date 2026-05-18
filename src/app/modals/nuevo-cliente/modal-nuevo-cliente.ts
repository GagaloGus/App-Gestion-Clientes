import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '@database/supabase.service';
import { Cliente, Tablas } from '@database/tablas.supabase';

@Component({
  selector: 'modal-nuevo-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-nuevo-cliente.html',
  styleUrl: './modal-nuevo-cliente.scss'
})
export class ModalNuevoClienteComponent {

  @Output() cerrar        = new EventEmitter<void>();
  @Output() clienteCreado = new EventEmitter<void>(); // para que el padre recargue

  constructor(private supabaseService: SupabaseService) {}

  // ── Estado del formulario
  formData = Cliente.empty();
  enviando  = signal(false);
  errorMsg  = signal('');
  successMsg = signal('');

  // ── Errores de validación por campo
  errores: Record<string, string> = {};

  // ── Validación
  private validar(): boolean {
    this.errores = {};

    if (!this.formData.nombre?.trim())
      this.errores['nombre'] = 'El nombre es obligatorio.';

    // if (this.formData.telefono && !/^\d{9}$/.test(this.formData.telefono.trim()))
    //   this.errores['telefono'] = 'El teléfono debe tener 9 dígitos.';

    if (this.formData.fecha_nacimiento) {
      const fecha = new Date(this.formData.fecha_nacimiento);
      if (isNaN(fecha.getTime()) || fecha > new Date())
        this.errores['fecha_nacimiento'] = 'La fecha de nacimiento no es válida.';
    }

    return Object.keys(this.errores).length === 0;
  }

  // ── Envío
  async guardar() {
    this.errorMsg.set('');
    this.successMsg.set('');

    if (!this.validar()) return;

    this.enviando.set(true);
    try {
      await this.supabaseService.insert(Tablas.CLIENTES, this.formData);
      this.successMsg.set('¡Cliente creado correctamente!');
      this.clienteCreado.emit(); // avisa al padre para recargar la lista
      setTimeout(() => this.cerrar.emit(), 1200); // cierra tras 1.2s
    } catch (err: any) {
      this.errorMsg.set('Error al crear el cliente: ' + err.message);
    } finally {
      this.enviando.set(false);
    }
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay'))
      this.cerrar.emit();
  }
}
