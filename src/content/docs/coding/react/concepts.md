---
title: React Concepts
description: Advanced React concepts including state management, performance profiling, and optimization techniques
---

# State Management

## React Context

React Context provides a way to pass data through the component tree without manually passing props at every level. When a context value changes via its Provider, **all components consuming that context will automatically re-render**, regardless of whether they use the changed portion of the context value.

### Key Behavior

```jsx
<StoreContext.Provider value={store}>
  {/* All children that consume this context */}
</StoreContext.Provider>
```

When the provider's value changes, React will:

- Mark **all consumers** of this context for re-render
- Re-render them even if they only consume a subset of the value
- Skip components that don't use the context at all

### Example: The Re-render Problem

```jsx
const StoreContext = createContext({ a: 0, b: 0 })

function ComponentA() {
  const { a } = useContext(StoreContext)
  return <div>A: {a}</div>
}

function ComponentB() {
  const { b } = useContext(StoreContext)
  return <div>B: {b}</div>
}
```

**Problem**: When only `a` changes:

1. Provider receives a new value object (new reference)
2. React detects the context value change
3. **Both `ComponentA` and `ComponentB` re-render**
4. This happens even though `ComponentB` only uses `b`

This is a fundamental limitation of React Context — it lacks granular subscriptions.

### Can't We Just Split Contexts?

Yes — this is a common first approach to reduce unnecessary re-renders.

**Example context splitting**:
- `AuthContext` — user authentication state
- `ThemeContext` — UI theme preferences
- `FilterContext` — data filtering state
- `UIContext` — UI interaction state
- `FeatureContext` — feature-specific state

**Problems with multiple contexts**:

1. **Provider Hell**: 5-15 nested providers make the component tree hard to read
2. **Complex Dependencies**: Unclear relationships between contexts
3. **Still Coarse-Grained**: Each context still re-renders all its consumers on any change
4. **Missing Features**:
   - No middleware for side effects
   - No devtools for debugging
   - No built-in async handling
   - No persistence layer
   - No time-travel debugging

**This is where dedicated state management libraries (Redux, Zustand, Jotai) excel** — they provide fine-grained subscriptions and developer tooling.

---

## Profiling and Fixing Frontend Performance in Production

**Process**: Detect â†’ Measure â†’ Attribute â†’ Fix â†’ Verify â†’ Monitor

### 1. Identify the Performance Dimension

Before diving into tools, clarify what type of performance issue you're dealing with:

- **Load Performance**: Initial page load and critical rendering
  - Metrics: LCP (Largest Contentful Paint), TTFB (Time to First Byte), CLS (Cumulative Layout Shift), INP (Interaction to Next Paint)
- **Runtime Performance**: User interactions and UI responsiveness
  - Issues: Jank, slow interactions, excessive re-renders
- **Memory Performance**: Memory usage and leaks
  - Issues: Growing memory footprint, garbage collection pauses
- **Network Performance**: Data fetching and asset loading
  - Issues: Slow API calls, large payloads, waterfall requests

### 2. Measuring in Production with Web Vitals

**Implementation**: Instrument Web Vitals using the `web-vitals` package and send metrics to your monitoring backend. Segment data by device type, network conditions, and routes to identify bottlenecks.

**Core Web Vitals**:

- **LCP (Largest Contentful Paint)**: Time until main content is visible
  - Target: < 2.5s
  - Measures: Perceived load speed
- **INP (Interaction to Next Paint)**: Time from user interaction to visual response
  - Target: < 200ms
  - Replaces FID, measures responsiveness
- **CLS (Cumulative Layout Shift)**: Visual stability during page load
  - Target: < 0.1
  - Measures: Layout stability
- **TTFB (Time to First Byte)**: Server/CDN response time
  - Target: < 800ms
  - Measures: Backend health

**Monitoring Tools**:

```bash
npm install web-vitals
```

```jsx
import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics endpoint
  fetch('/analytics', {
    method: 'POST',
    body: JSON.stringify(metric)
  })
}

onCLS(sendToAnalytics)
onINP(sendToAnalytics)
onLCP(sendToAnalytics)
onTTFB(sendToAnalytics)
```

**Popular Services**: Google Analytics 4, Sentry, Datadog, New Relic, Vercel Analytics

### 3. Reproducing & Inspecting Locally

