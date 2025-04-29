function filterItems(items, filters) {
    return items.filter(item => {
        // Filter by item type (allow any type if not specified)
        if (filters.type && item.type !== filters.type) return false;

        if (filters.gruppo) {
            let groupNames = item.groupNames || [];
            groupNames = groupNames.map(name => name.toLowerCase());
            if (!groupNames.includes(filters.gruppo)) return false;
        }
        if (item.levelRequirement < filters.livelloMin || item.levelRequirement > filters.livelloMax || item.levelRequirement === undefined) return false;
        // Filter by stats (allow any stat if not specified)
        for (let key in filters.stats) {
            if (key !== undefined) {
                const statName = key;
                const stat = item.stats.find(s => s.stat === key);
                if (stat) {
                    if (stat.minValue < filters.stats[key].minValue || stat.maxValue > filters.stats[key].maxValue) return false;
                } else {
                    return false;
                }
            }
        }

        if (filters.sortValue) {
            const statName = filters.sortValue;
            const stat = item.stats.find(s => s.stat === statName);
            if (!stat) return false;
        }

        // Filter by rarity (allow any rarity if not specified)
        if (filters.rarity && item.rarity !== filters.rarity) return false;

        // Filter by name (allow any name if not specified)
        if (filters.name && !item.name.toLowerCase().includes(filters.name.toLowerCase())) return false;

        // Filter by description (allow any description if not specified)
        if (filters.description && !item.description.toLowerCase().includes(filters.description.toLowerCase())) return false;

        return true;
    })
}

// Aggiungi il listener per il form di filtro
document.getElementById('filter-form').addEventListener('submit', function(event) {
    event.preventDefault();

    var livello = slider.noUiSlider.get();
    var stats = document.getElementsByClassName("filter-row")
    var output = {}
    for(var i = 0; i < stats.length; i++) {
        var statName = stats[i].getElementsByTagName("input")[0].value;
        var minValue = stats[i].getElementsByTagName("input")[1].value || -9999;
        var maxValue = stats[i].getElementsByTagName("input")[2].value || 9999;

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
        sortValue: document.getElementById('sort').value,
    };

    const filteredItems = filterItems(items, filters);
    if (filters.sortValue) {
        filteredItems.sort((a, b) => {
            const aStat = a.stats.find(s => s.stat === filters.sortValue);
            const bStat = b.stats.find(s => s.stat === filters.sortValue);
            if (isAscending) {
                return aStat.minValue - bStat.minValue;
            } else {
                return bStat.maxValue - aStat.maxValue;
            }
        });

    }
    updateResults(filteredItems);
});

