---
title: Snake and Ladder Game
description: Low-Level Design for Snake and Ladder Board Game
---

## Problem Statement

Design a Snake and Ladder board game that can be played by multiple players. The system should handle game initialization, player movements, snake and ladder mechanics, dice rolls, turn management, and determine the winner. Support both human and computer players.

## Requirements

### Functional Requirements
1. Initialize game board with configurable size (default 100 cells)
2. Place snakes and ladders at specific positions
3. Support 2-4 players
4. Roll dice (1-6) for each player's turn
5. Move player tokens based on dice roll
6. Handle snake bites (move down)
7. Handle ladder climbs (move up)
8. Determine winner when a player reaches the final cell
9. Handle exact landing on final cell
10. Support both human and AI players

### Non-Functional Requirements
1. Fair random dice generation
2. Clear game state visualization
3. Turn-based sequential gameplay
4. Extensible for different board sizes
5. Support game state persistence

## Simplified Overview

```plantuml
@startuml
skinparam componentStyle rectangle

package "Game Core" {
    [Game] as GameCore
    interface "IBoard" as Board
    interface "IDice" as Dice
}

package "Players" {
    interface "IPlayer" as Player
    interface "IPlayerStrategy" as Strategy
    [HumanStrategy]
    [AIStrategy]
}

package "Board Elements" {
    [Cell]
    [Snake]
    [Ladder]
}

package "Game Control" {
    [GameController] as Controller
    interface "IDisplay" as Display
}

[GameDriver] --> Controller : uses
Controller *-- GameCore : composed of
Controller *-- Display : composed of
GameCore *-- Board : composed of
GameCore *-- Dice : composed of
GameCore o-- Player : manages
Player *-- Strategy : composed of
Strategy <|.. HumanStrategy
Strategy <|.. AIStrategy
Board o-- Cell : contains
Board o-- Snake : has
Board o-- Ladder : has

@enduml
```

## Detailed Class Diagram