**Goal**: Record performance traces to identify long tasks, blocking JavaScript, layout thrashing, and unnecessary paints.

#### Chrome DevTools â€“ Performance Tab

**Setup**:
1. Enable CPU throttling (4Ã— or 6Ã— slowdown)
2. Enable network throttling (Slow 3G, Fast 3G)
3. Start recording
4. Perform the slow interaction
5. Stop and analyze

**What to Record**:
- Main thread blocking
- Long tasks (> 50ms)
- Layout/style recalculations
- JavaScript execution spikes
- Paint operations

**Red Flags to Look For**:

- **Long Purple Blocks**: JavaScript executing for too long (> 50ms), blocking the main thread and preventing interactions. This happens with heavy computations, large loops, or synchronous operations that should be async or chunked.

- **Forced Reflows**(Layout Thrashing): JavaScript reading layout properties (like `offsetHeight`) immediately after modifying the DOM, forcing the browser to recalculate layout synchronously. Browser has to stop, measure everything, then continue — very expensive when done repeatedly.
Common causes:
```jsx
// âŒ Bad: Forces layout recalculation in loop
elements.forEach(el => {
  el.style.width = '100px'  // Write
  console.log(el.offsetHeight)  // Read - forces layout!
})
```

- **Layout Thrashing**: A pattern of repeated forced reflows in quick succession (write DOM â†’ read layout â†’ write DOM â†’ read layout). The browser can't optimize because you're alternating between modifications and measurements.

- **Expensive Paints**: Large or complex visual updates taking > 16ms. Usually caused by animating properties that trigger repainting (color, background, shadows) instead of compositor-only properties (transform, opacity).

- **Long Yellow Blocks**: Style recalculation taking too long, typically from complex CSS selectors, large DOM trees (> 1000 elements), or changes affecting many elements at once.

**DevTools Color Code**: ðŸŸ£ Purple = JavaScript | ðŸŸ¡ Yellow = Style/Layout | ðŸŸ¢ Green = Paint/Composite

#### Chrome DevTools â€“ Lighthouse

**Best Use**: Baseline audits and initial diagnostics, but deep bottlenecks require performance traces and production data.

**Provides**:
- Overall performance score
- LCP element identification
- Bundle size analysis
- Unused JavaScript/CSS detection
- Accessibility and SEO checks

### 4. React-Specific Profiling

#### React DevTools Profiler

**Purpose**: Identify which components re-render, how often, and how long each render takes.

**Key Questions to Answer**:
1. **Which components re-render?** Visualize the component tree updates
2. **Why did this render?** Inspect props, state, context, or hooks that changed
3. **How expensive is each render?** Commit time per component
4. **Are there wasted renders?** Components rendering without prop/state changes
5. **Is there cascading?** Parent re-renders triggering unnecessary child renders

**How to Use**:
1. Open React DevTools
2. Go to the Profiler tab
3. Click "Record" (ðŸ”´)
4. Interact with your app
5. Stop recording and analyze

**Look For**:
- Components with **high commit times** (> 16ms for 60fps)
- **Frequent re-renders** without visible changes
- **Cascading updates** from parent to many children
- **Unstable references** (inline functions, objects)

**Common Solutions**:

```jsx
// 1. Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Heavy rendering logic
})

// 2. Stabilize callback references
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies])

// 3. Memoize computed values
const computedValue = useMemo(() => {
  return expensiveComputation(data)
}, [data])

// 4. Split components to isolate state
function Parent() {
  return (
    <>
      <StaticContent />
      <DynamicContent /> {/* Only this re-renders */}
    </>
  )
}

// 5. Move state to external store
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))
```

### 5. Common Production Fixes

#### A. Fixing Re-render Storms

**Symptoms**: Profiler shows frequent commits, UI feels sluggish during interactions

**Root Causes**:
- Context updates triggering many consumers
- Large parent state affecting many children
- Inline objects/functions creating new references
- State updates in high-frequency loops

**Solutions**:

```jsx
// âŒ Bad: Context with frequently changing state
const AppContext = createContext()
function App() {
  const [state, setState] = useState({ user, theme, filters, ui })
  return <AppContext.Provider value={state}>...</AppContext.Provider>
}

// âœ… Good: Split contexts or use external store
import { create } from 'zustand'

const useFiltersStore = create((set) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  }))
}))

function FilteredList() {
  const filters = useFiltersStore((state) => state.filters)
  // Only re-renders when filters change
}
```

