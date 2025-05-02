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

function checkGems(id, n) {
    let nameCheck = id.split("-")[0]
    if (n === 0) {
        document.getElementById(nameCheck + "-modifications").style.display = "none";
        let gems = document.getElementsByClassName(nameCheck + "-gems");
        if (gems.length > 0) {
            // Delete all the elements
            for (let i = 0; i < gems.length; i++) {
                gems[i].remove();
            }
        }
    } else {
        let gems = document.getElementById(nameCheck + "-modifications");
        gems.style.display = "inline";
        let gemsCount = document.getElementsByClassName(nameCheck + "-gems");
        if (gemsCount.length !== n) {
            // Delete all the elements
            for (let i = 0; i < gemsCount.length; i++) {
                gemsCount[i].remove();
            }
        }
        for (let i = 0; i < n; i++) {
            // Create this under gems
            /*
            <span class="helmet-gem">
                        <input type="text" id="helmet-gem-1" list="helmet-gem-1-suggestions">
                        <datalist id="helmet-gem-1-suggestions"></datalist>
                    </span>
             */
            let gem = document.createElement("span");
            gem.className = nameCheck + "-gems";
            gem.classList.add("gem");
            gem.classList.add(nameCheck + "-gem-" + (i + 1));
            gem.innerHTML = `
                <input type="text" id="${nameCheck}-gem-${i + 1}" list="${nameCheck}-gem-${i + 1}-suggestions">
                <datalist id="${nameCheck}-gem-${i + 1}-suggestions"></datalist>
            `;
            // Populate datalist
            const datalist = document.getElementById(`${nameCheck}-gem-${i + 1}-suggestions`);
            const seenNames = new Set(); // Avoid duplicates
            items.forEach(item => {
                if (item.type === "Gem" && !seenNames.has(item.name)) {
                    const option = document.createElement('option');
                    option.value = item.name;
                    datalist.appendChild(option);
                    seenNames.add(item.name);
                }
            });
            // Append the gem to the parent
            const parent = document.getElementById(nameCheck + "-gems");
            parent.appendChild(gem);
            // Add event listener to the new input
            const newInput = gem.querySelector('input');
            newInput.addEventListener('change', update);
        }
    }
}