```plantuml
@startuml

enum PlayerType {
    HUMAN
    COMPUTER
}

enum CellType {
    NORMAL
    SNAKE_HEAD
    SNAKE_TAIL
    LADDER_START
    LADDER_END
}

class Cell {
    - position: int
    - type: CellType
    + Cell(position: int)
    + getPosition(): int
    + getType(): CellType
}

class Snake {
    - head: int
    - tail: int
    + Snake(head: int, tail: int)
    + getHead(): int
    + getTail(): int
}

class Ladder {
    - start: int
    - end: int
    + Ladder(start: int, end: int)
    + getStart(): int
    + getEnd(): int
}

abstract class Player {
    - playerId: String
    - name: String
    - currentPosition: int
    - type: PlayerType
    + Player(playerId: String, name: String)
    + move(steps: int): void
    + getCurrentPosition(): int
    + hasWon(boardSize: int): boolean
}

class HumanPlayer {
    + HumanPlayer(playerId: String, name: String)
}

class ComputerPlayer {
    - difficulty: String
    + ComputerPlayer(playerId: String, name: String)
}

class Dice {
    - numberOfDice: int
    - minValue: int
    - maxValue: int
    + Dice()
    + Dice(numberOfDice: int)
    + roll(): int
    - generateRandom(): int
}

class Board {
    - size: int
    - cells: List<Cell>
    - snakes: Map<Integer, Snake>
    - ladders: Map<Integer, Ladder>
    + Board(size: int)
    + addSnake(snake: Snake): void
    + addLadder(ladder: Ladder): void
    + getNewPosition(position: int): int
    + hasSnake(position: int): boolean
    + hasLadder(position: int): boolean
    + isValidPosition(position: int): boolean
}

class Game {
    - gameId: String
    - board: Board
    - players: List<Player>
    - dice: Dice
    - currentPlayerIndex: int
    - winner: Player
    - isGameOver: boolean
    + Game(boardSize: int)
    + addPlayer(player: Player): void
    + start(): void
    + playTurn(): void
    + movePlayer(player: Player, steps: int): void
    + checkWinner(player: Player): boolean
    + getCurrentPlayer(): Player
    + isGameOver(): boolean
}

class GameController {
    - game: Game
    - display: Display
    + GameController()
    + initializeGame(boardSize: int, playerCount: int): void
    + startGame(): void
    + processPlayerTurn(): void
    + showGameStatus(): void
}

interface Display {
    + showBoard(board: Board, players: List<Player>): void
    + showPlayerTurn(player: Player): void
    + showDiceRoll(player: Player, roll: int): void
    + showMove(player: Player, from: int, to: int): void
    + showSnakeBite(player: Player, from: int, to: int): void
    + showLadderClimb(player: Player, from: int, to: int): void
    + showWinner(player: Player): void
}

class ConsoleDisplay {
    + showBoard(board: Board, players: List<Player>): void
    + showPlayerTurn(player: Player): void
    + showDiceRoll(player: Player, roll: int): void
    + showMove(player: Player, from: int, to: int): void
    + showSnakeBite(player: Player, from: int, to: int): void
    + showLadderClimb(player: Player, from: int, to: int): void
    + showWinner(player: Player): void
}

class GameHistory {
    - moves: List<Move>
    + addMove(move: Move): void
    + getMoves(): List<Move>
    + getPlayerMoves(playerId: String): List<Move>
}

class Move {
    - player: Player
    - diceRoll: int
    - fromPosition: int
    - toPosition: int
    - timestamp: DateTime
    + Move(player: Player, roll: int, from: int, to: int)
}

Cell *-- CellType
Player <|-- HumanPlayer
Player <|-- ComputerPlayer
Player *-- PlayerType
Board o-- Cell : contains
Board o-- Snake : has
Board o-- Ladder : has
Game *-- Board : composed of
Game o-- Player : manages
Game *-- Dice : composed of
Game o-- GameHistory : tracks
GameHistory o-- Move : stores
Move o-- Player
GameController *-- Game : composed of
GameController *-- Display : composed of
Display <|.. ConsoleDisplay

@enduml
```

## Key Design Patterns

