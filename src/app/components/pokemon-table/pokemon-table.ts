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
  filteredPokemons: any[] | null = null;
  limit: number = 20;
  offset: number = 0;
  loading: boolean = false;
  
  // Propiedades para búsqueda y filtros
  searchName: string = '';
  selectedType: string = '';
  selectedForm: string = '';
  
  // Propiedades para paginación
  currentPage: number = 1;
  totalPokemons: number = 1052;
  itemsPerPage: number = 20;
  totalPages: number = 0;
  
  // Lista de tipos de Pokémon
  pokemonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Listas de Pokémon con formas especiales
  megaEvolutions = [
    'venusaur-mega', 'charizard-mega-x', 'charizard-mega-y', 'blastoise-mega',
    'alakazam-mega', 'gengar-mega', 'kangaskhan-mega', 'pinsir-mega',
    'gyarados-mega', 'aerodactyl-mega', 'mewtwo-mega-x', 'mewtwo-mega-y',
    'ampharos-mega', 'scizor-mega', 'heracross-mega', 'houndoom-mega',
    'tyranitar-mega', 'blaziken-mega', 'gardevoir-mega', 'mawile-mega',
    'aggron-mega', 'medicham-mega', 'manectric-mega', 'banette-mega',
    'absol-mega', 'garchomp-mega', 'lucario-mega', 'abomasnow-mega'
  ];
  
  alolaForms = [
    'rattata-alola', 'raticate-alola', 'raichu-alola', 'sandshrew-alola',
    'sandslash-alola', 'vulpix-alola', 'ninetales-alola', 'diglett-alola',
    'dugtrio-alola', 'meowth-alola', 'persian-alola', 'geodude-alola',
    'graveler-alola', 'golem-alola', 'grimer-alola', 'muk-alola',
    'exeggutor-alola', 'marowak-alola'
  ];
  
  galarForms = [
    'meowth-galar', 'ponyta-galar', 'rapidash-galar', 'slowpoke-galar',
    'slowbro-galar', 'farfetchd-galar', 'weezing-galar', 'mr-mime-galar',
    'articuno-galar', 'zapdos-galar', 'moltres-galar', 'slowking-galar',
    'corsola-galar', 'zigzagoon-galar', 'linoone-galar', 'darumaka-galar',
    'darmanitan-galar', 'yamask-galar', 'stunfisk-galar'
  ];
  
  gigamaxForms = [
    'venusaur-gmax', 'charizard-gmax', 'blastoise-gmax', 'butterfree-gmax',
    'pikachu-gmax', 'meowth-gmax', 'machamp-gmax', 'gengar-gmax',
    'kingler-gmax', 'lapras-gmax', 'eevee-gmax', 'snorlax-gmax',
    'garbodor-gmax', 'melmetal-gmax', 'rillaboom-gmax', 'cinderace-gmax',
    'inteleon-gmax', 'corviknight-gmax', 'orbeetle-gmax', 'drednaw-gmax'
  ];

  constructor(private pokemonService: PokemonApi) {}

  ngOnInit() {
    console.log("Componente Pokemon Table cargado.");
    this.calculateTotalPages();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalPokemons / this.itemsPerPage);
  }

  buscarPokemons(): void {
    if (this.limit < 1) {
      Swal.fire({
        title: '¡Error!',
        text: 'Por favor, digite un límite válido mayor que 0',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#FF0000'
      });
      return;
    }

    this.loading = true;
    this.pokemons = [];
    this.filteredPokemons = [];

    this.pokemonService.getPokemons(this.limit, this.offset).subscribe({
      next: (data: PokemonInterface) => {
        const requests = data.results.map(r => 
          this.pokemonService.getPokemonByName(r.name).toPromise()
        );

        Promise.all(requests)
          .then((detailedList) => {
            this.pokemons = detailedList;
            this.filteredPokemons = detailedList;
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

  // ========== PAGINACIÓN ==========
  
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.offset = (page - 1) * this.itemsPerPage;
    this.limit = this.itemsPerPage;
    this.buscarPokemons();
    
    // Scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // ========== POKÉMON ALEATORIO ==========
  
  pokemonAleatorio(): void {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    
    this.loading = true;
    
    this.pokemonService.getPokemonByName(randomId).subscribe({
      next: (pokemon: any) => {
        this.pokemons = [pokemon];
        this.filteredPokemons = [pokemon];
        this.loading = false;

        Swal.fire({
          title: '¡Pokémon Aleatorio!',
          html: `
            <div style="text-align: center;">
              <img src="${pokemon.sprites.other['official-artwork'].front_default}" 
                   style="width: 150px; animation: bounce 1s;">
              <h2 style="margin-top: 10px;">${pokemon.name.toUpperCase()} #${pokemon.id}</h2>
            </div>
          `,
          icon: 'success',
          confirmButtonText: '¡Genial!',
          confirmButtonColor: '#3B4CCA',
          timer: 2500
        });
      },
      error: () => {
        this.loading = false;
        this.pokemonAleatorio();
      }
    });
  }

  // ========== BÚSQUEDA POR NOMBRE ==========
  
  buscarPorNombre(): void {
    const nombre = this.searchName.trim().toLowerCase();
    
    if (!nombre) {
      Swal.fire({
        title: 'Atención',
        text: 'Por favor, ingresa un nombre de Pokémon',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#FFDE00'
      });
      return;
    }

    this.loading = true;

    this.pokemonService.getPokemonByName(nombre).subscribe({
      next: (pokemon: any) => {
        this.pokemons = [pokemon];
        this.filteredPokemons = [pokemon];
        this.loading = false;

        Swal.fire({
          title: '¡Encontrado!',
          text: `${pokemon.name} - #${pokemon.id}`,
          icon: 'success',
          confirmButtonText: 'Ver',
          confirmButtonColor: '#3B4CCA',
          timer: 1500
        });
      },
      error: () => {
        this.loading = false;
        Swal.fire({
          title: 'No encontrado',
          text: `No existe ningún Pokémon llamado "${nombre}"`,
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#FF0000'
        });
      }
    });
  }

  // ========== FILTROS ==========
  
  filtrarPorTipo(): void {
    if (!this.pokemons) return;

    if (!this.selectedType) {
      this.filteredPokemons = this.pokemons;
      return;
    }

    this.filteredPokemons = this.pokemons.filter(pokemon => 
      pokemon.types.some((t: any) => t.type.name === this.selectedType)
    );

    if (this.filteredPokemons.length === 0) {
      Swal.fire({
        title: 'Sin resultados',
        text: `No hay Pokémon de tipo ${this.selectedType} en los resultados actuales`,
        icon: 'info',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#3B4CCA'
      });
    }
  }

  // Método para buscar formas especiales
  buscarFormaEspecial(): void {
    if (!this.selectedForm) {
      return;
    }

    this.loading = true;
    let pokemonList: string[] = [];

    switch(this.selectedForm) {
      case 'mega':
        pokemonList = this.megaEvolutions;
        break;
      case 'alola':
        pokemonList = this.alolaForms;
        break;
      case 'galar':
        pokemonList = this.galarForms;
        break;
      case 'gmax':
        pokemonList = this.gigamaxForms;
        break;
    }

    const requests = pokemonList.map(name => 
      this.pokemonService.getPokemonByName(name).toPromise().catch(() => null)
    );

    Promise.all(requests)
      .then((detailedList) => {
        this.pokemons = detailedList.filter(p => p !== null);
        this.filteredPokemons = this.pokemons;
        this.loading = false;

        Swal.fire({
          title: '¡Formas Especiales!',
          text: `Se encontraron ${this.pokemons.length} Pokémon con formas especiales`,
          icon: 'success',
          confirmButtonText: 'Ver',
          confirmButtonColor: '#3B4CCA',
          timer: 2000
        });
      })
      .catch(err => {
        console.error('Error al obtener formas especiales', err);
        this.loading = false;
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudieron cargar las formas especiales',
          icon: 'error',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#FF0000'
        });
      });
  }

  limpiarFiltros(): void {
    this.selectedType = '';
    this.searchName = '';
    this.selectedForm = '';
    this.filteredPokemons = this.pokemons;
  }

  // ========== CADENA DE EVOLUCIÓN ==========
  
  async verEvolucion(pokemon: any) {
    try {
      const speciesData: any = await this.pokemonService.getPokemonSpecies(pokemon.id).toPromise();
      const evolutionChainUrl = speciesData.evolution_chain.url;
      const evolutionId = evolutionChainUrl.split('/').filter((x: string) => x).pop();
      
      // Obtener la cadena de evolución
      const evolutionChain: any = await fetch(`https://pokeapi.co/api/v2/evolution-chain/${evolutionId}`).then(r => r.json());
      
      // Procesar la cadena de evolución
      const evolutions = this.processEvolutionChain(evolutionChain.chain);
      
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
          <p style="font-weight: bold; margin: 5px 0;">${p.name.toUpperCase()}</p>
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
        title: 'Sin evoluciones',
        text: 'Este Pokémon no tiene evoluciones o no se pudieron cargar',
        icon: 'info',
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

  // ========== VER ESPECIES ==========
  
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

  // ========== FAVORITOS ==========
  
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

  // ========== UTILIDADES ==========
  
  getTypeColor(type: string): string {
    const colors: any = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    return colors[type] || '#A0A0A0';
  }
}