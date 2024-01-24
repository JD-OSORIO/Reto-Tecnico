import { Component, NgZone, OnInit, Renderer2 } from '@angular/core';
import { ApifService } from '../../services/apif.service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.css']
})
export class ApiComponent implements OnInit {

  listaApi: any[] = [];
  preciosSeleccionados: number[] = [];
  dtOptions: DataTables.Settings = {};

  constructor(private apiService: ApifService,
              private renderer: Renderer2,
              private zone: NgZone,
              private clipboardService: ClipboardService) {
  }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 5,
      language: {url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-CO.json'}
    };
    this.obtenerApi();
  }

  obtenerApi(){
    this.apiService.getNotes().subscribe(data =>{
      console.log(data);
      this.listaApi = data
    },error =>{
      console.log(error);
    })
  }

  mostrarImagen(item: any): void {
    if (item && item.image) {
      Swal.fire({
        imageUrl: item.image,
        imageAlt: 'Imagen',
        title: item.title,
        confirmButtonText: 'Cerrar',
      });
    } else {
      console.error('La propiedad "image" no está presente en el objeto.');
    }
  }


  onCheckboxChange(item: any): void {
    // Lógica para manejar cambios en las casillas de verificación
    const precio = item.price;
    if (this.preciosSeleccionados.includes(precio)) {
      // Si ya está en la lista, quitarlo
      this.preciosSeleccionados = this.preciosSeleccionados.filter(p => p !== precio);
    } else {
      // Si no está en la lista, agregarlo
      this.preciosSeleccionados.push(precio);
    }
    console.log('Precios seleccionados:', this.preciosSeleccionados);
  }

  calcularSuma(): void {
    // Lógica para calcular la suma de los precios seleccionados
    const suma = this.preciosSeleccionados.reduce((total, precio) => total + precio, 0);

    if (suma > 0) {
      Swal.fire({
        title: 'Suma Total',
        text: `La suma total de los precios seleccionados es: $${suma}`,
        icon: 'info',
        confirmButtonText: 'Cerrar',
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No has seleccionado nada',
        icon: 'error',
        confirmButtonText: 'Cerrar',
      });
    }
  }

  eliminarCheckbox(){
    Swal.fire({
      title: "Estas Seguro?",
      text: "No podras revertirlo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Eliminado",
          text: "Tus Selecciones han sido borradas",
          icon: "success"
        });
        this.zone.runOutsideAngular(() => {
          setTimeout(() => {
            this.zone.run(() => {
              this.renderer.setProperty(document.location, 'href', document.location.href);
            });
          }, 1000);
        });
      }
    });
  }

  generarPDF(item: any): void {
    const pdf = new jsPDF();

    // Agregar información de la API al PDF
    pdf.text(`ID: ${item.id}`, 10, 10);
    pdf.text(`Título: ${item.title}`, 10, 20);
    pdf.text(`Precio: ${item.price}`, 10, 30);

    // Agregar la imagen del producto al PDF
    if (item.image) {
      pdf.addImage(item.image, 'JPEG', 10, 40, 180, 120);
    }

    // Guardar el PDF con el nombre basado en el ID
    pdf.save(`producto_${item.id}.pdf`);
  }

  copiar(titulo: string): void {
    this.clipboardService.copyFromContent(titulo);
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Copiado Correctamente",
      showConfirmButton: false,
      timer: 1000
    });
  }

  imprimir(item: any): void {
    const printContent = `
      <div>
        <h2>${item.title}</h2>
        <p>ID: ${item.id}</p>
        <p>Precio: ${item.price}</p>
        <img src="${item.image}" alt="Imagen" style="max-width: 100%;">
      </div>
    `;
    const ventanaImpresion = window.open('', '_blank');

    if (ventanaImpresion) {
      ventanaImpresion.document.write(printContent);
      ventanaImpresion.document.close();
      ventanaImpresion.print();
      ventanaImpresion.onafterprint = () => ventanaImpresion.close();
    } else {
      console.error('No se pudo abrir la ventana de impresión. Asegúrate de que los bloqueadores de ventanas emergentes estén desactivados.');
    }
  }
}
