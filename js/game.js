// Game constants and data
const UPGRADE_IDS = {
    SOY: 'soy',
    LENTILS: 'lentils',
    LIQUIDS: 'liquids',
    NYQUIL: 'nyquil',
    SLEEP: 'sleep',
    IVERMECTIN: 'ivermectin'
};

const INITIAL_UPGRADES = {
    [UPGRADE_IDS.SOY]: {
        id: UPGRADE_IDS.SOY,
        name: 'Soy Milk',
        description: "Doesn't actually help much, but it makes you feel better.",
        level: 0,
        baseCost: 15,
        hpPerSecond: 5,
        costIncreaseFactor: 1.11,
    },
    [UPGRADE_IDS.LENTILS]: {
        id: UPGRADE_IDS.LENTILS,
        name: 'Lentils',
        description: "I dunno, you like this stuff. I guess it has fiber?",
        level: 0,
        baseCost: 200,
        hpPerSecond: 50,
        costIncreaseFactor: 1.11,
    },
    [UPGRADE_IDS.LIQUIDS]: {
        id: UPGRADE_IDS.LIQUIDS,
        name: 'Liquids',
        description: 'Stay hydrated to feel better.',
        level: 0,
        baseCost: 1000,
        hpPerSecond: 500,
        costIncreaseFactor: 1.10,
    },
    [UPGRADE_IDS.NYQUIL]: {
        id: UPGRADE_IDS.NYQUIL,
        name: 'NyQuil',
        description: 'The nighttime, sniffling, sneezing, coughing, aching, stuffy head, fever, so you can rest medicine.',
        level: 0,
        baseCost: 6000,
        hpPerSecond: 2000,
        costIncreaseFactor: 1.10,
    },
    [UPGRADE_IDS.SLEEP]: {
        id: UPGRADE_IDS.SLEEP,
        name: 'A Good Night\'s Sleep',
        description: 'The ultimate healer. Generates a lot of health.',
        level: 0,
        baseCost: 20000,
        hpPerSecond: 10000,
        costIncreaseFactor: 1.11,
    },
    [UPGRADE_IDS.IVERMECTIN]: {
        id: UPGRADE_IDS.IVERMECTIN,
        name: 'Ivermectin',
        description: '50% chance to increase HP/sec by 50%, 50% chance to decrease HP/sec by 25%, 10% chance to turn you into a horse',
        level: 0,
        baseCost: 75000,
        hpPerSecond: 'Variable', // Will show as "Variable HP/sec" in UI
        costIncreaseFactor: 2.5,
    },
};

// Utility functions
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

function calculateUpgradeCost(upgrade) {
    return Math.ceil(upgrade.baseCost * Math.pow(upgrade.costIncreaseFactor, upgrade.level));
}

function calculateHpPerSecond(upgrades) {
    return Object.values(upgrades).reduce((total, upgrade) => {
        return total + (upgrade.hpPerSecond || 0) * upgrade.level;
    }, 0);
}

function calculateHpPerClick(upgrades) {
    return 1 + Object.values(upgrades).reduce((total, upgrade) => {
        return total + (upgrade.hpPerClick || 0) * upgrade.level;
    }, 0);
}

