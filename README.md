# Turn-Based Tactical Slingshot Destruction

## Incremental Development

- [1-polygon-load-2](1-polygon-load-2)
- [2-polygon-load-3](2-polygon-load-3)
- [2-polygon-decomposition-1](2-polygon-decomposition-1)
- [2-polygon-decomposition-2](2-polygon-decomposition-2)
- [2-polygon-decomposition-3](2-polygon-decomposition-3)
- [2-polygon-decomposition-4](2-polygon-decomposition-4)
- [2-polygon-decomposition-5](2-polygon-decomposition-5)
- [2-polygon-decomposition-6](2-polygon-decomposition-6)
- [2-polygon-decomposition-7](2-polygon-decomposition-7)
- [2-polygon-decomposition-8](2-polygon-decomposition-8)
- [3-player-weapons-1](3-player-weapons-1)
- [3-player-weapons-2](3-player-weapons-2)
- [3-player-weapons-3](3-player-weapons-3)
- [4-camara-1](4-camara-1)

## 0 - The interface

### Goals
1. The game use canvas to render the game so it should fill the viewport.
2. The game use WEBGL to render the game.

## 1 - Polygon Load

### Goals
1. Parse a SVG path command into a set of points to create a polygon.
2. Create a Matter Body from the polygon.

## Challenges
1. SVG path commands are not a polygon, but a set of instructions to draw a path.

## 3 - Physics

### Question
1. P5 + Matter or just Matter?