// Dummy update function for example
function update() {
    const inputNames = Array.from(document.querySelectorAll('#filter-form input'))
        .map(input => [input.list.id, input.value])

    let itemsBuilder = []
    inputNames.forEach(inputs => {
        let inputName = inputs[1].trim();
        if (inputName === "") {
            checkGems(inputs[0], 0);
        } else {
            items.forEach(item => {
                if (item.name === inputName) {
                    itemsBuilder.push(item);
                    // Check for the gem slots
                    checkGems(inputs[0], item.gemSlots);
                }
            });
        }
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

const attributes = {
    offensive: [
        "More Earth Damage",
        "Fire Damage",
        "Physical Damage",
        "Elemental Damage",
        "More Shadow Damage",
        "Earth Damage",
        "Fire Damage",
        "More Ice Damage",
        "Lightning Damage",
        "Critical Damage",
        "More Lightning Damage",
        "More Light Damage",
        "More Fire Damage",
        "True Damage",
        "Bleed Damage",
        "Rage On Hit",
        "Attack Speed",
        "Critical Chance",
        "Bleed Chance",
        "Poison Chance",
        "Poison Duration",
        "Extra Projectiles",
        "Projectile Speed",
        "Projectile Damage",
        "Multishot",
        "Rage When Hit",
        "Sneak Attack Damage",
        "Melee Reach",
        "Sneak Skill"
    ],
    defensive: [
        "Armor Penetration",
        "Block",
        "Evasion",
        "Poison Resistance",
        "Armor",
        "Life On Kill",
        "Block Recovery",
        "Element Status Chance",
        "Maximum Barrier",
        "Life Regeneration",
        "Reflected Damage",
        "Maximum Life",
        "Elemental Resist",
        "Poison Resistance",
        "Ice Resistance",
        "Bleed Damage",
        "Life From Potions",
        "Damage Reduction",
        "Lightning Resistance",
        "Energy From Potions",
        "Life From Potions",
        "Shorter Barrier Delay",
        "Dodge Chance",
        "Burning Resistance",
        "PvP Defence",
        "Barrier Recharge Rate",
        "More Max. Barrier",
        "PvP Attack",
        "Stealthiness",
        "Energy When Hit",
        "Energy On Hit",
        "Energy On Kill",
        "Energy Regeneration"
    ],
    support: [
        "Skill XP",
        "Cooldown Reduction",
        "Loot Bonus",
        "Loot Rarity",
        "Gathering Speed",
        "Combat XP",
        "Mining Gems",
        "Fishing Treasures",
        "Mining Speed",
        "Fishing Speed",
        "Potion Refill Speed",
        "Crafting Skill",
        "Healing Power",
        "Ability Damage",
        "Character Size",
        "Energy On Kill",
        "Energy When Hit",
        "Maximum Minions",
        "Minion Damage",
        "Max Earth Runes",
        "Max. Rage",
        "Rage On Kill",
        "Sneak Skill"
    ],
    misc: [
        "Bits Dropped",
        "Bits Kept On Death",
        "Loot Rarity",
        "Maximum Energy",
        "Maximum Rage",
        "Movement Speed",
        "Rage On Kill",
        "Life From Potions",
        "PvP Attack",
        "PvP Defence",
        "Jump Height",
        "Reduced Gravity",
        "Reduced Fall Damage",
        "Sneak Skill",
        "Shorter Barrier Delay",
        "Rage On Hit",
        "Piety",
        "Maximum Faith"
    ]
};
function displayItemDetails(item) {
    const resultsDiv = document.getElementById('results');
    const passiveDiv = document.getElementById('passive-list');
    const outputStats = resultsDiv.querySelector('.output-stats');

    // Clear the output-stats section only
    outputStats.innerHTML = '';
    passiveDiv.innerHTML = '';

    // Stats
    let toAdd;

    for (const category in attributes) {
        toAdd = false;
        const container = document.createElement('div');
        container.className = 'item-container';


        // Hidden title row for internal use or hover
        const hiddenTitleRow = document.createElement('div');
        hiddenTitleRow.className = 'center divTitle';
        const hiddenTitle = document.createElement('a');
        hiddenTitle.className = `item-title ${item.rarity || 'Common'}`;
        hiddenTitle.textContent = category;
        hiddenTitleRow.appendChild(hiddenTitle);
        container.appendChild(hiddenTitleRow);

        // Now check every stats
        let stats = []
        for(const [stat, value] of Object.entries(item.stats)) {
            if (attributes[category].includes(stat)) {
                stats.push({stat, value})
            }
        }
        if (stats.length === 0) {
            const noStats = document.createElement('div');
            noStats.textContent = `No ${category} stats found.`;
            container.appendChild(noStats);
        } else {
            stats.forEach(stat => {
                const statLine = document.createElement('div');
                statLine.className = 'stat-row';

                const center = document.createElement('div');
                center.className = 'stat-name';
                center.textContent = stat.stat;

                const right = document.createElement('div');
                right.className = `stat-value ${stat.value < 0 ? 'negative' : 'positive'}`;
                right.textContent = `${stat.value}`;

                statLine.appendChild(center);
                statLine.appendChild(right);
                container.appendChild(statLine);
                toAdd = true;
            });
        }

        if (toAdd)
            outputStats.appendChild(container);
    }

    // Passives

    for (const [category, effects] of Object.entries(item.passives)) {
        if (!effects || effects.length === 0) continue;

        const container = document.createElement('div');
        container.className = 'item-container';

        // Hidden title row
        const hiddenTitleRow = document.createElement('div');
        hiddenTitleRow.className = 'center divTitle';
        const hiddenTitle = document.createElement('a');
        hiddenTitle.className = `item-title ${item.rarity || 'Common'}`;
        hiddenTitle.textContent = category;
        hiddenTitleRow.appendChild(hiddenTitle);
        container.appendChild(hiddenTitleRow);

        // Passive entries
        effects.forEach(effect => {
            const effectLine = document.createElement('div');
            effectLine.className = 'passive-row';
            effectLine.textContent = effect;
            container.appendChild(effectLine);
        });

        passiveDiv.appendChild(container);
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

    return `${window.location.origin}${window.location.pathname}?data=${LZString.compressToEncodedURIComponent(params.toString())}`;
}

window.addEventListener('DOMContentLoaded', () => {
    (async () => {
        while (isLoading) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const params = new URLSearchParams(window.location.search);
        const compressed = params.get("data");

        if (compressed) {
            const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
            const decompressedParams = new URLSearchParams(decompressed);

            decompressedParams.forEach((value, key) => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = value;
                    if (typeof input.update === 'function') {
                        input.update();
                    }
                }
            });
        } else {
            // If no compression, fallback to normal behavior
            params.forEach((value, key) => {
                const input = document.getElementById(key);
                if (input) {
                    input.value = value;
                    if (typeof input.update === 'function') {
                        input.update();
                    }
                }
            });
        }

        update();
    })();
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
        notification()
    });
});

document.getElementById('short-link-button').addEventListener('click', () => {
    const link = generateLink(); // later replace this with a shortener call
    navigator.clipboard.writeText(link).then(() => {
        notification()
    });
});

function notification() {
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
}