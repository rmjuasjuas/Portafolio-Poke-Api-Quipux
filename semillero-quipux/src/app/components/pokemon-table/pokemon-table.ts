import { Component } from '@angular/core';
import { PokemonApi } from '../../services/pokemon-api';
import { CommonModule } from '@angular/common';
import { PokemonInterface } from '../../models/PokemonResponse.interface';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-pokemon-table',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pokemon-table.html',
  styleUrls: ['./pokemon-table.css']
})
export class PokemonTable {
  // lista con datos detallados (cada item será el objeto completo de la API)
  pokemons: any[] | null = null;
  limit: number = 10;
  offset: number = 0;
  loading: boolean = false;

  constructor(private pokemonService: PokemonApi) {}

  ngOnInit() {
    console.log("Componente Pokemon Table cargado.");
  }

  buscarPokemons(): void {
    if (this.limit < 1) {
      Swal.fire({
        title: '¡Error!',
        text: 'Por favor, digite un límite válido mayor que 0',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#FF0000',
        background: '#FFFFFF',
        color: '#000000'
      });
      return;
    }

    this.loading = true;
    this.pokemons = [];

    this.pokemonService.getPokemons(this.limit, this.offset).subscribe({
      next: (data: PokemonInterface) => {
        // data.results trae { name, url } — pedimos detalle para cada uno
        const requests = data.results.map(r => 
          this.pokemonService.getPokemonByName(r.name).toPromise()
        );

        // ejecutamos todas las promesas en paralelo
        Promise.all(requests)
          .then((detailedList) => {
            // detailedList son objetos completos de cada pokemon
            this.pokemons = detailedList;
            this.loading = false;

            Swal.fire({
              title: '¡Éxito!',
              text: `Se encontraron ${detailedList.length} Pokémon`,
              icon: 'success',
              confirmButtonText: 'Genial',
              confirmButtonColor: '#3B4CCA',
              timer: 1500
            });
          })
          .catch(err => {
            console.error('Error al obtener detalles', err);
            this.loading = false;
            Swal.fire({
              title: '¡Error!',
              text: 'No se pudieron obtener los detalles de los pokémon',
              icon: 'error',
              confirmButtonText: 'Reintentar',
              confirmButtonColor: '#FF0000'
            });
          });
      },
      error: (err: any) => {
        console.error('Error al consultar los pokemons', err);
        this.loading = false;
        
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo conectar con la PokéAPI',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#FF0000'
        });
      }
    });
  }

  // Guarda un pokemon (por nombre) en localStorage para la Library
  addToLibrary(pokemonName: string) {
    const key = 'pokemon_favorites';
    const stored = localStorage.getItem(key);
    const list: string[] = stored ? JSON.parse(stored) : [];

    if (list.includes(pokemonName)) {
      Swal.fire({
        title: 'Ya agregado',
        text: `${pokemonName} ya está en tu librería.`,
        icon: 'info',
        confirmButtonText: 'Ok'
      });
      return;
    }

    list.push(pokemonName);
    localStorage.setItem(key, JSON.stringify(list));
    Swal.fire({
      title: 'Agregado',
      text: `${pokemonName} se agregó a tu Pokémon Library`,
      icon: 'success',
      confirmButtonText: 'Ver Library'
    });
  }
}
