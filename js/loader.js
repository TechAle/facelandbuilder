class Item {
    constructor(data) {
        this.name = data.strippedName || data.name || 'Unnamed';
        if (!names.includes(this.name)) {
            names.push(this.name);
        }
        if (this.name === "Gorebunny Fang") {
            let a = 0
        }
        this.rarity = data.rarity || 'Common';
        if (!rarities.includes(this.rarity)) {
            rarities.push(this.rarity);
        }
        this.type = data.tier || data.title || 'Unknown'; // Prefer 'tier' if exists
        if (!types.includes(this.type)) {
            types.push(this.type);
        }

        // Extract level requirement from description if exists
        this.levelRequirement = this.extractLevelRequirement(data.description);
        this.skillRequirement = this.extractSkilllRequirement(data.description);

        // Description: prefer flavorText if available, else clean description
        this.description = ""
        if (data.flavorText && data.flavorText.length > 0) {
            this.description = Item.replaceWtf(data.flavorText.map(Item.stripColors).join(' '))
        } else {
            this.description = data.description
                .filter(line => line.trim() !== '' && !Item.isStatLine(line)
                    && line.indexOf("Level Requirement") === -1 && line.indexOf("Skill Requirement") === -1
                    && line.indexOf("Skill XP") === -1)
                .map(Item.replaceWtf)
                .map(Item.stripColors)
                .join(' ');
        }

        // Stats: lines from description that look like stat bonuses
        this.stats = data.description
            .filter(line => Item.isStatLine(line))
            .map(line => Item.parseStatLine(Item.stripColors(line))); // Strip colors before parsing
        this.stats = this.stats.map(stat => {
            if (stat[0] === false) {
                this.description += " " + stat[1]; // Append the failed parse to the description
                return false;
            }
            return stat
        })
        this.stats = this.stats.filter(stat => stat !== false); // Remove any failed parses

        this.gemSlots = data.gemSlots || 0;
        this.enchantable = !!data.enchantable;
        this.specialFlag = data.specialFlag || null;
        this.passive = data.passives || data.passive || null;
        if (this.passive) {
            this.passive = this.passive.map(stat => {
              return Item.replaceWtf(stat)
            })
        }
        if (this.passive && this.passive.length > 0) {
            this.passive = this.passive.filter(stat => Item.isStatLine(stat))
                                        .map(stat => Item.stripColors(stat).trim())
            }
        this.groupNames = data.groupNames || [];
        if (this.groupNames.length > 0) {
            this.groupNames = this.groupNames.map(groupName => groupName.trim().replace("Any ", ""));
            this.groupNames.forEach(groupName => {
                if (!group.includes(groupName)) {
                    group.push(groupName);
                }
            });
        }
        this.dropBase = data.dropBase;
        this.dropRange = data.dropRange;
    }

    static stripColors(text) {
        // Remove all color codes like |pink|, |lgray|, |dgray|, etc.
        return text.replace(/\|[a-z]*\|/gi, '');
    }

    static replaceWtf(text) {
        return text.replace("儔", " Life").replace("儀", " Physical Damage").replace("峑", " Range")
            .replace("儠", " Life Regen").replace("儡", "Barrier Regen").replace("億", " Lightning Damage")
            .replace("儓", " Energy").replace("峐", " Rage").replace("儗", " Barrier")
            .replace("儃", " Ice Damage")
            .replace("|none|东慳", "[On Cast]").replace("|none|丙", "[On Kill]").replace("|none|且", "[Combat Start]")
            .replace("|none|东", "[On Cast]").replace("|none|丑", "[When Hit]").replace("|none|世", "[On Death]")
            .replace("|none|丕", "[On Exit Combat]").replace("|none|丝", "[On Air Jump]").replace("|none|丗", "[Ability Mod] ")
            .replace("|none|丐", "[On Hit]").replace("|none|业", "[On Cast]").replace("|none|丛", "[On Dodge]")
            .replace(/[丗丝东业丕丑且丙丐丘丛]/g, "")
    }

    static isStatLine(text) {
        // Detect if a line is likely a "stat" rather than description
        const clean = Item.stripColors(text).trim();
        return (!clean.includes("Level")) && (!clean.includes("Skill Requirement")) && clean.length > 0 && clean.indexOf(" ") !== -1
    }

    static parseStatLine(text) {
        let clean = text.trim();

        // Initialize the dictionary to return
        let result = {
            isPercentage: false,
            minValue: null,
            maxValue: null,
            stat: '',
        };

        // Check percentages
        if (clean.indexOf("%") !== -1) {
            result.isPercentage = true;
            clean = clean.replace(/%/g, ""); // Remove percentage sign
        }

        // Check sign value
        let sign = 1;
        if (clean.indexOf("+") !== -1) {
            sign = 1;
            clean = clean.replace("+", ""); // Remove plus sign
        } else if (clean.indexOf("-") !== -1) {
            sign = -1;
            clean = clean.replace("-", ""); // Remove minus sign
        }

        // Min and max value for ranges
        if (clean.indexOf("(") !== -1) {
            const parts = clean.split("(");
            const value = parts[1].split(")")[0].trim();
            [result.minValue, result.maxValue] = value.split(" to ").map(v => parseInt(v.trim(), 10)); // Split range into min and max
            result.minValue *= sign; // Apply sign
            result.maxValue *= sign; // Apply sign
            clean = clean.split(")")[1].trim(); // Get remaining stat description
        } else {
            // If no range, extract single value and stat
            [result.minValue, result.maxValue] = [parseInt(clean.split(" ")[0], 10), parseInt(clean.split(" ")[0], 10)];
            result.minValue *= sign; // Apply sign
            result.maxValue *= sign; // Apply sign
            clean = clean.split(" ").slice(1).join(" ").trim();
        }

        // Cleaned up stat
        result.stat = clean.trim();
        if (isNaN(result.minValue) || isNaN(result.maxValue)) {
            return [false, this.replaceWtf(text)]
        }
        if (!statsList.includes(result.stat)) {
            statsList.push(result.stat);
        }

        return result;
    }


    extractLevelRequirement(descriptionArray) {
        if (!descriptionArray || descriptionArray.length === 0) return null;
        for (let line of descriptionArray) {
            const clean = Item.stripColors(line).trim();
            const match = clean.match(/^Level Requirement: (\d+)/i);
            if (match) {
                return parseInt(match[1], 10);
            }
        }
        return null;
    }

    extractSkilllRequirement(descriptionArray) {
        if (!descriptionArray || descriptionArray.length === 0) return null;
        for (let line of descriptionArray) {
            const clean = Item.stripColors(line).trim();
            const match = clean.match(/^Skill Requirement: (\d+)/i);
            if (match) {
                return parseInt(match[1], 10);
            }
        }
        return null;
    }
}
const items = []
const names = []
const rarities = []
const types = []
const group = []
const statsList = []
let isLoading = true