// Alpine.js game data
function gameData() {
    return {
        // Game state
        healthPoints: 0,
        hpPerSecond: 0,
        hpPerClick: 1,
        upgrades: structuredClone(INITIAL_UPGRADES),
        floatingNumbers: [],
        gameTimer: null,
        saveTimer: null,
        winCondition: 500_000_000,
        isHorse: false,
        isGlowing: false,
        ivermectinMultiplier: 1, // Tracks the cumulative effect of Ivermectin purchases

        // Computed properties
        get healthPercentage() {
            return Math.min(100, (this.healthPoints / this.winCondition) * 100);
        },
        
        get isWon() {
            return this.healthPercentage >= 100;
        },
        
        get characterColor() {
            if (this.healthPercentage > 75) return 'text-green-400';
            if (this.healthPercentage > 35) return 'text-yellow-400';
            return 'text-red-500';
        },

        // Methods
        formatNumber,
        
        getUpgradeCost(upgrade) {
            return calculateUpgradeCost(upgrade);
        },
        
        canAfford(upgrade) {
            return this.healthPoints >= this.getUpgradeCost(upgrade);
        },
        
        updateDerivedStats() {
            // Calculate base HP/sec from all upgrades except Ivermectin
            const baseHpPerSecond = Object.values(this.upgrades).reduce((total, upgrade) => {
                if (upgrade.id === UPGRADE_IDS.IVERMECTIN) return total;
                return total + (upgrade.hpPerSecond || 0) * upgrade.level;
            }, 0);
            
            // Apply Ivermectin multiplier to the base
            this.hpPerSecond = baseHpPerSecond * this.ivermectinMultiplier;
            this.hpPerClick = calculateHpPerClick(this.upgrades);
        },
        
        fightVirus() {
            const clickValue = this.hpPerClick;
            this.healthPoints += clickValue;
            
            // Add floating number animation
            const floatingNumber = {
                id: Date.now() + Math.random(),
                value: formatNumber(clickValue)
            };
            this.floatingNumbers.push(floatingNumber);
            
            // Remove floating number after animation
            setTimeout(() => {
                this.floatingNumbers = this.floatingNumbers.filter(n => n.id !== floatingNumber.id);
            }, 1500);
        },
        
        buyUpgrade(upgradeId) {
            const upgrade = this.upgrades[upgradeId];
            const cost = this.getUpgradeCost(upgrade);
            const currentHPS = this.hpPerSecond;
            
            if (this.healthPoints < cost) return;
            
            this.healthPoints -= cost;
            
            // Trigger glow animation
            this.triggerGlow();
            
            // Special handling for Ivermectin
            if (upgradeId === UPGRADE_IDS.IVERMECTIN) {
                const roll = Math.random();
                const horseRoll = Math.random();
                upgrade.level += 1;
                
                // 10% chance to become a horse (but only if not already a horse)
                if (horseRoll <= 0.1 && !this.isHorse) {
                    this.isHorse = true;
                }
                
                let effectText;
                if (roll <= 0.5) { // 50% chance of bad outcome
                    // Bad outcome: reduce multiplier by 25%
                    this.ivermectinMultiplier *= 0.75;
                    effectText = "-25% HP/sec";
                } else { // 50% chance of good outcome
                    // Good outcome: increase multiplier by 50%
                    this.ivermectinMultiplier *= 1.5;
                    effectText = "+50% HP/sec";
                }

                // Add floating number animation showing the actual effect
                const floatingNumber = {
                    id: Date.now() + Math.random(),
                    value: effectText
                };
                this.floatingNumbers.push(floatingNumber);
                
                // Remove floating number after animation
                setTimeout(() => {
                    this.floatingNumbers = this.floatingNumbers.filter(n => n.id !== floatingNumber.id);
                }, 1500);

                console.log(`Ivermectin upgrade rolled: ${roll.toFixed(2)}, horse roll: ${horseRoll.toFixed(2)}`);
                console.log(`Ivermectin multiplier changed to: ${this.ivermectinMultiplier}`);
                
                // Recalculate HP/sec with new multiplier
                this.updateDerivedStats();
            } else {
                // Normal upgrade
                upgrade.level += 1;
                this.updateDerivedStats();
                
                // Add floating number animation showing upgrade value
                const floatingNumber = {
                    id: Date.now() + Math.random(),
                    value: `+${formatNumber(upgrade.hpPerSecond)}/sec`
                };
                this.floatingNumbers.push(floatingNumber);
                
                // Remove floating number after animation
                setTimeout(() => {
                    this.floatingNumbers = this.floatingNumbers.filter(n => n.id !== floatingNumber.id);
                }, 1500);
            }
        },
        
        triggerGlow() {
            this.isGlowing = true;
            setTimeout(() => {
                this.isGlowing = false;
            }, 600); // Match animation duration
        },
        
        saveGame() {
            const gameState = {
                healthPoints: this.healthPoints,
                hpPerSecond: this.hpPerSecond,
                hpPerClick: this.hpPerClick,
                upgrades: this.upgrades,
                isHorse: this.isHorse,
                ivermectinMultiplier: this.ivermectinMultiplier,
                timestamp: Date.now()
            };
            localStorage.setItem('joyces-covid-game-save', JSON.stringify(gameState));
            console.log('💾 Game saved automatically');
        },
        
        loadGame() {
            const savedData = localStorage.getItem('joyces-covid-game-save');
            if (savedData) {
                try {
                    const gameState = JSON.parse(savedData);
                    this.healthPoints = gameState.healthPoints || 0;
                    this.hpPerSecond = gameState.hpPerSecond || 0;
                    this.hpPerClick = gameState.hpPerClick || 1;
                    this.isHorse = gameState.isHorse || false;
                    this.ivermectinMultiplier = gameState.ivermectinMultiplier || 1;
                    
                    // Merge saved upgrades with new upgrades
                    this.upgrades = structuredClone(INITIAL_UPGRADES);
                    if (gameState.upgrades) {
                        // Copy over saved upgrade levels and any dynamic properties
                        Object.keys(gameState.upgrades).forEach(upgradeId => {
                            if (this.upgrades[upgradeId]) {
                                this.upgrades[upgradeId].level = gameState.upgrades[upgradeId].level || 0;
                                // Copy over dynamic hpPerSecond for Ivermectin
                                if (upgradeId === UPGRADE_IDS.IVERMECTIN && gameState.upgrades[upgradeId].hpPerSecond !== undefined) {
                                    this.upgrades[upgradeId].hpPerSecond = gameState.upgrades[upgradeId].hpPerSecond;
                                }
                            }
                        });
                    }
                    
                    console.log('💾 Game loaded from save');
                    return true;
                } catch (error) {
                    console.log('⚠️ Save file corrupted, starting fresh');
                    return false;
                }
            }
            return false;
        },
        
        deleteSave() {
            localStorage.removeItem('joyces-covid-game-save');
            console.log('🗑️ Save file deleted');
        },
        
        startGame() {
            // Try to load saved game first
            if (!this.loadGame()) {
                // If no save exists, use initial state
                this.updateDerivedStats();
            }
            
            // Main game loop - runs every second
            this.gameTimer = setInterval(() => {
                if (!this.isWon) {
                    this.healthPoints += this.hpPerSecond;
                }
            }, 1000);
            
            // Auto-save every 10 seconds
            this.saveTimer = setInterval(() => {
                this.saveGame();
            }, 10000);
        },
        
        resetGame() {
            // Reset all game state
            this.healthPoints = 0;
            this.hpPerSecond = 0;
            this.hpPerClick = 1;
            this.upgrades = structuredClone(INITIAL_UPGRADES);
            this.floatingNumbers = [];
            this.isHorse = false;
            this.isGlowing = false;
            this.ivermectinMultiplier = 1;
            
            // Clear existing timers
            if (this.gameTimer) {
                clearInterval(this.gameTimer);
            }
            if (this.saveTimer) {
                clearInterval(this.saveTimer);
            }
            
            // Delete save file
            this.deleteSave();
            
            // Restart game
            this.startGame();
        }
    };
}

