# Joyce's COVID Game

A simple clicker game where you fight COVID by clicking to gain health points and purchasing upgrades to recover faster. This version was rewritten using vanilla JavaScript and Alpine.js as an experiment with Claude Code.

## Installation and Setup

This game requires no build tools or installation steps! Simply open the HTML file in your browser.

1. **Download or clone this repository**
2. **Open `game.html` in any modern web browser**
   - You can double-click the file to open it directly, or
   - Use a local web server (recommended for best performance and to avoid potential CORS issues)

### Using a Local Web Server (Optional but Recommended)

For the best experience, serve the files through a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have it)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000/game.html` in your browser.

## How to Play

1. **Click "Fight Virus!"** to gain health points
2. **Buy upgrades** to increase your health points per second
3. **Reach 100% cured** to win the game

## Game Structure

This game uses a simple, modern JavaScript architecture that's easy to understand and modify:

### Files Overview

- **`game.html`** - The main game file. Open this in your browser to play.
- **`js/game.js`** - Contains all game logic using vanilla JavaScript and Alpine.js
- **`README.md`** - This file with instructions and documentation

### Code Architecture

The game is built with [Alpine.js](https://alpinejs.dev/), a lightweight JavaScript framework that provides reactive data binding without the complexity of React or Vue.

#### Key Components in `js/game.js`:

1. **Game Constants** (`UPGRADE_IDS`, `INITIAL_UPGRADES`)
   - Defines all upgrade types and their properties
   - Easy to modify upgrade costs, effects, and descriptions

2. **Utility Functions**
   - `formatNumber()` - Formats large numbers (1.2K, 1.5M, etc.)
   - `calculateUpgradeCost()` - Determines cost based on upgrade level
   - `calculateHpPerSecond()` - Sums up health points per second from upgrades

3. **Main Game Logic** (`gameData()` function)
   - **State Management**: Tracks health points, upgrades, floating numbers
   - **Game Loop**: Runs every second to add passive health points
   - **User Actions**: Handles clicking and buying upgrades
   - **Special Mechanics**: Ivermectin risk/reward system

#### Alpine.js Integration:

The HTML uses Alpine.js directives:
- `x-data="gameData()"` - Connects the JavaScript game state to the HTML
- `x-show` - Shows/hides elements based on game state
- `@click` - Handles button clicks
- `x-text` - Updates text content reactively
- `:class` and `:style` - Updates styling based on game state

### Making Changes

#### Adding New Upgrades

1. **Add to `UPGRADE_IDS`** with a unique key
2. **Add to `INITIAL_UPGRADES`** with properties:
   - `id`, `name`, `description`
   - `baseCost`, `costIncreaseFactor`
   - `hpPerSecond` (health per second) or `hpPerClick` (health per click)
3. **Optional**: Add special logic in `buyUpgrade()` method

#### Modifying Game Balance

- Change `winCondition` (default: 1 billion health points)
- Adjust upgrade costs and effects in `INITIAL_UPGRADES`
- Modify Ivermectin risk percentages in `buyUpgrade()` method

#### Styling Changes

- Edit CSS in the `<style>` section of `game.html`
- Modify Tailwind classes in the HTML
- Change character appearance by editing the SVG in the character display section

#### Adding New Features

Since the game uses Alpine.js:
1. Add new properties to the `gameData()` return object
2. Add new methods for your feature's logic
3. Update the HTML to use your new data/methods with Alpine.js directives

## Technologies Used

- **HTML5** - Game structure
- **Tailwind CSS** - Styling and responsive design
- **Alpine.js** - Reactive JavaScript framework
- **Vanilla JavaScript** - Game logic and calculations
- **SVG** - Character graphics and animations

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- SVG

## Secret Console Commands (For Testing)

The game includes secret console commands for testing and debugging. Open your browser's developer console (F12) and try these:

### Basic Commands
```javascript
cheat.setHealth(1000000)    // Set health to any amount
cheat.setHpPerSec(5000)     // Set health per second
cheat.makeHorse()           // Transform into a horse 🐴
cheat.unmakeHorse()         // Transform back to human
cheat.win()                 // Instantly win the game
cheat.help()                // Show all available commands
```

### Shorthand Commands
```javascript
c.setHealth(500000)         // Same as cheat.setHealth()
c.makeHorse()               // Same as cheat.makeHorse()
// All commands work with 'c.' prefix for convenience
```

### Testing Examples
```javascript
// Test the horse transformation (changes Ivermectin icon)
c.makeHorse()

// Test near-win state (win condition is 1 billion health)
c.setHealth(999000000)

// Test high income rate
c.setHpPerSec(10000)

// See the win screen
c.win()
```

**Note**: These commands modify the actual game state in real-time and are perfect for testing different scenarios without having to play through the entire game.

## Credits

- **Original Concept**: COVID clicker game concept
- **Rewrite**: Converted from React/TypeScript to vanilla JavaScript with Alpine.js
- **Built with**: Claude Code as an experiment in AI-assisted development
- **Special Thanks**: To Joe Rogan for inspiring the Ivermectin upgrade icon (it's a joke!)

## License

This is a fun experimental project. Feel free to modify and share!