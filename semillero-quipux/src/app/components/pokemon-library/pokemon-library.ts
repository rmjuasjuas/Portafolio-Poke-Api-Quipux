import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonApi } from '../../services/pokemon-api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pokemon-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-library.html',
  styleUrls: ['./pokemon-library.css']
})
export class PokemonLibrary {
  pokemonList: any[] = []; // detalles reales
  seedNames = ['pikachu','charmander','squirtle','bulbasaur','eevee','mew']; // fallback

  constructor(private pokemonService: PokemonApi) {}

  ngOnInit() {
    this.loadFavorites();
  }

  async loadFavorites() {
    const key = 'pokemon_favorites';
    const stored = localStorage.getItem(key);
    let names: string[] = stored ? JSON.parse(stored) : [];

    // si no hay favoritos, usamos el seed para mostrar algo
    if (!names || names.length === 0) {
      names = this.seedNames;
    }

    this.pokemonList = [];

    try {
      const requests = names.map(n => this.pokemonService.getPokemonByName(n).toPromise());
      const results = await Promise.all(requests);
      this.pokemonList = results;
    } catch (err) {
      console.error('Error cargando favoritos', err);
    }
  }

  // Quitar de favoritos y recargar la lista
  removeFromLibrary(name: string) {
    const key = 'pokemon_favorites';
    const stored = localStorage.getItem(key);
    const list: string[] = stored ? JSON.parse(stored) : [];

    const newList = list.filter(n => n !== name);
    localStorage.setItem(key, JSON.stringify(newList));

    // recargar
    this.loadFavorites();
  }

  // color por tipo simple
  getColor(type: string) {
    const colors: any = {
      electric: '#F8D030',
      fire: '#F08030',
      water: '#6890F0',
      grass: '#78C850',
      normal: '#A8A878',
      psychic: '#F85888'
    };
    return colors[type] || '#A0A0A0';
  }
}
