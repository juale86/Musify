import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';

import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { AlbumService } from '../services/album.service';
import { UploadService } from '../services/upload.service';
import { Album } from '../models/album';

@Component({
	selector:'album-edit',
	templateUrl: '../views/album-add.html',
	providers:[UserService, AlbumService, UploadService]
})

export class AlbumEditComponent implements OnInit{
	public titulo: string;
	public album: Album;
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
		private _albumService: AlbumService,
		private _uploadService: UploadService
	){
		this.titulo = "Editar album";
		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
		this.url = GLOBAL.url;
		this.album = new Album('','',2018,'','');
		this.is_edit = true;
	}

	ngOnInit(){
		console.log('album-edit.component.ts cargado');
		// Conseguir el album
		this.getAlbum();
	}

	getAlbum(){
		this._route.params.forEach((params) => {
			let id = params['id'];
			this._albumService.getAlbum(this.token, id).subscribe(
				response =>{
					//console.log('RESPONSE',response);
					if(!response.album){
						this._router.navigate(['/']);
						//this.alertMessage = 'Error en la respuesta';
					} else {
						//this.alertMessage = 'Album guardado correctamente';
						this.album = response.album;
						//this._router.navigate(['./editar-artista', response.artist._id]);
					}
				}, error => {
					var errorMessage = <any>error;
					if(errorMessage != null){
						var body = JSON.parse(error._body);
						//this.alertMessage = body.message;
						//console.log('ERRORMESSAGE',errorMessage);
					}
				}
			);
		});
	}

	onSubmit(){
		this._route.params.forEach((params) => {
			let id = params['id'];

			this._albumService.editAlbum(this.token, id, this.album).subscribe(
				response =>{
					//console.log('THIS.ALBUM',this.album);
					if(!response.album){
						this.alertMessage = 'Error en el servidor en AlbumEditComponent';
					} else {
						this.alertMessage = 'Album actualizado correctamente';
						if(!this.filesToUpload){
							//console.log('THIS.ALBUM',this.album);
							this._router.navigate(['/artista',this.album.artist['_id']]);
						} else {
							this._uploadService.makeFileRequest(this.url+'upload-image-album/'+id, [], this.filesToUpload, this.token, 'image')
							.then(
								result => {
									this._router.navigate(['/artista',this.album.artist['_id']]);
								}, error => {
									console.log(error);
								}
							);
						}
						//this._router.navigate(['./editar-artista', response.artist._id]);
					}
				}, error => {
					var errorMessage = error;
					if(errorMessage != null){
						var body = JSON.parse(error._body);
						this.alertMessage = body.message;
						//console.log(errorMessage);
					}
				}
			);
			//console.log(this.album);
		});
	}

	fileChangeEvent(fileInput: any){
		this.filesToUpload = <Array<File>>fileInput.target.files;
	}
}
