function filterItems(items, filters) {
    return items.filter(item => {
        // Filter by item type (allow any type if not specified)
        if (filters.type && item.type !== filters.type) return false;

        if (item.name === "Orc Battleaxe") {
            let a = 0
        }

        // Filter by level range (allow any range if not specified)
        if (filters.levelRange) {
            const rangesStart = filters.levelRange.split("-");
            const minLevel = parseInt(rangesStart[0], 10);
            const maxLevel = parseInt(rangesStart[1], 10);
            if (items.levelRequirement !== undefined) {
                let a = 0
            }
            if (item.levelRequirement < minLevel || item.levelRequirement > maxLevel || item.levelRequirement === undefined) return false;
        }

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

    const filters = {
        type: document.getElementById('type').value,
        levelRange: document.getElementById('level-range').value,
        name: document.getElementById('name').value,
        description: document.getElementById('description').value
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
            htmlContent += `<span>Stat:</span> ${item.stats.map(stat => `${stat.minValue} - ${stat.maxValue} ${stat.stat}`).join(', ')}<br>`;
        }
        htmlContent += `<span>Gem Slots:</span> ${item.gemSlots}<br>`;
        htmlContent += `<span>Enchantable:</span> ${item.enchantable}<br>`;
        if (item.specialFlag) {
            htmlContent += `<span>Special Flag:</span> ${item.specialFlag}<br>`;
        }
        if (item.groupNames && item.groupNames.length > 0) {
            htmlContent += `<span>Group Names:</span> ${item.groupNames.join(', ')}<br>`;
        }

        listItem.innerHTML = htmlContent;
        itemList.appendChild(listItem);
    });

    if (items.length === 0) {
        itemList.innerHTML = '<li>Nessun oggetto trovato.</li>';
    }
}