**Key Strategies**:
1. Move fast-changing state out of Context
2. Use Zustand/Redux with selectors for granular subscriptions
3. Apply `React.memo` to expensive components
4. Push state down to where it's actually needed

#### B. Reducing JavaScript & Bundle Size

**Impact**: Directly improves LCP and INP by reducing parse/compile time

**Techniques**:

1. **Code Splitting with React.lazy**:
```jsx
const Chart = lazy(() => import('./HeavyChart'))

<Suspense fallback={<Loading />}>
  <Chart data={data} />
</Suspense>
```

2. **Route-Based Chunking**:
```jsx
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

3. **Tree Shaking**: Use named imports to enable dead code elimination
```jsx
// âŒ Bad: Imports entire library
import _ from 'lodash'

// âœ… Good: Only imports what you need
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
```

4. **Replace Heavy Libraries**:
- `moment.js` (289 KB) â†’ `date-fns` (13 KB per function) or `dayjs` (2 KB)
- `lodash` (full) â†’ individual imports or native methods
- Large UI libraries â†’ smaller alternatives or custom components

5. **Bundle Analysis**:
```bash
# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer

# Vite Bundle Visualizer
npm install --save-dev rollup-plugin-visualizer
```

#### C. Optimizing Network & Assets

**Impact**: Reduces LCP and improves perceived performance

**Critical Asset Optimization**:

1. **Preload Critical Resources**:
```html
<!-- Preload hero image for faster LCP -->
<link rel="preload" as="image" href="/hero.webp" />

<!-- Preload critical fonts -->
<link rel="preload" as="font" href="/fonts/main.woff2" type="font/woff2" crossorigin />

<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />
```

2. **Image Optimization**:
```html
<!-- Modern formats with fallbacks -->
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="Hero" width="1200" height="600" loading="lazy" />
</picture>

<!-- Responsive images -->
<img srcset="sm.webp 400w, lg.webp 1200w" sizes="(max-width: 400px) 400px, 1200px" />
```

3. **CDN & Caching Strategy**:
```js
// Next.js example - Cache Control headers
export async function middleware(request) {
  const response = NextResponse.next()
  
  // Static assets - cache for 1 year
  if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|css|js)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }
  
  return response
}
```

4. **Font Loading Strategy**:
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap; /* Prevents FOIT, allows FOUT */
  font-weight: 400;
}
```

#### D. Avoiding Layout Thrashing & CLS

**Impact**: Improves CLS score and visual stability

**Common Causes & Fixes**:

1. **Missing Image Dimensions**:
```jsx
// âŒ Bad: No dimensions = layout shift when loaded
<img src="photo.jpg" alt="Photo" />

// âœ… Good: Reserve space with explicit dimensions
<img src="photo.jpg" alt="Photo" width="800" height="600" />

// âœ… Better: Maintain aspect ratio with CSS
<div style={{ aspectRatio: '16/9' }}>
  <img src="photo.jpg" alt="Photo" style={{ width: '100%', height: 'auto' }} />
</div>
```

2. **Late-Loading Fonts** (FOUT - Flash of Unstyled Text):
```css
/* âŒ Bad: Default font-display causes layout shift */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2');
}

/* âœ… Good: font-display swap prevents invisible text */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2');
  font-display: swap;
}
```

3. **Dynamic Content Placeholders**:
```jsx
// âœ… Reserve space for dynamically loaded content
function AdSlot() {
  return (
    <div style={{ minHeight: '250px', width: '300px' }}>
      {adLoaded ? <Ad /> : <AdSkeleton />}
    </div>
  )
}
```

4. **Animate with Transform/Opacity Only**:
```css
/* âŒ Bad: Triggers layout */
.box {
  transition: width 0.3s, height 0.3s;
}

/* âœ… Good: GPU-accelerated, no layout */
.box {
  transition: transform 0.3s, opacity 0.3s;
}
```

#### E. Fixing Long Tasks & Interaction Lag (INP)

**Target**: Keep tasks under 50ms to maintain 60fps responsiveness

**Strategies**:

