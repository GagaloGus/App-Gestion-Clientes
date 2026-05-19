import { Component, Output, EventEmitter, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '@database/supabase.service';
import { Sesion, Tablas } from '@database/tablas.supabase';

@Component({
  selector: 'modal-nueva-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-nueva-sesion.html',
  styleUrl: './modal-nueva-sesion.scss'
})
export class ModalNuevaSesionComponent {

  @Input() idCliente!: number;           // se pasa desde el padre
  @Output() cerrar        = new EventEmitter<void>();
  @Output() sesionCreada  = new EventEmitter<void>(); // para que el padre recargue

  constructor(private supabaseService: SupabaseService) {}

  formData = Sesion.empty();
  enviando   = signal(false);
  errorMsg   = signal('');
  successMsg = signal('');
  errores: Record<string, string> = {};

  private validar(): boolean {
    this.errores = {};
    if (!this.formData.tratamiento?.trim())
      this.errores['tratamiento'] = 'El tratamiento es obligatorio.';
    return Object.keys(this.errores).length === 0;
  }

  async guardar() {
    this.errorMsg.set('');
    this.successMsg.set('');
    if (!this.validar()) return;

    this.enviando.set(true);
    try {
      const payload = new Sesion({
        ...this.formData,
        id_cliente: this.idCliente
      });
      await this.supabaseService.insert(Tablas.SESIONES, payload);
      this.successMsg.set('¡Sesión registrada correctamente!');
      this.sesionCreada.emit();
      setTimeout(() => this.cerrar.emit(), 1200);
    } catch (err: any) {
      this.errorMsg.set('Error al guardar la sesión: ' + err.message);
    } finally {
      this.enviando.set(false);
    }
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('modal-overlay'))
      this.cerrar.emit();
  }
}