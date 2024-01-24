import { Component, OnInit} from '@angular/core';
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
  //Variables
  listaApi: any[] = [];
  preciosSeleccionados: number[] = [];
  productosSeleccionados: any[] = [];
  mostrarPopup: boolean = false;
  productosSeleccionadosVacios: boolean = true;
  productosSeleccionadosPopup: any[] = [];
  dtOptions: DataTables.Settings = {};

  constructor(private apiService: ApifService,
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
    const precio = item.price;

    if (this.preciosSeleccionados.includes(precio)) {
      // Si ya está en la lista, quitarlo
      this.preciosSeleccionados = this.preciosSeleccionados.filter(p => p !== precio);
      this.productosSeleccionados = this.productosSeleccionados.filter(p => p.id !== item.id);
    } else {
      // Si no está en la lista, agregarlo
      this.preciosSeleccionados.push(precio);
      this.productosSeleccionados.push(item);
    }

    this.productosSeleccionadosVacios = this.productosSeleccionados.length === 0;

    console.log('Precios seleccionados:', this.preciosSeleccionados);
    console.log('Productos seleccionados:', this.productosSeleccionados);
  }

  calcularSuma(): void {
    // Filtra la lista de productos seleccionados que aún están presentes
    const productosSeleccionadosPresentes = this.productosSeleccionados.filter(
      producto => this.listaApi.some(item => item.id === producto.id)
    );

    // Lógica para calcular la suma de los precios seleccionados
    const suma = productosSeleccionadosPresentes.reduce((total, producto) => total + producto.price, 0);

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

  eliminarCheckbox(producto: any): void {
    Swal.fire({
      title: "Estas Seguro?",
      text: "Eliminaras este producto, No podras revertirlo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar"
    }).then((result) => {
      if (result.isConfirmed) {
        // Filtrar los productos y precios seleccionados
        this.preciosSeleccionados = this.preciosSeleccionados.filter(p => p !== producto.price);
        this.productosSeleccionados = this.productosSeleccionados.filter(p => p.id !== producto.id);

        // Actualizar las variables
        this.preciosSeleccionados = [...this.preciosSeleccionados];
        this.productosSeleccionados = [...this.productosSeleccionados];

        // Desmarcar la casilla de verificación en la tabla
        const checkboxId = `checkNoLabel${producto.id}`;
        const checkbox = document.getElementById(checkboxId) as HTMLInputElement;

        if (checkbox) {
          checkbox.checked = false;
        }
      }
    });
  }

  eliminarTodo() {
    if (this.productosSeleccionados.length === 0) {
      Swal.fire({
        title: "Error",
        text: "No hay productos seleccionados para eliminar",
        icon: "error",
        confirmButtonText: "Cerrar",
      });
      return;
    }

    Swal.fire({
      title: "Estas Seguro?",
      text: "Eliminaras todo lo seleccionado, No podras revertirlo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar"
    }).then((result) => {
      if (result.isConfirmed) {
        // Eliminar cada producto seleccionado
        this.productosSeleccionados.forEach((producto) => {
          this.apiService.deleteProductById(producto.id).subscribe(
            () => {
              // Eliminar el producto de la lista actual
              this.listaApi = this.listaApi.filter((item) => item.id !== producto.id);

              // Eliminar el producto del array de productos seleccionados
              this.productosSeleccionados = this.productosSeleccionados.filter((p) => p.id !== producto.id);

              // Actualizar la lista en el popup también
              this.productosSeleccionadosPopup = this.productosSeleccionadosPopup.filter((p) => p.id !== producto.id);
            },
            (error) => {
              console.error('Error al eliminar el producto', error);
            }
          );
        });

        Swal.fire({
          title: "Eliminado",
          text: "Tus Selecciones han sido borradas",
          icon: "success"
        });

        // Cerrar el popup
        this.cerrarPopup();
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
    const printContent = document.createElement('div');

    const title = document.createElement('h2');
    title.innerText = item.title;
    printContent.appendChild(title);

    const idParagraph = document.createElement('p');
    idParagraph.innerText = `ID: ${item.id}`;
    printContent.appendChild(idParagraph);

    const priceParagraph = document.createElement('p');
    priceParagraph.innerText = `Precio: ${item.price}`;
    printContent.appendChild(priceParagraph);

    const image = document.createElement('img');
    image.src = item.image;
    image.alt = 'Imagen';
    image.style.maxWidth = '100%';
    // Agregar evento de carga para asegurarse de que la imagen esté completamente cargada
    image.onload = () => {
      const ventanaImpresion = window.open('', '_blank');

      if (ventanaImpresion) {
        printContent.appendChild(image); // Agregar la imagen después de que se haya cargado
        ventanaImpresion.document.write(printContent.innerHTML);
        ventanaImpresion.document.close();
        ventanaImpresion.print();
        ventanaImpresion.onafterprint = () => ventanaImpresion.close();
      } else {
        Swal.fire({
          position: 'top-end',
          icon: 'error',
          title: 'No se pudo abrir la ventana de impresión.',
          text: 'Asegúrate de que los bloqueadores de ventanas emergentes estén desactivados.',
          showConfirmButton: false,
          timer: 1500
        });
        console.error('No se pudo abrir la ventana de impresión.');
      }
    };

    // Manejar el caso en que la imagen no se cargue correctamente
    image.onerror = () => {
      console.error('Error al cargar la imagen para imprimir.');
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: 'Error al cargar la imagen para imprimir.',
        showConfirmButton: false,
        timer: 1500
      });
    };
  }

  abrirPopup(): void {
    this.mostrarPopup = true;
    this.productosSeleccionadosPopup = [...this.productosSeleccionados];
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
  }
}
