import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import 'firebase/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.all.min';
import { map } from 'rxjs/operators';
import { User } from './user.model';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import { ActivarLoadingAction, DesactivarLoadingAction } from '../shared/ui.actions';
import { SetUserAction } from './auth.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private userSubscription: Subscription = new Subscription();
  private usuario: User;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private afDB: AngularFirestore,
    private store: Store<AppState>
  ) { }

  crearUsuario( nombre: string, email:string, password:string ) {
    this.store.dispatch( new ActivarLoadingAction() );
    this.afAuth
        .createUserWithEmailAndPassword( email, password )
        .then( resp => {
          const user: User = {
            uid: resp.user.uid,
            nombre: nombre,
            email: resp.user.email
          };
          this.afDB.doc(`${ user.uid }/usuario`).set( user ).then( ()=> {
            this.router.navigate(['/']);
            this.store.dispatch( new DesactivarLoadingAction() );
          });
        })
        .catch( error => {
          console.error( error );
          this.store.dispatch( new DesactivarLoadingAction() );
          Swal.fire({
            title: 'Error en el login!',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
  }

  login( email: string , password: string) {
    this.store.dispatch( new ActivarLoadingAction() );
    this.afAuth.signInWithEmailAndPassword(email, password)
        .then( resp=> {
          console.log(resp);
          this.store.dispatch( new DesactivarLoadingAction() );
          this.router.navigate(['/']);
        })
        .catch( error => {
          console.error(error);
          this.store.dispatch( new DesactivarLoadingAction() );
          Swal.fire({
            title: 'Error en el login!',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
  }

  logout() {
    this.router.navigate(['/login']);
    this.afAuth.signOut();
  }

  initAuthListener() {
    this.afAuth.authState.subscribe( fbUser => {
      if ( fbUser ) {
        this.userSubscription = this.afDB.doc(`${ fbUser.uid }/usuario`).valueChanges().subscribe( (usuarioObj: any) => {
          const newUser = new User( usuarioObj );
          this.store.dispatch(new SetUserAction(newUser));
          this.usuario = newUser;
        } );
      } else {
        this.usuario = null;
        this.userSubscription.unsubscribe();
      }
    });
  }

  isAuth() {
    return this.afAuth.authState.pipe(
      map( fbUser => {
        if ( fbUser == null ) {
          this.router.navigate(['/login']);
        }
        return fbUser != null;
      })
    );
  }

  getUsuario() {
    return {...this.usuario};
  }
}