1. **Break Long Tasks into Chunks**:
```jsx
// âŒ Bad: Blocks main thread
function processItems(items) {
  items.forEach(item => heavyProcessing(item))
}

// âœ… Good: Process in chunks with yielding
async function processItems(items) {
  for (let i = 0; i < items.length; i++) {
    heavyProcessing(items[i])
    
    // Yield to main thread every 50ms
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }
}
```

2. **Use requestIdleCallback for Non-Urgent Work**:
```jsx
function lowPriorityWork() {
  requestIdleCallback((deadline) => {
    while (deadline.timeRemaining() > 0 && workQueue.length > 0) {
      const work = workQueue.shift()
      processWork(work)
    }
    
    if (workQueue.length > 0) {
      lowPriorityWork() // Continue if more work remains
    }
  })
}
```

3. **Offload Heavy Computation to Web Workers**:
```jsx
// worker.js
self.onmessage = (e) => {
  const result = expensiveComputation(e.data)
  self.postMessage(result)
}

// main.js
const worker = new Worker('worker.js')

function handleClick() {
  worker.postMessage(largeDataset)
  
  worker.onmessage = (e) => {
    updateUI(e.data)
  }
}
```

4. **Debounce and Throttle Event Handlers**:
```jsx
import { debounce, throttle } from 'lodash'

// Debounce: Wait for user to stop typing
const handleSearch = useCallback(
  debounce((query) => {
    fetchSearchResults(query)
  }, 300),
  []
)

// Throttle: Limit scroll handler execution
const handleScroll = useCallback(
  throttle(() => {
    updateScrollPosition()
  }, 100),
  []
)
```

5. **Use React 18 Transitions for Non-Urgent Updates**:
```jsx
import { useTransition } from 'react'

function SearchResults() {
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  
  const handleChange = (e) => {
    // Urgent: Update input immediately
    setQuery(e.target.value)
    
    // Non-urgent: Mark results update as transition
    startTransition(() => {
      setResults(filterResults(e.target.value))
    })
  }
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </>
  )
}
```

---

## Summary

**Performance optimization is a continuous process**:
1. **Monitor** production metrics (Web Vitals)
2. **Profile** with DevTools and React Profiler
3. **Identify** bottlenecks through data
4. **Fix** using appropriate techniques
5. **Verify** improvements with measurements
6. **Iterate** as new issues emerge

**Key Takeaways**:
- Use Web Vitals for production monitoring
- Chrome DevTools for deep performance traces
- React Profiler for component-level optimization
- Code splitting and lazy loading for bundle size
- Memoization and external stores for re-render control
- Web Workers for heavy computations
- Modern image formats and preloading for LCP
- Stable dimensions and `font-display` for CLS
- Task chunking and transitions for INP


---

## When to Use Memoization (useMemo / useCallback)

> "Memoization has a cost  memory, comparisons, and complexity  so only use it when there's a measurable benefit."

**The Core Principle**:  Don't wrap everything |  Use only when it prevents expensive work or unnecessary re-renders

### Understanding the Cost of Memoization

#### What Happens on Every Render

```jsx
const value = useMemo(() => compute(a, b), [a, b])
```

**React's process on each render**:
1. Store previous dependencies `[a, b]`
2. Compare new `[a, b]` with old (shallow comparison)
3. Decision:
   - If equal  return cached value
   - If different  run `compute()` and store new result

**Even when "doing nothing", React still**:
- Allocates memory for the cache
- Compares dependencies (array iteration + equality checks)
- Performs internal hook bookkeeping
- Traverses hook linked list

#### Memoization Overhead

| Type | Cost |
|------|------|
| **CPU** | Dependency comparisons on every render |
| **Memory** | Cached values + hook state retained in memory |
| **Hook Overhead** | Extra hook traversal & bookkeeping |
| **Cognitive** | More complex code, stale closure bugs, harder maintenance |

## How do you handle performance in animation-heavy or real-time UIs?

> "I think in terms of the browser's frame budget — at 60fps you have ~16ms per frame, including JS, layout, paint, and compositing."

### Understanding the Browser Rendering Pipeline

Every frame must complete all these phases within **~16.67ms** (60fps):

```
JS â†’ Style â†’ Layout â†’ Paint â†’ Composite
```

**Pipeline Breakdown**:
- **JavaScript**: Execute code, React updates, event handlers
- **Style**: Calculate computed CSS for affected elements
- **Layout**: Calculate geometry and position of elements (expensive)
- **Paint**: Fill in pixels for visual properties (colors, shadows, text)
- **Composite**: Layer management and GPU texture uploads

