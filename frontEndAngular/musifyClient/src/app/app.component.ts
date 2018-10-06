import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { User } from './models/user';
import { GLOBAL } from './services/global';
import { Router, ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [UserService]
  //styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	public title = 'Musify';
	public user: User;
	public user_register: User;
	public identity;
	public token;
	public errorMessage; 
	public alertRegister;
	public url = GLOBAL.url;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService:UserService
	){
		this.user = new User('','','','','','ROLE_USER','');
		this.user_register = new User('','','','','','ROLE_USER','');
	}

	ngOnInit(){
		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
	}

	public onSubmit(){
		//Conseguir los datos del usuario identificado
		this._userService.signUp(this.user).subscribe(
			response => {
				let identity = response.user;
				this.identity = identity;
				if(!this.identity._id){
					alert('El usuario no esta corrrectamente identificado');
				} else {
					// Crear elemento en el local storage para tener al usuario en sesion
					localStorage.setItem('identity',JSON.stringify(identity));

					this._userService.signUp(this.user, true).subscribe(
						response => {
							let token = response.token;
							this.token = token;
							if(this.token.length <= 0){
								alert('El token no se ha generado');
							} else {
								// Crear elemento en el local storage para tener el token
								localStorage.setItem('token',token);
								this.user = new User('','','','','','ROLE_USER','');
								// Conseguir el token para enviarselo a cada petición http
							}
						},
						error => {
							var errorMessage = error;
							if(errorMessage != null){
								var body = JSON.parse(error.body);
								this.errorMessage = body.message;
								console.log(errorMessage);
							}
						}
					);

					// Conseguir el token para enviarselo a cada petición http
				}
			},
			error => {
				var errorMessage = error;
				if(errorMessage != null){
					var body = JSON.parse(error.body);
					this.errorMessage = body.message;
					console.log(errorMessage);
				}
			}
		);
	}

	logout(){
		localStorage.removeItem('identity');
		localStorage.removeItem('token');
		localStorage.clear();
		this.identity = null
		this.token = null
		this.user = new User('','','','','','ROLE_USER','');;
		this.user_register = new User('','','','','','ROLE_USER','');;
		this._router.navigate(['/']);
	}

	onSubmitRegister(){
		//console.log(this.user_register);
		this._userService.register(this.user_register).subscribe(
			res => {
				let user = res.user;
				this.user_register = user;
				if(!user._id){
					this.alertRegister = 'No se devolvió la id';
				} else {
					this.alertRegister = 'Registro de usuario correcto. Identificate con '+this.user_register.email;
					this.user_register = new User('','','','','','ROLE_USER','');
				}
			}, error => {
				var errorMessage = error;
				if(errorMessage != null){
					var body = JSON.parse(error.body);
					this.alertRegister = body.message;
					//this.errorMessage = body.message;
					
					console.log(errorMessage);
				}
			}
		);
	}
	
}
