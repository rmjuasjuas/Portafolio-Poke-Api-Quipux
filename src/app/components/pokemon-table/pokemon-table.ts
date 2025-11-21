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

    // Validación eliminada para permitir más de 50 pokémon

    this.loading = true;
    this.pokemons = [];

    this.pokemonService.getPokemons(this.limit, this.offset).subscribe({
      next: (data: PokemonInterface) => {
        const requests = data.results.map(r => 
          this.pokemonService.getPokemonByName(r.name).toPromise()
        );

        Promise.all(requests)
          .then((detailedList) => {
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

  // Nueva función para ver species en modal
  async verSpecies(pokemon: any) {
    try {
      const speciesData: any = await this.pokemonService.getPokemonSpecies(pokemon.id).toPromise();
      
      // Buscar la descripción en español o inglés
      const flavorTextEntry = speciesData.flavor_text_entries.find(
        (entry: any) => entry.language.name === 'es' || entry.language.name === 'en'
      );
      
      const description = flavorTextEntry 
        ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') 
        : 'No hay descripción disponible';

      // Genera el HTML con las estadísticas
      const statsHtml = pokemon.stats.map((s: any) => `
        <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 5px; background: #f0f0f0; border-radius: 4px;">
          <strong>${s.stat.name}:</strong> <span>${s.base_stat}</span>
        </div>
      `).join('');

      Swal.fire({
        title: `${pokemon.name.toUpperCase()} - #${pokemon.id}`,
        html: `
          <div style="text-align: center;">
            <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                 alt="${pokemon.name}" 
                 style="width: 200px; height: 200px; margin: 10px auto;">
            <p style="font-style: italic; color: #555; margin: 15px 0;">${description}</p>
            <hr style="margin: 20px 0;">
            <h3 style="margin-bottom: 10px;">Estadísticas Base</h3>
            ${statsHtml}
          </div>
        `,
        width: 600,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3B4CCA'
      });
    } catch (err) {
      console.error('Error al obtener species', err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo obtener la información de especies',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
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
      title: '¡Agregado!',
      text: `${pokemonName} se agregó a tu Pokémon Library`,
      icon: 'success',
      confirmButtonText: 'Ver Library',
      confirmButtonColor: '#3B4CCA',
      timer: 2000
    });
  }
}