**Key Insight**: Different CSS properties trigger different parts of this pipeline. The goal is to skip as many steps as possible.

### 1. Prefer GPU-Friendly Animations (Biggest Win)

ðŸ”¥ **Animate Only `transform` and `opacity`**

These properties are **compositor-only** — they bypass Layout and Paint entirely:

```css
/* âœ… GPU-accelerated (compositor-only) */
.box {
  transform: translateX(100px) scale(1.2) rotate(45deg);
  opacity: 0.8;
  transition: transform 0.3s, opacity 0.3s;
}

/* âŒ Triggers Layout (very expensive) */
.box {
  width: 200px;        /* Layout */
  height: 200px;       /* Layout */
  left: 100px;         /* Layout */
  top: 50px;           /* Layout */
}

/* âŒ Triggers Paint (expensive) */
.box {
  background: red;     /* Paint */
  color: blue;         /* Paint */
  box-shadow: ...;     /* Paint */
}
```

**Performance Impact**:
| Property | Pipeline | Time (approx) |
|----------|----------|---------------|
| `transform`, `opacity` | Composite only | ~0.5-2ms |
| `color`, `background` | Style â†’ Paint â†’ Composite | ~3-8ms |
| `width`, `height`, `top` | Style â†’ Layout â†’ Paint â†’ Composite | ~10-30ms |

**CSS Optimization Techniques**:

```css
/* Force GPU layer promotion for heavy animations */
.animated-element {
  will-change: transform, opacity;  /* Hint to browser */
  transform: translateZ(0);          /* Force GPU layer */
}

/* Remove will-change when animation completes to free resources */
.animated-element.complete {
  will-change: auto;
}
```

### 2. Bypass React for High-Frequency Animations

**Problem**: React's reconciliation adds overhead at 60fps

âŒ **Bad**: Using setState in animation loops

```jsx
function AnimatedBox() {
  const [position, setPosition] = useState(0)
  
  useEffect(() => {
    let id
    function animate() {
      setPosition(p => p + 1)  // 60 times/second
      id = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(id)
  }, [])
  
  return <div style={{ transform: `translateX(${position}px)` }} />
}
```

**Why This is Slow**:
1. `setState` triggers React render cycle (60Ã—/sec)
2. Reconciliation diff (60Ã—/sec)
3. Commit to DOM (60Ã—/sec)
4. Browser layout calculation
5. **Total**: Often takes 5-10ms per frame = can't maintain 60fps

âœ… **Good**: Direct DOM manipulation with refs

```jsx
function AnimatedBox() {
  const ref = useRef(null)
  
  useEffect(() => {
    let x = 0
    const animate = () => {
      ref.current.style.transform = `translateX(${x++}px)`
      requestAnimationFrame(animate)
    }
    const id = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(id)
  }, [])
  
  return <div ref={ref} />
}
```

### 3. Animation Libraries (Framer Motion, GSAP)

> "For complex sequences I rely on libraries like Framer Motion or GSAP because they manage requestAnimationFrame, batching, and compositor-friendly transforms."

**Why Use Animation Libraries**: Optimized RAF loops, GPU-friendly defaults, batching, quality easing curves, and timeline management.

```jsx
// Framer Motion
import { motion } from 'framer-motion'

function SpringAnimation() {
  return (
    <motion.div
      animate={{ x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    />
  )
}

// GSAP Timeline
import gsap from 'gsap'

function Timeline() {
  useEffect(() => {
    const tl = gsap.timeline()
    tl.to('.box1', { x: 100, duration: 0.5 })
      .to('.box2', { y: 100, duration: 0.5 }, '-=0.25')
      .to('.box3', { rotation: 360, duration: 1 })
    return () => tl.kill()
  }, [])
  
  return <div className="box1 box2 box3" />
}
```

---

## Building Design Systems: Composition Over Configuration

### The Problem with Prop-Heavy APIs

**Anti-pattern**: Massive prop surfaces become unmanageable

```jsx
// âŒ Prop explosion - hard to maintain and extend
<Card 
  bordered
  shadow="lg"
  padding="md"
  rounded
  hoverable
  header="Title"
  headerAlign="left"
  footer="Footer"
  footerBorder
  footerPadding="sm"
  backgroundColor="white"
  headerBackgroundColor="gray"
/>
```

