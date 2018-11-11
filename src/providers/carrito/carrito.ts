import { URLSearchParams } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, Platform, ModalController } from 'ionic-angular';
import { map } from 'rxjs/operators';

//PLUGIN STORAGE
import { Storage } from '@ionic/storage';

// USUARIO SERVICE
import { UsuarioService } from '../usuario/usuario'

import { URL_SERVICIOS } from '../../config/url.servicios'

// PÁGINAS DEL MODAL
import { LoginPage, CarritoPage } from '../../pages/index.paginas';

@Injectable()
export class CarritoService {

  items: any[] = [];
  total_carrito: number = 0;
  ordenes: any[] = [];

  constructor(
    public http: HttpClient,
    private alertCtrl: AlertController,
    private platform: Platform,
    private storage: Storage,
    private _us: UsuarioService,
    private modalCtrl: ModalController) {

      this.cargar_storage();
      this.actualizar_total();
  }

  remover_item( idx: number){
    this.items.splice( idx, 1);
    this.guardar_storage();
  }

  realizar_pedido(){

    //let data = new URLSearchParams();
    let data = {
      items:""
    }
    
    let codigos: string[] = [];

    for( let item of this.items ){
      codigos.push( item.codigo );
    }
    data.items = codigos.join(",")
    //data.append("items", codigos.join(","));
    let url = `${ URL_SERVICIOS }/pedidos/realizar_orden/${ this._us.token }/${ this._us.id_usuario }`;

    this.http.post( url, data ).subscribe( (resp:any) => {
        let respuesta = resp;
        if( respuesta.error ){
          // show error
          this.alertCtrl.create({
            title: "Error en la orden",
            subTitle: respuesta.mensaje,
            buttons: ["OK"]
          }).present();
        } else {
          // good
          this.items = [];
          this.alertCtrl.create({
            title: "Orden realizada",
            subTitle: "Nos contactaremos con usted proximamente",
            buttons: ["OK"]
          }).present();
        }
    })
  }

  ver_carrito(){    
    let modal: any;
    if( this._us.token ){
      //mostrar página carrito
      modal = this.modalCtrl.create( CarritoPage )

    } else {
      // mostrar login
      modal = this.modalCtrl.create( LoginPage )
    }
    modal.present();    
    modal.onDidDismiss( ( abrirCarrito: boolean ) => {
      console.log(abrirCarrito);
      if( abrirCarrito ){
        this.modalCtrl.create( CarritoPage ).present();
      }
    })
  }

  agregar_carrito( item_parametro: any ){    
    for( let item of this.items ) {
      if ( item.codigo == item_parametro.codigo ) {        
        this.alertCtrl.create({
          title: "Item Existe",
          subTitle: item_parametro.producto + ", ya se encuentra en su carrito de compras",
          buttons: ["Ok"]
        }).present();

        return;
      }
    }
    this.items.push( item_parametro );
    this.actualizar_total();
    this.guardar_storage();
  }

  actualizar_total(){
    this.total_carrito = 0;
    for( let item of this.items ){
      this.total_carrito += Number( item.precio_compra );
    }
  }

  private guardar_storage(){
    
    if( this.platform.is('cordova') ){
      // device
      this.storage.set('items', this.items );
    } else {
      // desktop
      localStorage.setItem("items", JSON.stringify( this.items ) );
    }
  }

  cargar_storage(){

    let promesa = new Promise( ( resolve, reject ) => {

      if( this.platform.is('cordova') ){
        // device
        this.storage.get('age')
            .then(items => {
              if( items ){
                this.items = items;
              }
              resolve();
        });

      } else {
        // desktop
        if( localStorage.getItem("items") ){
          // Items Exist
          this.items = JSON.parse( localStorage.getItem("items") );
        }
        resolve();
      }

    });

    return promesa;
    
  }

  cargar_ordenes(){

    let url = `${ URL_SERVICIOS }/pedidos/obtener_pedidos/${ this._us.token }/${ this._us.id_usuario }`;
    this.http.get( url )
        .subscribe((data:any) => {
          if( data.error ){
            // manejar el error
          } else {
            // good
            this.ordenes = data.ordenes;
          }
        });
  }

  borrar_orden( orden_id: string ){

    let url = `${ URL_SERVICIOS }/pedidos/borrar_pedido/${ this._us.token }/${ this._us.id_usuario }/${ orden_id }`;

    return this.http.delete( url ).pipe(map( resp => resp ));

  }

}