// Make gameData globally available for Alpine.js
window.gameData = gameData;

// Secret console commands for testing
window.cheat = {
    setHealth: (amount) => {
        const gameInstance = Alpine.$data(document.querySelector('[x-data]'));
        gameInstance.healthPoints = amount;
        console.log(`Health set to ${amount}`);
    },
    setHpPerSec: (amount) => {
        const gameInstance = Alpine.$data(document.querySelector('[x-data]'));
        gameInstance.hpPerSecond = amount;
        console.log(`HP/sec set to ${amount}`);
    },
    makeHorse: () => {
        const gameInstance = Alpine.$data(document.querySelector('[x-data]'));
        gameInstance.isHorse = true;
        console.log('🐴 You are now a horse!');
    },
    unmakeHorse: () => {
        const gameInstance = Alpine.$data(document.querySelector('[x-data]'));
        gameInstance.isHorse = false;
        console.log('👤 You are no longer a horse!');
    },
    win: () => {
        const gameInstance = Alpine.$data(document.querySelector('[x-data]'));
        gameInstance.healthPoints = gameInstance.winCondition;
        console.log('🎉 You won!');
    },
    reset: () => {
        const gameInstance = Alpine.$data(document.querySelector('[x-data]'));
        gameInstance.resetGame();
        console.log('🔄 Game reset!');
    },
    help: () => {
        console.log(`
🎮 Secret Console Commands:
cheat.setHealth(1000000) - Set health points
cheat.setHpPerSec(5000)   - Set health per second
cheat.makeHorse()         - Transform into horse
cheat.unmakeHorse()       - Transform back to human
cheat.win()               - Instantly win the game
cheat.help()              - Show this help
        `);
    }
};

// Show help on load
console.log('🎮 Type cheat.help() for secret commands!');

// Alternative shorthand
window.c = window.cheat;