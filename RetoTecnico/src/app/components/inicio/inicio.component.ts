import { Component, NgZone, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {

  constructor(private renderer: Renderer2,
              private zone: NgZone) {

  }

  actualizar(){
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.zone.run(() => {
          this.renderer.setProperty(document.location, 'href', document.location.href);
        });
      }, 500);
    });
  }

}
