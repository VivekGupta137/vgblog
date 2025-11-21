---
title: Tree Map
description: TreeMap is a map implementation that keeps its entries sorted according to the natural ordering of its keys or better still using a comparator if provided by the user at construction time.
---

## Data structure
A Red-Black tree based NavigableMap implementation. The map is sorted according to the natural ordering of its keys, or by a Comparator provided at map creation time, depending on which constructor is used.

```d2

direction: right

Map: "Map\n<<interface>>" {
  style.fill: "#87ceeb"
  style.stroke: "#4169e1"
  style.font-color: "#000"
  style.stroke-width: 2
}

SortedMap: "SortedMap\n<<interface>>" {
  style.fill: "#90ee90"
  style.stroke: "#2e8b57"
  style.font-color: "#000"
  style.stroke-width: 2
}

NavigableMap: "NavigableMap\n<<interface>>" {
  style.fill: "#ffd97d"
  style.stroke: "#ff8c00"
  style.font-color: "#000"
  style.stroke-width: 2
}

TreeMap: "TreeMap\n<<class>>" {
  style.fill: "#ffb6c1"
  style.stroke: "#c71585"
  style.font-color: "#000"
  style.stroke-width: 3
}

SortedMap -> Map: extends {
  style.stroke: "#2e8b57"
  style.stroke-width: 2
}

NavigableMap -> SortedMap: extends {
  style.stroke: "#ff8c00"
  style.stroke-width: 2
}

TreeMap -> NavigableMap: implements {
  style.stroke: "#c71585"
  style.stroke-width: 2
  style.stroke-dash: 5
}
```

## Time complexity of operations
|operation|time complexity|info|
|-|-|-|
|containsKey|log(n)|checks whether a given key exists|
|get|log(n)|finds a key|
|put|log(n)|updates a key|
|remove|log(n)|remove a key|

