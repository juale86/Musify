import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';

import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { ArtistService } from '../services/artist.service';
import { UploadService } from '../services/upload.service';
import { Artist } from '../models/artist';

@Component({
	selector:'artist-edit',
	templateUrl: '../views/artist-add.html',
	providers:[UserService, ArtistService, UploadService]
})

export class ArtistEditComponent implements OnInit{
	public title: string;
	public artist: Artist;
	public identity;
	public token;
	public url: string;
	public alertMessage;
	public is_edit;
	public filesToUpload: Array<File>;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private _uploadService: UploadService,
		private _artistService: ArtistService
	){
		this.title = "Editar artista";
		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
		this.url = GLOBAL.url;
		this.artist = new Artist('','','');
		this.alertMessage = '';
		this.is_edit = true;
	}

	ngOnInit(){
		//console.log('artist-edit.component.ts cargado');
		this.getArtist();
	}

	getArtist(){
		this._route.params.forEach((params) => {
			let id = params['id'];

			this._artistService.getArtist(this.token, id).subscribe(
				response => {
					if(!response.artist){
						this._router.navigate(['/']);
					} else {
						this.artist = response.artist
					}
				}, error => {
					var errorMessage = error;
					if(errorMessage != null){
						var body = JSON.parse(error._body);
						//this.alertMessage = body.message;
						//console.log(errorMessage);
					}
				}
			);
		});
	}

	onSubmit(){
		this._route.params.forEach((params) => {
			let id = params['id'];
			let obj = {
				name: this.artist.name,
				description: this.artist.description,
				image: this.artist.image
			};
			this._artistService.editArtist(this.token, id, obj).subscribe(
				(response) =>{
					if(!response.artist){
						this.alertMessage = 'Error en la respuesta';
					} else {
						this.alertMessage = 'Artista actualizado correctamente';
						if(!this.filesToUpload){
							this._router.navigate(['./artista', response.artist._id]);
						} else {

						}
						//Subir imagen del servicio
						this._uploadService.makeFileRequest(this.url+'upload-image-artist/'+id, [], this.filesToUpload, this.token, 'image')
							.then(
								(result) => {
									this._router.navigate(['/artistas',response.artist._id]);
								}, (error) => {
									console.log(error);
								}
							);
						//this.artist = response.artist;
						//this._router.navigate(['./editar-artista', response.artist._id]);
					}
				}, (error) => {
					var errorMessage = error;
					if(errorMessage != null){
						var body = JSON.parse(error._body);
						this.alertMessage = body.message;
						//console.log(errorMessage);
					}
				}
			);
		});
	}

	fileChangeEvent(fileInput: any){
		this.filesToUpload = <Array<File>>fileInput.target.files;
	}
}