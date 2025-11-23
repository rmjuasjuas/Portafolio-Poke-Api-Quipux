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
    'pikachu',
    'charmander',
    'squirtle',
    'bulbasaur',
    'eevee',
    'mew',
    'rayquaza',
    'latios',
    'latias',
    'groudon',
    'kyogre',
    'aggron',
    'ho-oh',
    'lugia',
    'suicune',
    'entei',
    'raikou',
    'umbreon',
    'articuno',
    'zapdos',
    'moltres',
    'snorlax',
    'gyarados',
    'darkrai',
    'giratina-altered',
    'palkia',
    'dialga',
    'walking-wake',
    'miraidon',
    'koraidon',
    'gholdengo',
    'glastrier',
    'eternatus',
    'necrozma',
    'marshadow',
    'buzzwole',
    'pheromosa',
    'xurkitree',
    'lunala',
    'solgaleo',
    'cosmog',
    'golisopod',
    'zygarde-50',
    'yveltal',
    'xerneas',
    'greninja',
    'thundurus-incarnate',
    'zekrom',
    'reshiram',
    'sawk',
    'venusaur',
    'charizard',
    'blastoise',
    'ditto',
    'jolteon',
    'flareon',
    'dragonite',
    'celebi'
  ];

  nuevoPokemon = '';

  constructor(private pokemonService: PokemonApi) {}

  ngOnInit() {
    this.loadFavorites();
  }

  addFavorite(pokemonName: string) {
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

  
    names.push(name);
    localStorage.setItem(key, JSON.stringify(names));
    this.nuevoPokemon = '';
    this.loadFavorites();
  
    Swal.fire('Agregado', `${pokemonName} fue añadido a favoritos`, 'success');
  }

/*
  clearFavorites() {
    Swal.fire({
      title: '¿Borrar todos los favoritos?',
      text: 'Esto eliminará todos los Pokémon guardados en tu biblioteca. ¿Estás seguro?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('pokemon_favorites');
        this.pokemonList = [];
        Swal.fire('Borrado', 'Se han eliminado todos los favoritos', 'success');
      }
    });
  }
*/

  async loadFavorites() {
    const key = 'pokemon_favorites';
    const stored = localStorage.getItem(key);
    let names: string[] = stored ? JSON.parse(stored) : [];

    if (!names || names.length === 0) {
      names = this.seedNames;
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

  // ========== VER POKÉDEX ==========
  
  async verSpecies(pokemon: any) {
    try {
      const speciesData: any = await this.pokemonService.getPokemonSpecies(pokemon.id).toPromise();
      
      const flavorTextEntry = speciesData.flavor_text_entries.find(
        (entry: any) => entry.language.name === 'es' || entry.language.name === 'en'
      );
      
      const description = flavorTextEntry 
        ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') 
        : 'No hay descripción disponible';

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
                 alt="${pokemon.name}" 
                 style="width: 200px; height: 200px; margin: 10px auto; animation: float 3s ease-in-out infinite;">
            <p style="font-style: italic; color: #555; margin: 15px 0;">${description}</p>
            <hr style="margin: 20px 0;">
            <h3 style="margin-bottom: 10px;">Estadísticas Base</h3>
            ${statsHtml}
          </div>
        `,
        width: 600,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3B4CCA',
        showClass: {
          popup: 'animate__animated animate__fadeInDown'
        }
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

  // ========== VER EVOLUCIÓN ==========
  
  async verEvolucion(pokemon: any) {
    try {
      const speciesData: any = await this.pokemonService.getPokemonSpecies(pokemon.id).toPromise();
      
      // Verificar si tiene cadena de evolución
      if (!speciesData.evolution_chain || !speciesData.evolution_chain.url) {
        Swal.fire({
          title: 'Sin evoluciones',
          text: `${pokemon.name} no tiene evoluciones disponibles`,
          icon: 'info',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#3B4CCA'
        });
        return;
      }

      const evolutionChainUrl = speciesData.evolution_chain.url;
      const evolutionId = evolutionChainUrl.split('/').filter((x: string) => x).pop();
      
      // Obtener la cadena de evolución
      const evolutionChain: any = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${evolutionId}`).then(r => r.json());
      
      // Procesar la cadena de evolución
      const evolutions = this.processEvolutionChain(evolutionChain.chain);
      
      // Si solo tiene 1 evolución, significa que no evoluciona
      if (evolutions.length === 1) {
        Swal.fire({
          title: 'Sin evoluciones',
          html: `
            <div style="text-align: center;">
              <img src="${pokemon.sprites.other['official-artwork'].front_default}" 
                   style="width: 150px; margin: 20px;">
              <p>${pokemon.name.toUpperCase()} no tiene evoluciones</p>
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#3B4CCA'
        });
        return;
      }
      
      // Obtener detalles de cada evolución
      const evolutionDetails = await Promise.all(
        evolutions.map(async (name: string) => {
          const pokemonData: any = await this.pokemonService.getPokemonByName(name).toPromise();
          return pokemonData;
        })
      );
      
      // Crear HTML para mostrar las evoluciones
      const evolutionsHtml = evolutionDetails.map((p, index) => `
        <div style="display: inline-block; margin: 10px; text-align: center; animation: fadeIn 0.5s ease-in ${index * 0.3}s backwards;">
          <img src="${p.sprites.other['official-artwork'].front_default}" 
               style="width: 120px; height: 120px; transition: transform 0.3s;" 
               onmouseover="this.style.transform='scale(1.1) rotate(5deg)'"
               onmouseout="this.style.transform='scale(1)'">
          <p style="font-weight: bold; margin: 5px 0; text-transform: capitalize;">${p.name}</p>
          <p style="font-size: 12px; color: #666;">#${p.id}</p>
          ${index < evolutionDetails.length - 1 ? '<p style="font-size: 24px; margin: 10px 0;"></p>' : ''}
        </div>
      `).join('');

      Swal.fire({
        title: `Cadena de Evolución`,
        html: `
          <style>
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          </style>
          <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; padding: 20px;">
            ${evolutionsHtml}
          </div>
        `,
        width: 800,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3B4CCA',
        showClass: {
          popup: 'animate__animated animate__zoomIn'
        }
      });
    } catch (err) {
      console.error('Error al obtener evoluciones', err);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las evoluciones',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
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