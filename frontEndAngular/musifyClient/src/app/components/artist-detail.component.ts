import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';

import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { ArtistService } from '../services/artist.service';
import { AlbumService } from '../services/album.service';
import { Artist } from '../models/artist';
import { Album } from '../models/album';

@Component({
	selector:'artist-detail',
	templateUrl: '../views/artist-detail.html',
	providers:[UserService, ArtistService, AlbumService]
})

export class ArtistDetailComponent implements OnInit{
	public artist: Artist;
	public albums: Album[];
	public identity;
	public token;
	public url: string;
	public alertMessage;
	public confirmado;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _userService: UserService,
		private _artistService: ArtistService,
		private _albumService: AlbumService,
	){
		this.identity = this._userService.getIdentity();
		this.token = this._userService.getToken();
		this.url = GLOBAL.url;
		//this.artist = new Artist('','',''); // Ya no hace falta
		this.alertMessage = '';
	}

	ngOnInit(){
		console.log('artist-detail.component.ts cargado');
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
						this.artist = response.artist;
						this._albumService.getAlbums(this.token, response.artist['_id']).subscribe(
							response => {
								//console.log('RESPONSE',response);
								if(!response.albums){
									this.alertMessage = 'Éste artista no tiene albums';
								} else {
									this.albums = response.albums;
								}
							}, error => {
								var errorMessage = error;
								if(errorMessage != null){
									var body = JSON.parse(error._body);
									this.alertMessage = body.message;
								}
							}
						);
					}
				}, error => {
					var errorMessage = error;
					if(errorMessage != null){
						var body = JSON.parse(error);
						//this.alertMessage = body.message;
					}
				}
			);
		});
	}

	onDeleteConfirm(id){
		this.confirmado = id;
	}

	onCancelAlbum(){
		this.confirmado = null;
	}

	onDeleteAlbum(id){
		this._albumService.deleteAlbum(this.token, id).subscribe(
			response =>{
				if(!response.album){
					alert('No se recibieron albums');
				}
				this.getArtist();
			}, error => {
				var errorMessage = error;
				console.log('ERROR',error);
				if(errorMessage != null){
					var body = JSON.parse(error._body);
					this.alertMessage = error._body.message;
					//this.alertMessage = body.message;
				}
			}
		);
	}

}