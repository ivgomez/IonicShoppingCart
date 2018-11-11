import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { URL_SERVICIOS } from '../../config/url.servicios';
import { AlertController, Platform } from 'ionic-angular';

//PLUGIN STORAGE
import { Storage } from '@ionic/storage';

@Injectable()
export class UsuarioService{

  token: string;
  id_usuario: string;
  

  constructor(public http: HttpClient,
              private alertCtrl: AlertController,
              private platform: Platform,
              private storage: Storage) {
      
    this.cargar_storage();
  }

  activo(): boolean{
    if( this.token ){
      return true;

    } else {
      return false;
    }
  }

  ingresar( correo: string, contrasena: string ) {
    
    let data = {
      "correo": correo,
      "contrasena": contrasena
    }

    let url = URL_SERVICIOS + "/login";

    return this.http.post( url, data ).pipe(map( (resp:any) =>{
      let data_resp = resp;
        console.log( data_resp );
  
        if( data_resp.error ){
            this.alertCtrl.create({
            title: "Error al iniciar",
            subTitle: data_resp.mensaje,
            buttons: ["OK"]
            }).present();
  
        } else {
  
        this.token = data_resp.token;
        this.id_usuario = data_resp.id_usuario;
        
        // GUARDAR STORAGE
        this.guardar_storage();
      }
    }))
  }

  cerrar_sesion(){
    this.token = null;
    this.id_usuario = null;

    //GUARDAR STORAGE
    this.guardar_storage();
  }

  private guardar_storage(){
    
    if( this.platform.is('cordova') ){
      // device
      this.storage.set('token', this.token );
      this.storage.set('id_usuario', this.id_usuario );
    } else {
      // desktop
      if( this.token ){        
        localStorage.setItem("token", this.token );
        localStorage.setItem("id_usuario", this.id_usuario );
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("id_usuario");
      }
      
    }
  }

  cargar_storage(){

    let promesa = new Promise( ( resolve, reject ) => {

      if( this.platform.is('cordova') ){
        // device
        this.storage.get('token')
            .then(token => {
              if( token ){
                this.token = token;
              }
              resolve();        
        });

        this.storage.get('id_usuario')
            .then(id_usuario => {
              if( id_usuario ){
                this.id_usuario = id_usuario;
              }
              resolve();
        });
       
      } else {
        // desktop
        if( localStorage.getItem("token") ){
          // token Exist
          this.token =  localStorage.getItem("token");
        }

        resolve();

        if( localStorage.getItem("id_usuario") ){
          // token Exist
          this.id_usuario = localStorage.getItem("id_usuario");
        }
        resolve();
      }

    });

    return promesa;
    
  }

}
