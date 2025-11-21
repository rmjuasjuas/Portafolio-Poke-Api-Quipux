import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonApi } from '../../services/pokemon-api';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pokemon-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-library.html',
  styleUrls: ['./pokemon-library.css']
})
export class PokemonLibrary {
  pokemonList: any[] = [];
  seedNames = ['pikachu','charmander','squirtle','bulbasaur','eevee','mew'];

  constructor(private pokemonService: PokemonApi) {}

  ngOnInit() {
    this.loadFavorites();
  }

  async loadFavorites() {
    const key = 'pokemon_favorites';
    const stored = localStorage.getItem(key);
    let names: string[] = stored ? JSON.parse(stored) : [];

    // Si no hay favoritos, usamos el seed y los guardamos
    if (!names || names.length === 0) {
      names = this.seedNames;
      // Guardar los seed en localStorage para que funcione el eliminar
      localStorage.setItem(key, JSON.stringify(names));
    }

    this.pokemonList = [];

    try {
      const requests = names.map(n => this.pokemonService.getPokemonByName(n).toPromise());
      const results = await Promise.all(requests);
      this.pokemonList = results;
    } catch (err) {
      console.error('Error cargando favoritos', err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los Pokémon de la biblioteca',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }

  // Quitar de favoritos y recargar la lista
  removeFromLibrary(name: string) {
    const key = 'pokemon_favorites';
    const stored = localStorage.getItem(key);
    const list: string[] = stored ? JSON.parse(stored) : [];

    const newList = list.filter(n => n !== name);
    localStorage.setItem(key, JSON.stringify(newList));

    Swal.fire({
      title: 'Eliminado',
      text: `${name} fue removido de tu biblioteca`,
      icon: 'success',
      confirmButtonText: 'Ok',
      timer: 1500
    });

    // Recargar
    this.loadFavorites();
  }

  // Color por tipo
  getColor(type: string) {
    const colors: any = {
      electric: '#F8D030',
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      normal: '#A8A878',
      psychic: '#F85888',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      steel: '#B8B8D0',
      dragon: '#7038F8',
      dark: '#705848',
      fairy: '#EE99AC',
      ice: '#98D8D8',
      fighting: '#C03028'
    };
    return colors[type] || '#A0A0A0';
  }
}