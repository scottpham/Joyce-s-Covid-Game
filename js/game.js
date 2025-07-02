// Game constants and data
const UPGRADE_IDS = {
    LIQUIDS: 'liquids',
    NYQUIL: 'nyquil',
    SLEEP: 'sleep',
    IVERMECTIN: 'ivermectin'
};

const INITIAL_UPGRADES = {
    [UPGRADE_IDS.LIQUIDS]: {
        id: UPGRADE_IDS.LIQUIDS,
        name: 'Liquids',
        description: 'Stay hydrated to feel better.',
        level: 0,
        baseCost: 15,
        hpPerSecond: 1,
        costIncreaseFactor: 1.15,
    },
    [UPGRADE_IDS.NYQUIL]: {
        id: UPGRADE_IDS.NYQUIL,
        name: 'NyQuil',
        description: 'The nighttime, sniffling, sneezing, coughing, aching, stuffy head, fever, so you can rest medicine.',
        level: 0,
        baseCost: 100,
        hpPerSecond: 8,
        costIncreaseFactor: 1.15,
    },
    [UPGRADE_IDS.SLEEP]: {
        id: UPGRADE_IDS.SLEEP,
        name: 'A Good Night\'s Sleep',
        description: 'The ultimate healer. Generates a lot of health.',
        level: 0,
        baseCost: 1100,
        hpPerSecond: 50,
        costIncreaseFactor: 1.15,
    },
    [UPGRADE_IDS.IVERMECTIN]: {
        id: UPGRADE_IDS.IVERMECTIN,
        name: 'Ivermectin',
        description: '50% chance to make you feel better, 50% chance to make you feel worse, 50% to change you into a horse',
        level: 0,
        baseCost: 5000,
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
        winCondition: 1_000_000_000,
        isHorse: false,

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
            this.hpPerSecond = calculateHpPerSecond(this.upgrades);
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
            
            if (this.healthPoints < cost) return;
            
            this.healthPoints -= cost;
            
            // Special handling for Ivermectin
            if (upgradeId === UPGRADE_IDS.IVERMECTIN) {
                const roll = Math.random();
                const horseRoll = Math.random();
                upgrade.level += 1;
                
                // 10% chance to become a horse (but only if not already a horse)
                if (horseRoll <= 0.1 && !this.isHorse) {
                    this.isHorse = true;
                }
                
                if (roll <= 0.3) { // Actually 30% chance of bad outcome (secret!)
                    // Reduces current HPS by 25% (less harsh than the original 50%)
                    this.hpPerSecond = Math.max(0, this.hpPerSecond * 0.75);
                } else { // Actually 70% chance of good outcome (secret!)
                    // 2.5x multiplier for current HPS
                    this.hpPerSecond = this.hpPerSecond * 2.5;
                }
            } else {
                // Normal upgrade
                upgrade.level += 1;
                this.updateDerivedStats();
            }
        },
        
        startGame() {
            this.updateDerivedStats();
            
            // Main game loop - runs every second
            this.gameTimer = setInterval(() => {
                if (!this.isWon) {
                    this.healthPoints += this.hpPerSecond;
                }
            }, 1000);
        },
        
        resetGame() {
            // Reset all game state
            this.healthPoints = 0;
            this.hpPerSecond = 0;
            this.hpPerClick = 1;
            this.upgrades = structuredClone(INITIAL_UPGRADES);
            this.floatingNumbers = [];
            this.isHorse = false;
            
            // Clear existing timer
            if (this.gameTimer) {
                clearInterval(this.gameTimer);
            }
            
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