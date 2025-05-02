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
        }

        if (item.dropBase <= 0 || item.dropRange <= -1) {
            const dropRow = document.createElement('div');
            dropRow.className = 'row';
            dropRow.innerHTML = `<b>Global Drop</b>`;
            container.appendChild(dropRow);
        } else if (item.dropRange === 0) {
            const dropRow = document.createElement('div');
            dropRow.className = 'row';
            dropRow.innerHTML = `<b>Drop:</b> Specific mobs level ${item.dropBase}`;
            container.appendChild(dropRow);
        } else {
            const dropRow = document.createElement('div');
            dropRow.className = 'row';
            let minDrop = item.dropBase - item.dropRange;
            if (minDrop < 1) {
                minDrop = 1;
            }
            let maxDrop = item.dropBase + item.dropRange;
            if (maxDrop > 100)
                maxDrop = 100;
            dropRow.innerHTML = `<b>Drop:</b> ${minDrop} <b> - </b> ${maxDrop}`;
            container.appendChild(dropRow);
        }


        itemList.appendChild(container);
    });
}