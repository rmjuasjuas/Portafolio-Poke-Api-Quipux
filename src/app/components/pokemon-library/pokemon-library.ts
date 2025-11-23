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
  seedNames = [
    'pikachu', 'charmander', 'squirtle', 'bulbasaur', 'eevee', 'mew',
    'rayquaza', 'latios', 'latias', 'groudon', 'kyogre', 'aggron',
    'ho-oh', 'lugia', 'suicune', 'entei', 'raikou', 'umbreon',
    'articuno', 'zapdos', 'moltres', 'snorlax', 'gyarados', 'darkrai',
    'giratina-altered', 'palkia', 'dialga', 'walking-wake', 'miraidon',
    'koraidon', 'gholdengo', 'glastrier', 'eternatus', 'necrozma',
    'marshadow', 'buzzwole', 'pheromosa', 'xurkitree', 'lunala',
    'solgaleo', 'cosmog', 'golisopod', 'zygarde-50', 'yveltal',
    'xerneas', 'greninja', 'thundurus-incarnate', 'zekrom', 'reshiram',
    'sawk', 'venusaur', 'charizard', 'blastoise', 'ditto',
    'jolteon', 'flareon', 'dragonite', 'celebi'
  ];
 
  nuevoPokemon = '';
 
  constructor(private pokemonService: PokemonApi) {}
 
  ngOnInit() {
    this.loadFavorites();
  }
 
  async addFavorite(pokemonName: string) {
    const key = 'pokemon_favorites';
    const stored = localStorage.getItem(key);
    const names: string[] = stored ? JSON.parse(stored) : [];
    const name = pokemonName.toLowerCase().trim();
 
    if (!name) {
      Swal.fire('Campo vacío', 'Escribe un nombre de Pokémon', 'warning');
      return;
    }
 
    if (names.includes(name)) {
      Swal.fire('Ya existe', `${pokemonName} ya está en favoritos`, 'info');
      return;
    }
 
    try {
      await this.pokemonService.getPokemonByName(name).toPromise();
      names.push(name);
      localStorage.setItem(key, JSON.stringify(names));
      this.nuevoPokemon = '';
      this.loadFavorites();
      Swal.fire('Agregado', `${pokemonName} fue añadido a favoritos`, 'success');
    } catch (err) {
      Swal.fire({
        title: 'Pokémon no encontrado',
        text: `"${pokemonName}" no existe. Verifica el nombre.`,
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  }
 
  async loadFavorites() {
    const key = 'pokemon_favorites';
    const stored = localStorage.getItem(key);
    let names: string[] = stored ? JSON.parse(stored) : [];
 
    if (!names || names.length === 0) {
      names = this.seedNames;
      localStorage.setItem(key, JSON.stringify(names));
    }
 
    this.pokemonList = [];
 
    for (const name of names) {
      try {
        const pokemon = await this.pokemonService.getPokemonByName(name).toPromise();
        this.pokemonList.push(pokemon);
      } catch (err) {
        console.error(`Error cargando ${name}:`, err);
      }
    }
 
    if (this.pokemonList.length === 0) {
      Swal.fire({
        title: 'Biblioteca vacía',
        text: 'Cargando pokémon por defecto...',
        icon: 'info',
        timer: 2000
      });
      localStorage.setItem(key, JSON.stringify(this.seedNames));
      this.loadFavorites();
    }
  }
 
  async verSpecies(pokemon: any) {
    try {
      const speciesData: any = await this.pokemonService.getPokemonSpecies(pokemon.id).toPromise();
      const flavorTextEntry = speciesData.flavor_text_entries.find(
        (entry: any) => entry.language.name === 'es' || entry.language.name === 'en'
      );
      const description = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : 'No hay descripción disponible';
 
      const statsHtml = pokemon.stats.map((s: any) => `
        <div style="display: flex; justify-content: space-between; margin: 5px 0; padding: 8px; background: #f0f0f0; border-radius: 4px;">
          <strong style="text-transform: capitalize;">${s.stat.name}:</strong> 
          <span style="font-weight: bold; color: #3B4CCA;">${s.base_stat}</span>
        </div>
      `).join('');
 
      Swal.fire({
        title: `${pokemon.name.toUpperCase()} - #${pokemon.id}`,
        html: `
          <div style="text-align: center;">
            <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                 alt="${pokemon.name}" style="width: 200px; height: 200px; margin: 10px auto;">
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
      Swal.fire('Error', 'No se pudo obtener la información', 'error');
    }
  }
 
  async verEvolucion(pokemon: any) {
    try {
      const speciesData: any = await this.pokemonService.getPokemonSpecies(pokemon.id).toPromise();
 
      if (!speciesData.evolution_chain || !speciesData.evolution_chain.url) {
        Swal.fire('Sin evoluciones', `${pokemon.name} no tiene evoluciones`, 'info');
        return;
      }
 
      const evolutionChainUrl = speciesData.evolution_chain.url;
      const evolutionId = evolutionChainUrl.split('/').filter((x: string) => x).pop();
      const evolutionChain: any = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${evolutionId}`).then(r => r.json());
      const evolutions = this.processEvolutionChain(evolutionChain.chain);
 
      if (evolutions.length === 1) {
        Swal.fire('Sin evoluciones', `${pokemon.name.toUpperCase()} no tiene evoluciones`, 'info');
        return;
      }
 
      const evolutionDetails = await Promise.all(
        evolutions.map(async (name: string) => {
          return await this.pokemonService.getPokemonByName(name).toPromise();
        })
      );
 
      const evolutionsHtml = evolutionDetails.map((p, index) => `
        <div style="display: inline-block; margin: 10px; text-align: center;">
          <img src="${p.sprites.other['official-artwork'].front_default}" style="width: 120px; height: 120px;">
          <p style="font-weight: bold; margin: 5px 0; text-transform: capitalize;">${p.name}</p>
          <p style="font-size: 12px; color: #666;">#${p.id}</p>
          ${index < evolutionDetails.length - 1 ? '<p style="font-size: 24px;">→</p>' : ''}
        </div>
      `).join('');
 
      Swal.fire({
        title: 'Cadena de Evolución',
        html: `<div style="display: flex; justify-content: center; flex-wrap: wrap; padding: 20px;">${evolutionsHtml}</div>`,
        width: 800,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3B4CCA'
      });
    } catch (err) {
      Swal.fire('Error', 'No se pudieron cargar las evoluciones', 'error');
    }
  }
 
  processEvolutionChain(chain: any): string[] {
    const evolutions: string[] = [];
    const addEvolutions = (node: any) => {
      evolutions.push(node.species.name);
      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((evolution: any) => addEvolutions(evolution));
      }
    };
    addEvolutions(chain);
    return evolutions;
  }
 
  getColor(type: string) {
    const colors: any = {
      electric: '#F8D030', fire: '#F08030', water: '#6890F0', grass: '#78C850',
      normal: '#A8A878', psychic: '#F85888', poison: '#A040A0', ground: '#E0C068',
      flying: '#A890F0', bug: '#A8B820', rock: '#B8A038', ghost: '#705898',
      steel: '#B8B8D0', dragon: '#7038F8', dark: '#705848', fairy: '#EE99AC',
      ice: '#98D8D8', fighting: '#C03028'
    };
    return colors[type] || '#A0A0A0';
  }
}