1. **[Factory Pattern](/low-level-design/patterns/creational-patterns/#factory-method)**: Create different player types
2. **[Strategy Pattern](/low-level-design/patterns/behavioural-patterns/#strategy-pattern)**: Different display strategies
3. **[Observer Pattern](/low-level-design/patterns/behavioural-patterns/#observer-pattern)**: Game state notifications
4. **[Builder Pattern](/low-level-design/patterns/creational-patterns/#builder-pattern)**: Game configuration
5. **[Singleton Pattern](/low-level-design/patterns/singleton/)**: Game controller

### Design Pattern Diagrams

#### 1. Builder Pattern - Game Configuration

```plantuml
@startuml

title Builder Pattern - Game Setup

class GameBuilder {
  - boardSize: int
  - players: List<Player>
  - snakes: List<Snake>
  - ladders: List<Ladder>
  - diceType: DiceType
  
  + setBoardSize(int): GameBuilder
  + addPlayer(Player): GameBuilder
  + addSnake(head, tail): GameBuilder
  + addLadder(start, end): GameBuilder
  + setDiceType(DiceType): GameBuilder
  + withDefaultSnakesAndLadders(): GameBuilder
  + build(): Game
}

class Game {
  - board: Board
  - players: List<Player>
  - dice: Dice
  - Game(board, players, dice)
  + start(): void
  + playTurn(): void
}

GameBuilder ..> Game : creates

note right of GameBuilder
  **Code Example:**
  
  // Simple game with defaults
  Game game = new GameBuilder()
      .setBoardSize(100)
      .addPlayer(new HumanPlayer("Alice"))
      .addPlayer(new HumanPlayer("Bob"))
      .withDefaultSnakesAndLadders()
      .build();
  
  // Custom game configuration
  Game customGame = new GameBuilder()
      .setBoardSize(50)
      .addPlayer(new HumanPlayer("Player1"))
      .addPlayer(new ComputerPlayer("AI-Easy", Difficulty.EASY))
      .addPlayer(new ComputerPlayer("AI-Hard", Difficulty.HARD))
      .addSnake(49, 11)  // Long snake
      .addSnake(35, 7)
      .addLadder(4, 25)  // Long ladder
      .addLadder(13, 46)
      .addLadder(33, 49)
      .setDiceType(DiceType.DOUBLE_DICE)  // Roll 2 dice
      .build();
  
  // Kids version (smaller board, more ladders)
  Game kidsGame = new GameBuilder()
      .setBoardSize(50)
      .addPlayer(new HumanPlayer("Kid1"))
      .addPlayer(new HumanPlayer("Kid2"))
      .withKidsConfiguration()  // Preset: more ladders, fewer snakes
      .build();
  
  customGame.start();
end note

note bottom of Game
  Builder Pattern Benefits:
  - Fluent, readable API
  - Complex object construction
  - Immutable Game object
  - Easy to add new configuration options
  - Validates configuration before building
end note

@enduml
```

#### 2. Strategy Pattern - Player Behavior

```plantuml
@startuml

title Strategy Pattern - Player Strategies

interface IPlayerStrategy {
  + makeDecision(gameState): Decision
  + celebrateMove(from, to): void
}

class HumanPlayerStrategy {
  + makeDecision(gameState): Decision
  + celebrateMove(from, to): void
  - waitForInput(): void
}

class EasyAIStrategy {
  + makeDecision(gameState): Decision
  + celebrateMove(from, to): void
  - randomDelay(): void
}

class HardAIStrategy {
  + makeDecision(gameState): Decision
  + celebrateMove(from, to): void
  - analyzeBestMove(): int
  - predictOpponentMoves(): void
}

class Player {
  - name: String
  - position: int
  - strategy: IPlayerStrategy
  + Player(name, IPlayerStrategy)
  + setStrategy(IPlayerStrategy): void
  + takeTurn(dice, board): int
}

IPlayerStrategy <|.. HumanPlayerStrategy
IPlayerStrategy <|.. EasyAIStrategy
IPlayerStrategy <|.. HardAIStrategy
Player *-- IPlayerStrategy

note bottom of HumanPlayerStrategy
  Waits for user input
  Shows prompts and messages
  Interactive gameplay
end note

note bottom of EasyAIStrategy
  Automatic dice roll
  Random delay for realism
  No strategy, just luck
end note

note bottom of HardAIStrategy
  Analyzes board state
  Predicts landing positions
  Avoids snakes when possible
  Targets ladder positions
end note

note right of Player
  **Code Example:**
  
  // Create different player types
  Player human = new Player(
    "Alice",
    new HumanPlayerStrategy()
  );
  
  Player easyAI = new Player(
    "Bot-Easy",
    new EasyAIStrategy()
  );
  
  Player hardAI = new Player(
    "Bot-Hard",
    new HardAIStrategy()
  );
  
  // Game loop
  for (Player player : players) {
    int diceRoll = dice.roll();
    
    // Strategy decides behavior
    Decision decision = player.getStrategy()
      .makeDecision(gameState);
    
    int newPosition = player.move(diceRoll);
    
    player.getStrategy()
      .celebrateMove(oldPosition, newPosition);
  }
  
  // Switch to autopilot mid-game
  if (userWantsAutopilot) {
    human.setStrategy(new EasyAIStrategy());
  }
end note

@enduml
```

#### 3. Observer Pattern - Game Events

```plantuml
@startuml

title Observer Pattern - Game Event Notifications

interface IGameObserver {
  + onGameStarted(game): void
  + onTurnStarted(player): void
  + onDiceRolled(player, roll): void
  + onPlayerMoved(player, from, to): void
  + onSnakeBite(player, from, to): void
  + onLadderClimb(player, from, to): void
  + onGameEnded(winner): void
}

class Game {
  - observers: List<IGameObserver>
  + addObserver(IGameObserver): void
  + removeObserver(IGameObserver): void
  + playTurn(): void
  - notifyObservers(event, data): void
}

class ConsoleDisplay {
  + onDiceRolled(player, roll): void
  + onPlayerMoved(player, from, to): void
  + onSnakeBite(player, from, to): void
  + onLadderClimb(player, from, to): void
  - printBoard(game): void
}

class GUIDisplay {
  + onPlayerMoved(player, from, to): void
  + onSnakeBite(player, from, to): void
  + onLadderClimb(player, from, to): void
  - animateMovement(from, to): void
  - playSound(eventType): void
}

class GameStatistics {
  + onDiceRolled(player, roll): void
  + onPlayerMoved(player, from, to): void
  + onSnakeBite(player, from, to): void
  + onGameEnded(winner): void
  - trackMetrics(): void
}

class GameRecorder {
  + onTurnStarted(player): void
  + onDiceRolled(player, roll): void
  + onPlayerMoved(player, from, to): void
  - saveToFile(event): void
  + replay(): void
}

Game o-- "*" IGameObserver
IGameObserver <|.. ConsoleDisplay
IGameObserver <|.. GUIDisplay
IGameObserver <|.. GameStatistics
IGameObserver <|.. GameRecorder

note bottom of Game
  **Code Example:**
  
  Game game = new Game(board, players, dice);
  
  // Register observers
  game.addObserver(new ConsoleDisplay());
  game.addObserver(new GUIDisplay());
  game.addObserver(new GameStatistics());
  game.addObserver(new GameRecorder());
  
  // Game events notify all observers
  game.start();
  // -> ConsoleDisplay: "Game started! 3 players"
  // -> GUIDisplay: Shows game board
  // -> Statistics: Start timer
  // -> Recorder: Create new game file
  
  game.playTurn();
  // Player rolls dice (value: 5)
  // -> ConsoleDisplay: "Alice rolled a 5!"
  // -> GUIDisplay: Animate dice
  // -> Statistics: Track roll distribution
  // -> Recorder: Save "ROLL: Alice, 5"
  
  // Player lands on snake at 99 -> 54
  // -> ConsoleDisplay: "Oh no! Alice hit a snake! 99 -> 54"
  // -> GUIDisplay: Animate snake bite with sound
  // -> Statistics: Increment snake_bites counter
  // -> Recorder: Save "SNAKE: Alice, 99, 54"
  
  // Easy to add new observers
  game.addObserver(new LeaderboardService());
  game.addObserver(new AchievementService());
end note

@enduml
```

## Code Snippets

### Initialize Game Board

:::note
The board validates snake and ladder positions during initialization. Snakes must go down (head > tail) and ladders must go up (start < end).
:::

```java title="Board.java" {14-28,31-35,38-42,45-53}
public class Board {
    private int size;
    private Map<Integer, Snake> snakes;
    private Map<Integer, Ladder> ladders;
    
    public Board(int size) {
        this.size = size;
        this.snakes = new HashMap<>();
        this.ladders = new HashMap<>();
        initializeDefaultSnakesAndLadders();
    }
    
    private void initializeDefaultSnakesAndLadders() {
        // Add snakes (head -> tail)
        addSnake(new Snake(99, 54));
        addSnake(new Snake(70, 55));
        addSnake(new Snake(52, 42));
        addSnake(new Snake(25, 2));
        addSnake(new Snake(95, 72));
        
        // Add ladders (start -> end)
        addLadder(new Ladder(6, 25));
        addLadder(new Ladder(11, 40));
        addLadder(new Ladder(60, 85));
        addLadder(new Ladder(46, 90));
        addLadder(new Ladder(17, 69));
    }
    
    public void addSnake(Snake snake) {
        if (snake.getHead() <= snake.getTail()) {
            throw new IllegalArgumentException("Snake head must be greater than tail");
        }
        snakes.put(snake.getHead(), snake);
    }
    
    public void addLadder(Ladder ladder) {
        if (ladder.getStart() >= ladder.getEnd()) {
            throw new IllegalArgumentException("Ladder start must be less than end");
        }
        ladders.put(ladder.getStart(), ladder);
    }
    
    public int getNewPosition(int position) {
        // Check for snake
        if (snakes.containsKey(position)) {
            return snakes.get(position).getTail();
        }
        
        // Check for ladder
        if (ladders.containsKey(position)) {
            return ladders.get(position).getEnd();
        }
        
        return position;
    }
}
```

### Play Turn

:::note
Handles a complete turn: dice roll, position calculation, board boundary check, player movement, and winner detection. Automatically advances to next player.
:::

```java title="Game.java" {2-4,10,14-15,19-23,26,30-33,37}
public class Game {
    public void playTurn() {
        if (isGameOver) {
            return;
        }
        
        Player currentPlayer = getCurrentPlayer();
        
        // Roll dice
        int diceRoll = dice.roll();
        display.showDiceRoll(currentPlayer, diceRoll);
        
        // Calculate new position
        int currentPosition = currentPlayer.getCurrentPosition();
        int newPosition = currentPosition + diceRoll;
        
        // Check if exceeds board
        if (newPosition > board.getSize()) {
            display.showMove(currentPlayer, currentPosition, currentPosition);
            nextTurn();
            return;
        }
        
        // Move player
        movePlayer(currentPlayer, newPosition);
        
        // Check for winner
        if (checkWinner(currentPlayer)) {
            winner = currentPlayer;
            isGameOver = true;
            display.showWinner(winner);
            return;
        }
        
        // Next player's turn
        nextTurn();
    }
    
    private void movePlayer(Player player, int newPosition) {
        int currentPosition = player.getCurrentPosition();
        
        // Move to new position
        player.setCurrentPosition(newPosition);
        display.showMove(player, currentPosition, newPosition);
        
        // Check for snake or ladder
        int finalPosition = board.getNewPosition(newPosition);
        
        if (finalPosition != newPosition) {
            if (finalPosition < newPosition) {
                // Snake bite
                display.showSnakeBite(player, newPosition, finalPosition);
            } else {
                // Ladder climb
                display.showLadderClimb(player, newPosition, finalPosition);
            }
            player.setCurrentPosition(finalPosition);
        }
        
        // Record move
        history.addMove(new Move(player, dice.getLastRoll(), currentPosition, 
                                player.getCurrentPosition()));
    }
    
    private void nextTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
    }
    
    private boolean checkWinner(Player player) {
        return player.getCurrentPosition() == board.getSize();
    }
}
```

### Dice Roll

```java
public class Dice {
    private int numberOfDice;
    private int minValue;
    private int maxValue;
    private Random random;
    private int lastRoll;
    
    public Dice() {
        this(1); // Single dice by default
    }
    
    public Dice(int numberOfDice) {
        this.numberOfDice = numberOfDice;
        this.minValue = 1;
        this.maxValue = 6;
        this.random = new Random();
    }
    
    public int roll() {
        int sum = 0;
        for (int i = 0; i < numberOfDice; i++) {
            sum += generateRandom();
        }
        lastRoll = sum;
        return sum;
    }
    
    private int generateRandom() {
        return random.nextInt(maxValue - minValue + 1) + minValue;
    }
    
    public int getLastRoll() {
        return lastRoll;
    }
}
```

### Game Controller

```java
public class GameController {
    private Game game;
    private Display display;
    private Scanner scanner;
    
    public void initializeGame(int boardSize, int playerCount) {
        game = new Game(boardSize);
        display = new ConsoleDisplay();
        scanner = new Scanner(System.in);
        
        // Add players
        for (int i = 0; i < playerCount; i++) {
            System.out.println("Enter name for Player " + (i + 1) + ":");
            String name = scanner.nextLine();
            
            System.out.println("Player type? (1: Human, 2: Computer):");
            int type = scanner.nextInt();
            scanner.nextLine(); // Consume newline
            
            Player player;
            if (type == 1) {
                player = new HumanPlayer("P" + (i + 1), name);
            } else {
                player = new ComputerPlayer("P" + (i + 1), name);
            }
            
            game.addPlayer(player);
        }
    }
    
    public void startGame() {
        display.showBoard(game.getBoard(), game.getPlayers());
        
        while (!game.isGameOver()) {
            Player currentPlayer = game.getCurrentPlayer();
            display.showPlayerTurn(currentPlayer);
            
            if (currentPlayer instanceof HumanPlayer) {
                System.out.println("Press Enter to roll dice...");
                scanner.nextLine();
            } else {
                // Small delay for computer player
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            
            game.playTurn();
            showGameStatus();
        }
        
        System.out.println("\nGame Over!");
        display.showWinner(game.getWinner());
    }
    
    private void showGameStatus() {
        System.out.println("\n--- Current Positions ---");
        for (Player player : game.getPlayers()) {
            System.out.println(player.getName() + ": " + 
                             player.getCurrentPosition());
        }
        System.out.println("------------------------\n");
    }
}
```

### Console Display

```java
public class ConsoleDisplay implements Display {
    @Override
    public void showDiceRoll(Player player, int roll) {
        System.out.println(player.getName() + " rolled a " + roll);
    }
    
    @Override
    public void showMove(Player player, int from, int to) {
        if (from == to) {
            System.out.println(player.getName() + " cannot move (would exceed board)");
        } else {
            System.out.println(player.getName() + " moved from " + from + " to " + to);
        }
    }
    
    @Override
    public void showSnakeBite(Player player, int from, int to) {
        System.out.println("🐍 Oh no! " + player.getName() + 
                         " was bitten by a snake at " + from + 
                         " and slid down to " + to);
    }
    
    @Override
    public void showLadderClimb(Player player, int from, int to) {
        System.out.println("🪜 Great! " + player.getName() + 
                         " found a ladder at " + from + 
                         " and climbed up to " + to);
    }
    
    @Override
    public void showWinner(Player player) {
        System.out.println("\n🎉 Congratulations! " + player.getName() + 
                         " has won the game! 🎉");
    }
    
    @Override
    public void showPlayerTurn(Player player) {
        System.out.println("\n>>> " + player.getName() + "'s turn <<<");
    }
    
    @Override
    public void showBoard(Board board, List<Player> players) {
        System.out.println("=== Snake and Ladder Game ===");
        System.out.println("Board Size: " + board.getSize());
        System.out.println("Players: " + players.size());
        System.out.println("=============================\n");
    }
}
```

### Main Game Entry

```java
public class SnakeAndLadderGame {
    public static void main(String[] args) {
        GameController controller = new GameController();
        
        System.out.println("Welcome to Snake and Ladder Game!");
        System.out.println("================================\n");
        
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Enter board size (default 100): ");
        int boardSize = scanner.nextInt();
        
        System.out.print("Enter number of players (2-4): ");
        int playerCount = scanner.nextInt();
        scanner.nextLine(); // Consume newline
        
        if (playerCount < 2 || playerCount > 4) {
            System.out.println("Invalid number of players. Setting to 2.");
            playerCount = 2;
        }
        
        controller.initializeGame(boardSize, playerCount);
        controller.startGame();
        
        scanner.close();
    }
}
```

## Extension Points

1. Add power-ups and special cells
2. Implement multiplayer over network
3. Add different game modes (timed, race)
4. Support custom board configurations
5. Add player statistics and leaderboards
6. Implement undo/redo functionality
7. Add sound effects and animations
8. Support different dice types (4-sided, 8-sided)
9. Add tournament mode with multiple rounds
10. Implement save/load game state