**Problems**:
- 50+ props for complex components
- Difficult to extend with custom layouts
- Type safety becomes cumbersome
- Hard to override styles
- Limited flexibility for edge cases

### Composition-Based Architecture (Stripe, Radix UI, shadcn/ui)

**Pattern**: Components expose sub-components for flexible composition

```jsx
// âœ… Composition - flexible and extensible
<Card>
  <Card.Header>
    <Card.Title>Dashboard</Card.Title>
  </Card.Header>
  <Card.Body>
    <ChartComponent data={data} />
  </Card.Body>
  <Card.Footer>
    <Button>Cancel</Button>
    <Button variant="primary">Save</Button>
  </Card.Footer>
</Card>
```

**Benefits**:
1. **Flexibility**: Arrange sub-components in any order
2. **Customization**: Easy to inject custom content between sections
3. **Type Safety**: Each sub-component has focused props
4. **Composability**: Mix and match sub-components as needed
5. **Styling**: Direct access to each part for styling overrides

**Senior-Level Explanation**:

> "I prefer composition-based APIs because they provide structural flexibility without exploding the prop surface. This pattern follows the Open/Closed Principle — components are open for extension through composition, but closed for modification of their core behavior."

### Implementation Pattern

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>
}

Card.Header = ({ children }) => <div className="card-header">{children}</div>
Card.Title = ({ children }) => <h3 className="card-title">{children}</h3>
Card.Body = ({ children }) => <div className="card-body">{children}</div>
Card.Footer = ({ children }) => <div className="card-footer">{children}</div>
```

---

## Theming & Dark Mode in Modern Design Systems

### CSS Variables for Theme Tokens

Modern design systems (Radix, shadcn/ui, Tailwind) use **CSS custom properties** for theme values, enabling runtime theme switching without JavaScript.

**Token Architecture**:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 84% 5%;
  --primary: 221 83% 53%;
  --border: 214 32% 91%;
}

[data-theme="dark"] {
  --background: 222 84% 5%;
  --foreground: 210 40% 98%;
  --primary: 217 91% 60%;
  --border: 217 33% 18%;
}
```

**Why HSL Without Wrapper?** Allows alpha channel manipulation: `hsl(var(--primary) / 0.8)`

```css
.card {
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
}

.button-primary {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

### Theme Switching Implementation

```jsx
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'light', setTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'light'
  )
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? 'ðŸŒ™' : 'â˜€ï¸'}
    </button>
  )
}
```

---

## Design System Architecture: Mental Model

### Layered Component Architecture

**Think in layers** when building design systems:

```
+-------------------------------------------+
|  Patterns (Domain-Specific)              |  <- LoginForm, Dashboard, DataTable
+-------------------------------------------+
|  Composite Components                     |  <- Card, Modal, Dropdown
+-------------------------------------------+
|  Styled Shell (Variants + Theme)         |  <- Button, Input with variants
+-------------------------------------------+
|  Headless Core (Behavior + A11y)         |  <- Radix, React Aria
+-------------------------------------------+
|  Primitives (Layout + Typography)        |  <- Box, Stack, Text, Heading
+-------------------------------------------+
|  Design Tokens (Foundations)             |  <- Colors, spacing, typography
+-------------------------------------------+
```

**Layer Responsibilities**:

1. **Design Tokens**: Raw values (colors, spacing, fonts)
   - Defined in CSS variables or theme config
   - Consumed by all upper layers

2. **Primitives**: Low-level building blocks
   - `Box`, `Stack`, `Text`, `Heading`
   - Handle basic layout and typography
   - No business logic

3. **Headless Core**: Behavior and accessibility
   - State management, keyboard navigation, ARIA attributes
   - Unstyled, framework from Radix UI, React Aria, Headless UI
   - Focus on a11y compliance

4. **Styled Shell**: Visual design with variants
   - Apply styles to headless components
   - Support theme tokens
   - Provide variant APIs (`size`, `variant`, `color`)

5. **Composite Components**: Multi-part components
   - `Card`, `Modal`, `Dropdown`, `Dialog`
   - Compose primitives and styled components
   - Composition-based APIs

6. **Patterns**: Application-specific compositions
   - `LoginForm`, `UserProfile`, `DataTable`
   - Combine multiple composites
   - Business logic integration

# React Concurrent Features

“React concurrent features let React prioritize urgent updates over non-urgent ones so the UI stays responsive even during expensive renders.”

---

# 2) React Server Components (RSC) — “WHERE does this code run?”

**What RSC actually is**

RSC lets you:

- Run components on the server
- Fetch data directly on the server
- Send only the rendered result plus minimal JS to the browser

**Key properties**

- ❌ No browser APIs
- ❌ No state / effects / event handlers
- ✅ Can access DB, secrets, internal APIs
- ✅ Zero JS bundle cost for these components

**Example (Next.js App Router)**

```tsx
// Server Component
export default async function Page() {
  const users = await db.users.findMany()

  return <UserList users={users} />
}
```

This:

- Runs on server
- Never ships this code to the browser
- Great for SEO, performance, and security

**What RSC is best for**

🔥 Best use cases:

- Initial page data
- Dashboards first load
- SEO pages
- Private backend data
- Reducing bundle size

**Senior phrasing**

> “I use React Server Components to move data fetching and heavy rendering to the server so the client ships less JavaScript and loads faster.”

**What RSC does NOT do**

- ❌ No caching logic
- ❌ No refetching
- ❌ No background updates
- ❌ No client-side mutations
- ❌ No realtime syncing

RSC is about **rendering location**, not state management.

---

# 3) Suspense — “WHEN should React wait or show fallback?”

Suspense is about **rendering coordination**. It lets React:

- Pause rendering
- Show fallback UI
- Resume when data or code is ready

**Example**

```jsx
<Suspense fallback={<Skeleton />}>
  <Profile />
