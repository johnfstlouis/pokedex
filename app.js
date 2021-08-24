window.addEventListener('load', getDefaultHandler);

const spinnerContainer = document.getElementById('spinnerContainer');

const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
const pager = document.getElementById('pager');
const list = document.getElementById('pokeList');

const pokeModal = document.getElementById('pokeModal');
const pokeModalLabel = pokeModal.querySelector('#pokeModalLabel');
const pokeModalBody = pokeModal.querySelector('#modalBody');

let defaultUrl = new URL('https://pokeapi.co/api/v2/pokemon');
let nextUrl = new URL('https://pokeapi.co/api/v2/pokemon');
let previousUrl = new URL('https://pokeapi.co/api/v2/pokemon');

let pokemonTotalCount = 0;
let itemsPerPage = 20;
let nextOffset = 0;
let previousOffset = 0;


itemsPerPageSelect.addEventListener('change', () => {
	itemsPerPage = parseInt(itemsPerPageSelect.value);
	defaultUrl.href = `https://pokeapi.co/api/v2/pokemon?offset=0&limit=${itemsPerPage}`;
	getDefaultHandler();
});

list.addEventListener('click', function(event) {
	getPokemonInfos(event.target.dataset.pokeUrl);
});

pager.addEventListener('click', function(event) {
	if (event.target.dataset.pokeSearch) {
		getPokemonsList(event.target.dataset.pokeSearch);
	}
});

function getDefaultHandler() {
	getPokemonsList(defaultUrl);
}

async function getPokemonInfos(url){
	const pokeUrl = url;
	
	pokeModalLabel.innerHTML = "";
	pokeModalBody.innerHTML = "";

	try {

		const response = await axios.get(pokeUrl);
		
		pokeModalLabel.innerHTML = capitalizeFirstLetter(response.data.name);

		let bodyHtml = `<img src="${response.data.sprites.front_default}">`;
		
		response.data.abilities.forEach((el, index) => {
			if (index === 0) {
				if (response.data.abilities.length === 1){
					bodyHtml = `${bodyHtml}<h5>Ability:</h5>`;	
				} else {
					bodyHtml = `${bodyHtml}<h5>Abilities:</h5>`;	
				}
			}
			bodyHtml = `${bodyHtml}<p>${capitalizeFirstLetter(el.ability.name)}`;
		});
		
		pokeModalBody.innerHTML = bodyHtml;
		
	} catch (error) {
		console.log(error.message);
	}
}

async function getPokemonsList(url) {
	
	try {
		
		spinnerContainer.style.display = 'block';

		const response = await axios.get(url);

		pokemonTotalCount = response.data.count;
		
		nextUrl.href = response.data.next;
		previousUrl.href = response.data.previous;
		nextOffset = nextUrl.searchParams.get('offset');
		previousOffset = previousUrl.searchParams.get('offset');
		
		list.innerHTML = '';

		response.data.results.forEach(e => {
			const li = document.createElement('li');
			li.setAttribute('data-bs-toggle', 'modal');
			li.setAttribute('data-bs-target', '#pokeModal');
			li.setAttribute('data-poke-url', e.url);
			li.classList.add('list-group-item');
			li.innerHTML = `${capitalizeFirstLetter(e.name)}`;
			list.appendChild(li);
		});

		updatePager();
		spinnerContainer.style.display = 'none';

	} catch (error) {
		console.log(error.message);
	}
}

function capitalizeFirstLetter(name) {
	let nameCapitalize = name[0].toUpperCase() + name.substring(1);
	
	if (nameCapitalize.indexOf('-') > 0) {
		let pos = nameCapitalize.indexOf('-') + 1;
		let charLow = nameCapitalize[pos];
		let charUp = charLow.toUpperCase();
		nameCapitalize = nameCapitalize.replace(`-${charLow}`, `-${charUp}`);
	}
	return nameCapitalize;
}

function updatePager() {
	const numberOfPage = Math.ceil(pokemonTotalCount / itemsPerPage);
	const lastOffset = (numberOfPage * itemsPerPage) - itemsPerPage;

	let actualPage = 1;
	if (previousOffset != null && nextOffset != null) {
		actualPage = nextOffset / itemsPerPage;
	} else if (nextOffset == null) {
		actualPage = numberOfPage;
	}
	
	let pagerHTML = '';
	if (previousOffset != null) {
		pagerHTML = `<li class="page-item"><span class="page-link" aria-label="Previous" data-poke-search="https://pokeapi.co/api/v2/pokemon?offset=0&limit=${itemsPerPage}">&laquo;&laquo;</span></li>`;
		pagerHTML = `${pagerHTML}<li class="page-item"><span class="page-link" aria-label="Previous" data-poke-search="https://pokeapi.co/api/v2/pokemon?offset=${previousOffset}&limit=${itemsPerPage}">&laquo;</span></li>`;
	} else {
		pagerHTML = `<li class="page-item disabled"><span class="page-link" aria-label="Previous">&laquo;&laquo;</span></li>`;
		pagerHTML = `${pagerHTML}<li class="page-item disabled"><span class="page-link" aria-label="Previous">&laquo;</span></li>`;
	}

	for (let i = 0; i < numberOfPage; i++) {
		if ((actualPage + 6 > i + 1 && actualPage - 6 < i + 1) || (actualPage < 6 && i < 11) || (actualPage > numberOfPage - 6 && i > numberOfPage - 12)) {
			const actualOffSet = i * itemsPerPage;
			pagerHTML = `${pagerHTML}<li class="page-item ${actualPage === i + 1 ? 'active':''}"><span class="page-link" data-poke-search="https://pokeapi.co/api/v2/pokemon?offset=${actualOffSet}&limit=${itemsPerPage}">${i+1}</span></li>`;
		}
	}

	if (nextOffset != null) {
		pagerHTML = `${pagerHTML}<li class="page-item"><span class="page-link" aria-label="Next" data-poke-search="https://pokeapi.co/api/v2/pokemon?offset=${nextOffset}&limit=${itemsPerPage}">&raquo;</span></li>`;
		pagerHTML = `${pagerHTML}<li class="page-item"><span class="page-link" aria-label="Next" data-poke-search="https://pokeapi.co/api/v2/pokemon?offset=${lastOffset}&limit=${itemsPerPage}">&raquo;&raquo;</span></li>`;
	} else {
		pagerHTML = `${pagerHTML}<li class="page-item disabled"><span class="page-link" aria-label="Next">&raquo;</span></li>`;
		pagerHTML = `${pagerHTML}<li class="page-item disabled"><span class="page-link" aria-label="Next">&raquo;&raquo;</span></li>`;
	}

	pager.innerHTML = pagerHTML;

}

