function filterItems(items, filters) {
    return items.filter(item => {
        // Filter by item type (allow any type if not specified)
        if (filters.type && item.type !== filters.type) return false;

        // Filter by stats (allow any stat if not specified)
        if (filters.stats) {
            for (const [statName, { minValue, maxValue }] of Object.entries(filters.stats)) {
                const stat = item.stats.find(s => s.stat === statName);
                if (!stat || stat.minValue < minValue || stat.maxValue > maxValue) return false;
                else {
                    let a = 0;
                }
            }
        }
        if (filters.gruppo) {
            let groupNames = item.groupNames || [];
            groupNames = groupNames.map(name => name.toLowerCase());
            if (!groupNames.includes(filters.gruppo)) return false;
        }
        if (item.levelRequirement < filters.livelloMin || item.levelRequirement > filters.livelloMax || item.levelRequirement === undefined) return false;

        // Filter by stat range (allow any range if not specified)
        if (filters.statsRange) {
            const { statName, minValue, maxValue } = filters.statsRange;
            const stat = item.stats.find(s => s.stat === statName);
            if (stat && (stat.minValue < minValue || stat.maxValue > maxValue)) return false;
        }

        // Filter by rarity (allow any rarity if not specified)
        if (filters.rarity && item.rarity !== filters.rarity) return false;

        // Filter by name (allow any name if not specified)
        if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) return false;

        // Filter by description (allow any description if not specified)
        if (filters.description && !item.description.toLowerCase().includes(filters.description.toLowerCase())) return false;

        return true;
    })
        .sort((a, b) => {
            // Order by stat if provided
            if (filters.orderByStats) {
                const statA = a.stats.find(s => s.stat === filters.orderByStats);
                const statB = b.stats.find(s => s.stat === filters.orderByStats);

                if (statA && statB) {
                    return statB.maxValue - statA.maxValue; // Sort descending by max value
                }
            }
            return 0;
        });
}

// Aggiungi il listener per il form di filtro
document.getElementById('filter-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var livello = slider.noUiSlider.get();
    var stats = document.getElementsByClassName("filter-row")
    var output = {}
    for(var i = 0; i < stats.length; i++) {
        var statName = stats[i].getElementsByTagName("input")[0].value;
        var minValue = stats[i].getElementsByTagName("input")[1].value;
        var maxValue = stats[i].getElementsByTagName("input")[2].value;

        if (statName && minValue && maxValue) {
            output[statName] = { minValue: parseInt(minValue), maxValue: parseInt(maxValue) };
        }
    }
    const filters = {
        type: document.getElementById('type').value,
        livelloMin: livello[0],
        livelloMax: livello[1],
        stats: output,
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        gruppo: document.getElementById('gruppo').value,
        rarity: document.getElementById('rarita').value,
    };

    const filteredItems = filterItems(items, filters);
    updateResults(filteredItems);
});

// Funzione per aggiornare la lista degli oggetti filtrati
function updateResults(items) {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = ''; // Svuota la lista esistente

    items.forEach(item => {
        const listItem = document.createElement('li');
        let htmlContent = '';

        if (item.name) {
            htmlContent += `<span>Nome:</span> ${item.name}<br>`;
        }
        if (item.rarity) {
            htmlContent += `<span>Rarità:</span> ${item.rarity}<br>`;
        }
        if (item.type) {
            htmlContent += `<span>Tipo:</span> ${item.type}<br>`;
        }
        if (item.levelRequirement) {
            htmlContent += `<span>Livello richiesto:</span> ${item.levelRequirement}<br>`;
        }
        if (item.description) {
            htmlContent += `<span>Descrizione:</span> ${item.description}<br>`;
        }
        if (item.stats && item.stats.length > 0) {
            htmlContent += `<span>Stat:</span> ${item.stats.map(stat => {
                if (stat.minValue === stat.maxValue) {
                    return `${stat.minValue} ${stat.stat}`;
                } else {
                    return `${stat.minValue} - ${stat.maxValue} ${stat.stat}`;
                }
            }).join(', ')}<br>`;
        }
        htmlContent += `<span>Gem Slots:</span> ${item.gemSlots}<br>`;
        htmlContent += `<span>Enchantable:</span> ${item.enchantable}<br>`;
        if (item.specialFlag) {
            htmlContent += `<span>Special Flag:</span> ${item.specialFlag}<br>`;
        }
        if (item.groupNames && item.groupNames.length > 0) {
            htmlContent += `<span>Group Names:</span> ${item.groupNames.join(', ')}<br>`;
        }
        if (item.passive) {
            htmlContent += `<span>Passive:</span> ${item.passive}<br>`;
        }

        listItem.innerHTML = htmlContent;
        itemList.appendChild(listItem);
    });

    if (items.length === 0) {
        itemList.innerHTML = '<li>Nessun oggetto trovato.</li>';
    }
}

// Bottone "Filtro Abilità"
document.getElementById('add-ability-filter').addEventListener('click', function() {
    var container = document.getElementById('ability-filters');

    // Crea il contenitore della nuova riga
    var filterRow = document.createElement('div');
    filterRow.style.marginTop = "10px";
    filterRow.style.display = "flex";
    filterRow.style.gap = "10px";
    filterRow.style.alignItems = "center";
    filterRow.className = "filter-row";

    // Crea gli input
    var abilityInput = document.createElement('input');
    abilityInput.type = 'text';
    abilityInput.placeholder = 'Nome abilità';
    abilityInput.name = 'ability-name[]';

    var minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.placeholder = 'Min';
    minInput.name = 'ability-min[]';
    minInput.style.width = "70px";

    var maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.placeholder = 'Max';
    maxInput.name = 'ability-max[]';
    maxInput.style.width = "70px";

    // Bottone per rimuovere la riga
    var removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Rimuovi';
    removeButton.onclick = function() {
        container.removeChild(filterRow);
    };

    // Aggiungi tutto alla riga
    filterRow.appendChild(abilityInput);
    filterRow.appendChild(minInput);
    filterRow.appendChild(maxInput);
    filterRow.appendChild(removeButton);

    // Aggiungi la riga al contenitore
    container.appendChild(filterRow);
});