function loadFileIntoVariable(url) {
    return fetch(url)
        .then(response => response.text());
}

// Small function to unescape JavaScript string escape sequences
function unescapeJSString(str) {
    return str
        .replace(/\\(['"\\bfnrtv])/g, function(match, char) {
            switch (char) {
                case "'": return "'";
                case '"': return '"';
                case '\\': return '\\';
                case 'b': return '\b';
                case 'f': return '\f';
                case 'n': return '\n';
                case 'r': return '\r';
                case 't': return '\t';
                case 'v': return '\v';
            }
        })
        .replace(/\\u([\dA-Fa-f]{4})/g, function(match, hex) {
            return String.fromCharCode(parseInt(hex, 16));
        })
        .replace(/\\x([\dA-Fa-f]{2})/g, function(match, hex) {
            return String.fromCharCode(parseInt(hex, 16));
        });
}
let a = false
loadFileIntoVariable("https://face.land/#/").then(response => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, 'text/html');

    const scriptTags = Array.from(doc.querySelectorAll('script[src]'));
    const matchingScript = scriptTags.find(script =>
        script.getAttribute('src').includes("/static/js/main")
    );

    if (matchingScript) {
        const scriptSrc = matchingScript.getAttribute('src');
        // Usage:
        loadFileIntoVariable("https://face.land/static/js" + scriptSrc.split("/static/js")[1])
            .then(fileContent => {
                let parts = fileContent.split("JSON.parse('[{");
                parts.shift(); // remove the first part (before first JSON.parse)

                let lines = parts.map(part => part.split("}]')")[0]);
                lines = lines.map(line => "[{" + line + "}]");

                // Unescape each string before parsing
                lines = lines.map(line => unescapeJSString(line));
                lines = lines.map(line => JSON.parse(line));

                lines.forEach(line => {
                    line.forEach(item => {
                        items.push(new Item(item));
                    });
                });
                isLoading = false;

            })
            .catch(error => {
                console.error("Error loading or parsing file:", error);
            });

    } else {
        console.error("Matching script tag not found");
    }
});


