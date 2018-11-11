import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductosService } from '../../providers/productos/productos'
import { ProductoPage } from '../index.paginas'

@IonicPage()
@Component({
  selector: 'page-busqueda',
  templateUrl: 'busqueda.html',
})
export class BusquedaPage {

  productoPage = ProductoPage;
  
  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private _ps: ProductosService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BusquedaPage');
  }

  buscar_productos( ev: any ){

    const valor = ev.target.value;
    console.log(valor);
    this._ps.buscar_producto( valor );
  }

}