// Funzione per aggiornare la lista degli oggetti filtrati
function updateResults(items) {
    const itemList = document.getElementById('item-list');
    itemList.innerHTML = ''; // Clear existing list

    if (items.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'item-container center';
        emptyDiv.textContent = 'No item found.';
        itemList.appendChild(emptyDiv);
        return;
    }

    items.forEach((item, index) => {
        const container = document.createElement('div');
        container.className = 'item-container';
        container.id = `item${index}`;

        // Hidden title row for internal use or hover
        const hiddenTitleRow = document.createElement('div');
        hiddenTitleRow.className = 'center divTitle';
        const hiddenTitle = document.createElement('a');
        hiddenTitle.className = `item-title ${item.rarity || 'Common'}`;
        hiddenTitle.textContent = item.name || 'Sconosciuto';
        hiddenTitleRow.appendChild(hiddenTitle);
        container.appendChild(hiddenTitleRow);

        // Icon section with rarity-based radial gradient
        const iconContainer = document.createElement('div');
        iconContainer.className = 'center';
        const iconWrapper = document.createElement('div');
        iconWrapper.className = `icon-wrapper ${item.rarity || 'Common'}`;

        const iconImage = document.createElement('div');
        iconImage.className = 'item-icon';

// Format type for filename: remove spaces and capitalize properly
        const typeName = item.type?.replace(/\s+/g, '_') || 'Trinket'; // fallback to Trinket
        iconImage.style.backgroundImage = `url('img/${typeName}.webp')`;

        iconWrapper.appendChild(iconImage);
        iconContainer.appendChild(iconWrapper);
        container.appendChild(iconContainer);

        // Example: Damage Types
        if (item.damage) {
            item.damage.forEach(dmg => {
                const row = document.createElement('div');
                row.className = 'row center';
                row.innerHTML = `<span class="${dmg.element}">${dmg.element}</span><span> Damage: ${dmg.min}-${dmg.max}</span>`;
                container.appendChild(row);
            });
        }

        // Requirements
        if (item.levelRequirement) {
            const levelRow = document.createElement('div');
            levelRow.className = 'row';
            levelRow.textContent = `Combat Level Min: ${item.levelRequirement}`;
            container.appendChild(levelRow);
        }
        if (item.skillRequirement) {
            const skillRow = document.createElement('div');
            skillRow.className = 'row';
            skillRow.textContent = `Skill Requirement: ${item.skillRequirement}`;
            container.appendChild(skillRow);
        }


        // Stat block (min/max or fixed)
        if (item.stats && item.stats.length > 0) {
            item.stats.forEach(stat => {
                const statRow = document.createElement('div');
                statRow.className = 'stat-row';

                const left = document.createElement('div');
                left.className = `stat-value ${stat.minValue < 0 ? 'negative' : 'positive'}`;
                left.textContent = `${stat.minValue}${stat.unit || ''}`;

                const center = document.createElement('div');
                center.className = 'stat-name';
                center.textContent = stat.stat;

                const right = document.createElement('div');
                right.className = `stat-value ${stat.maxValue < 0 ? 'negative' : 'positive'}`;
                right.textContent = `${stat.maxValue}${stat.unit || ''}`;

                statRow.appendChild(left);
                statRow.appendChild(center);
                statRow.appendChild(right);

                container.appendChild(statRow);
            });
        }


        // Gem slots and enchantable
        if ((typeof item.gemSlots !== 'undefined' && item.gemSlots !== 0) || (typeof item.enchantable !== 'undefined' && item.enchantable)) {
            const row = document.createElement('div');
            row.className = 'row';
            row.innerHTML = `<b>Gem Slots:</b> ${item.gemSlots || 0} <b>Enchantable:</b> ${item.enchantable ? 'Yes' : 'No'}`;
            container.appendChild(row);
        }

        // Passive
        if (item.passive && item.passive.length > 0) {
            const passiveRow = document.createElement('div');
            passiveRow.className = 'row';
            passiveRow.innerHTML = `<b class="${item.rarity || 'Common'}">+Passive:</b> <span class="passive-desc">${item.passive}</span>`;
            container.appendChild(passiveRow);
            const br = document.createElement('br');
            container.appendChild(br);
        }

        // Description
        if (item.description && item.description.length > 0) {
            const descriptionRow = document.createElement('div');
            descriptionRow.className = 'description';
            descriptionRow.innerHTML = `${item.description}`;
            container.appendChild(descriptionRow);
            const br = document.createElement('br');
            container.appendChild(br);
        }


        itemList.appendChild(container);
    });
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
    abilityInput.placeholder = 'Name ability';
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
    removeButton.textContent = 'Delete';
    removeButton.onclick = function() {
        container.removeChild(filterRow);
    };
    // Aggiungi datalist
    var datalist = document.createElement('datalist');
    datalist.id = 'ability-suggestions';
    abilityInput.setAttribute('list', 'ability-suggestions');
    // Aggiungi tutti statsList
    statsList.forEach(stat => {
        const option = document.createElement('option');
        option.value = stat;
        datalist.appendChild(option);
    });

    // Aggiungi tutto alla riga
    filterRow.appendChild(abilityInput);
    filterRow.appendChild(minInput);
    filterRow.appendChild(maxInput);
    filterRow.appendChild(removeButton);
    filterRow.appendChild(datalist);

    // Aggiungi la riga al contenitore
    container.appendChild(filterRow);
});

(async () => {
    while (!items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    const datalistType = document.getElementById('type-suggestions');

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        datalistType.appendChild(option);
    });

    const datalistRarita = document.getElementById('rarity-suggestions');

    rarities.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        datalistRarita.appendChild(option);
    });

    const datalistGruppo = document.getElementById('group-suggestions');

    group.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        datalistGruppo.appendChild(option);
    });

    const datalistNome = document.getElementById('name-suggestions');

    names.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        datalistNome.appendChild(option);
    });

    const datalistSort = document.getElementById('sort-suggestions');

    statsList.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        datalistSort.appendChild(option);
    });

})()

let isAscending = true;  // Track the current sort order

function toggleSortOrder() {
    const arrow = document.getElementById('sort-arrow');

    // Toggle the arrow direction
    if (isAscending) {
        arrow.classList.remove('arrow-up');
        arrow.classList.add('arrow-down');
    } else {
        arrow.classList.remove('arrow-down');
        arrow.classList.add('arrow-up');
    }

    // Toggle the sorting state (ascending or descending)
    isAscending = !isAscending;

}