</Suspense>
```

If `Profile` is loading, React shows the skeleton and renders later.

**What Suspense is best for**

🔥 Best use cases:

- Loading boundaries
- Streaming SSR
- Progressive rendering
- Coordinating multiple async components

**Senior phrasing**

> “Suspense is a rendering primitive — it coordinates loading states at the component tree level and enables streaming and progressive rendering.”

**Very important: Suspense is NOT a data library**

- ❌ No caching
- ❌ No retries
- ❌ No background refetch
- ❌ No invalidation

It only knows: “This component is not ready yet.”

Suspense needs **RSC**, **React Query**, or framework loaders to actually fetch data.

---

# 4) React Query — “HOW do we manage server state on the client?”

React Query (TanStack Query) is a **client-side server state manager**.

It handles:

- Fetching
- Caching
- Deduping
- Background refetch
- Retry
- Pagination
- Mutations and invalidation

**Example**

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
})
```

**What React Query is best for**

🔥 Best use cases:

- Client-side fetching
- Dashboards
- Live data
- Mutations (POST/PUT/DELETE)
- Realtime-ish UI
- Cache and sync

**Senior phrasing**

> “I use React Query to manage server state on the client — caching, background refetching, and keeping the UI in sync with the backend.”

**What React Query does NOT do**

- ❌ Does not move work to server
- ❌ Does not reduce JS bundle
- ❌ Does not improve SEO directly

It’s purely **client-side data orchestration**.

---

# 5) Core comparison (interview‑gold table)

| Feature | RSC | Suspense | React Query |
| --- | --- | --- | --- |
| Purpose | Where rendering + fetching runs | When rendering waits | How server data is fetched & cached |
| Runs on | Server | Server + Client | Client |
| Fetch data | ✅ Direct on server | ❌ (needs provider) | ✅ Client fetch |
| Caching | ❌ (framework-level only) | ❌ | 🔥 Yes (core feature) |
| Background refetch | ❌ | ❌ | 🔥 Yes |
| Mutations | ❌ | ❌ | 🔥 Yes |
| Reduce JS bundle | 🔥 Yes | ❌ | ❌ |
| Streaming / progressive | 🔥 With Suspense | 🔥 Core feature | ⚠️ Limited |
| Realtime dashboards | ❌ | ❌ | 🔥 Best tool |

---

# 6) How they work together (most important)

In real modern apps (Next.js App Router):

✅ **Correct architecture (senior‑level)**

- **RSC** → initial page data, SEO, heavy fetch on server
- **Suspense** → loading boundaries and streaming
- **React Query** → client‑side live data, mutations, caching

They are complementary, not competitors.

