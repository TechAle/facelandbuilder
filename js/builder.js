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