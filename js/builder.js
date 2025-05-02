const slotMap = {
    "helmet-suggestions": ["Hat", "Coif", "Helmet"],
    "chestplate-suggestions": ["Robe", "Platebody", "Tunic"],
    "leggings-suggestions": ["Pants", "Greaves", "Platelegs", "Skirt"],
    "boots-suggestions": ["Shoes"],
    "mainhand-suggestions": [
        "Pistol", "Dagger", "Musket", "Wand", "Sword", "Longbow", "Mace", "Shortbow", "Hoe",
        "Battle Axe", "Rod", "Pickaxe", "Staff", "Warhammer", "Lumber Axe"
    ],
    "offhand-suggestions": [
        "Spellbook", "Quiver", "Greatshield", "Buckler", "Ammunition", "Kiteshield"
    ],
    "necklace-suggestions": ["Necklace"],
    "ring1-suggestions": ["Ring"],
    "ring2-suggestions": ["Ring"],
    "trinket-suggestions": ["Trinket"],
    "earring1-suggestions": ["Earring"],
    "earring2-suggestions": ["Earring"]
};

(async () => {
    while (isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Populate datalists
    for (const [datalistId, validTypes] of Object.entries(slotMap)) {
        const datalist = document.getElementById(datalistId);
        const seenNames = new Set(); // Avoid duplicates

        items.forEach(item => {
            if (validTypes.includes(item.type) && !seenNames.has(item.name)) {
                const option = document.createElement('option');
                option.value = item.name;
                datalist.appendChild(option);
                seenNames.add(item.name);
            }
        });
    }
})()

// Attach 'change' event listeners to all inputs in the form
document.querySelectorAll('#filter-form input').forEach(input => {
    input.addEventListener('change', update);
});

// Dummy update function for example
function update() {
    const inputNames = Array.from(document.querySelectorAll('#filter-form input'))
        .map(input => input.value)
        .filter(name => name); // filters out empty or undefined names

    let itemsBuilder = []
    inputNames.forEach(inputName => {
        items.forEach(item => {
            if (item.name === inputName) {
                itemsBuilder.push(item);
            }
        });
    });
    updateResults(itemsBuilder);
    let output = {
        "stats": {},
        "passives": {}
    }
    // TODO percentages
    itemsBuilder.forEach(item => {
        if (item.passive) {
            let currentStatus = ""
            let currentModification = ""
            item.passive.forEach(stat => {
                if (stat.includes("[On") || stat.includes("[When") || stat.includes("[Combat")
                    || stat.includes("[Ability")) {
                    if (currentStatus !== "") {
                        if (!output.passives[currentStatus]) {
                            output.passives[currentStatus] = [];
                        }
                        output.passives[currentStatus].push(currentModification);
                    }
                    currentStatus = stat;
                } else {
                    currentModification += stat + " ";
                }
            });
            if (currentStatus !== "") {
                if (!output.passives[currentStatus]) {
                    output.passives[currentStatus] = [];
                }
                output.passives[currentStatus].push(currentModification);
            }
        }
        item.stats.forEach(stat => {
            if (!output.stats[stat.stat]) {
                output.stats[stat.stat] = 0;
            }
            output.stats[stat.stat] += stat.maxValue;
        })
    })
    displayItemDetails(output);
}

function displayItemDetails(item) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) return;

    const outputStats = resultsDiv.querySelector('.output-stats');
    if (!outputStats) return;

    // Clear the output-stats section only
    outputStats.innerHTML = '';

    // Stats
    const statsTitle = document.createElement('h3');
    statsTitle.textContent = 'Stats:';
    outputStats.appendChild(statsTitle);

    for (const [key, value] of Object.entries(item.stats)) {
        const statLine = document.createElement('div');
        statLine.textContent = `${key}: ${value}`;
        outputStats.appendChild(statLine);
    }

    // Passives
    const passivesTitle = document.createElement('h3');
    passivesTitle.textContent = 'Passives:';
    outputStats.appendChild(passivesTitle);

    for (const [category, effects] of Object.entries(item.passives)) {
        const categoryTitle = document.createElement('strong');
        categoryTitle.textContent = category;
        outputStats.appendChild(categoryTitle);

        effects.forEach(effect => {
            const passiveLine = document.createElement('div');
            passiveLine.textContent = effect;
            outputStats.appendChild(passiveLine);
        });
    }
}
