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
|floorKey|log(n)|returns greatest key less than or equal to given key|
|floorEntry|log(n)|returns entry with greatest key less than or equal to given key|
|ceilingKey|log(n)|returns least key greater than or equal to given key|
|ceilingEntry|log(n)|returns entry with least key greater than or equal to given key|
|lowerKey|log(n)|returns greatest key strictly less than given key|
|lowerEntry|log(n)|returns entry with greatest key strictly less than given key|
|higherKey|log(n)|returns least key strictly greater than given key|
|higherEntry|log(n)|returns entry with least key strictly greater than given key|
|subMap|log(n)|returns view of portion of map (view creation)|
|headMap|log(n)|returns view of map with keys less than given key (view creation)|
|tailMap|log(n)|returns view of map with keys greater than or equal to given key (view creation)|
|firstKey|log(n)|returns first (lowest) key|
|firstEntry|log(n)|returns entry with first (lowest) key|
|lastKey|log(n)|returns last (highest) key|
|lastEntry|log(n)|returns entry with last (highest) key|
|pollFirstEntry|log(n)|removes and returns entry with first (lowest) key|
|pollLastEntry|log(n)|removes and returns entry with last (highest) key|
|descendingMap|log(n)|returns reverse order view of map (view creation)|
|descendingKeySet|log(n)|returns reverse order view of keys (view creation)|

