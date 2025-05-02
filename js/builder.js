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

function generateLink() {
    const inputs = document.querySelectorAll('#filter-form input');
    const params = new URLSearchParams();

    inputs.forEach(input => {
        if (input.value.trim()) {
            params.set(input.id, input.value.trim());
        }
    });

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Copied to clipboard:', text);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    (async () => {
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        const params = new URLSearchParams(window.location.search);

        params.forEach((value, key) => {
            const input = document.getElementById(key);
            if (input) {
                input.value = value;
                if (typeof input.update === 'function') {
                    input.update(); // Optional: call update if your input has this custom method
                }
            }
        });
        update()
    })()
});


document.getElementById('long-link-button').addEventListener('click', () => {
    const order = [
        'typeHelmet',
        'typeChestplate',
        'typeLeggings',
        'typeBoots',
        'typeRing1',
        'typeRing2',
        'typeEarring1',
        'typeEarring2',
        'typeNecklace',
        'typeTrinket',
        'typeOffhand',
        'typeMainhand',
    ];

    const inputs = order.map(id => {
        const input = document.getElementById(id);
        return input ? input.value.trim() : '';
    });

    // Use current URL as base
    const currentUrl = window.location.href.split('#')[0]; // This excludes the hash part if it's already there

    // Append the input values to the URL (you could also use encoding or something more complex here)
    const buildText = `FaceBuilder build:\n> ${inputs.join('\n> ')}`;

    // Create the full text and set it in the input
    const fullText = `${currentUrl}#10_placeholder\n${buildText}`;

    navigator.clipboard.writeText(fullText).then(() => {
        // Show the notification
        const notification = document.getElementById('notification');
        notification.style.display = 'block';
        notification.style.opacity = 1;  // Reset opacity to ensure smooth transition

        // Fade out the notification after 2 seconds
        setTimeout(() => {
            notification.style.opacity = 0;  // Start fading
        }, 100);

        // After 3 seconds (1 second after fading out), hide the notification completely
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    });
});

document.getElementById('short-link-button').addEventListener('click', () => {
    const link = generateLink(); // later replace this with a shortener call
    copyToClipboard(link);
});
