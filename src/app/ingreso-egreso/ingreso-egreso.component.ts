import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IngresoEgreso } from './ingreso-egreso.model';
import { IngresoEgresoService } from './ingreso-egreso.service';
import Swal from 'sweetalert2/dist/sweetalert2.all.min';

@Component({
  selector: 'app-ingreso-egreso',
  templateUrl: './ingreso-egreso.component.html',
  styles: []
})
export class IngresoEgresoComponent implements OnInit {

  form: FormGroup;
  tipo = 'ingreso';

  constructor(
    public ingresoEgresoService: IngresoEgresoService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      'descripcion': new FormControl('', Validators.required),
      'monto': new FormControl(0, Validators.min(1))
    });
  }

  crearIngreso() {
    const ingresoEgreso = new IngresoEgreso({...this.form.value, tipo: this.tipo});
    this.ingresoEgresoService.crearIngresoEgreso(ingresoEgreso).then( ()=> {
      Swal.fire({
        title: 'Creado',
        text: ingresoEgreso.descripcion,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    });
    this.form.reset({monto: 0});
  }

}
