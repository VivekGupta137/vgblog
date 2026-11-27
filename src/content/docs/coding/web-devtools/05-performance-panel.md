---
title: 05 Performance Panel
---

# Chrome DevTools: Performance Panel

A complete guide from first recording to advanced flame-chart triage.

---

## What the Performance Panel Does

The Performance panel is a runtime profiler built into Chrome DevTools. It captures a time-ordered trace of everything the browser does — JavaScript execution, style recalculation, layout, paint, compositing, network requests, and garbage collection — and renders it as an interactive timeline you can zoom, pan, and drill into.

Key capabilities:

- Measure Core Web Vitals (LCP, INP, CLS, FCP) against real or simulated user interactions.
- Pinpoint long tasks that block the main thread and cause jank.
- Visualize the rendering pipeline to find style/layout/paint bottlenecks.
- Track JavaScript call stacks at microsecond granularity via the flame chart.
- Overlay custom User Timing marks so your application events appear inline with browser events.
- Monitor JavaScript heap size and identify garbage-collection pressure.

It differs from the Network panel (which focuses only on resource loading) and the Memory panel (which takes heap snapshots). The Performance panel gives you a unified picture of every CPU cycle from navigation through user interaction.

---

## Core Web Vitals Primer

Google's Core Web Vitals are field and lab metrics that quantify perceived page quality. The Performance panel surfaces most of them directly in the Timings and Interactions tracks.

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="min-width:480px;"><div data-pop-title="LCP - Largest Contentful Paint" data-pop="Time until the largest above-the-fold image or text block is rendered. TTFB is a root cause for poor LCP." style="margin-bottom:.8rem;"><div style="display:flex;justify-content:space-between;margin-bottom:.2rem;"><b>LCP</b><span style="color:var(--d-muted);font-size:.75rem;">Largest Contentful Paint</span></div><div style="display:flex;height:1.5rem;border-radius:5px;overflow:hidden;font-size:.7rem;color:#fff;"><div style="flex:25;background:#43a047;padding:.2rem .4rem;">Good ≤ 2.5 s</div><div style="flex:15;background:#f9a825;padding:.2rem .4rem;color:#18181b;">Needs improvement 2.5 – 4.0 s</div><div style="flex:20;background:#e53935;padding:.2rem .4rem;">Poor > 4.0 s</div></div></div><div data-pop-title="INP - Interaction to Next Paint" data-pop="Latency of the slowest interaction across the whole visit. Replaced FID as a Core Web Vital in March 2024. Long tasks are the usual cause." style="margin-bottom:.8rem;"><div style="display:flex;justify-content:space-between;margin-bottom:.2rem;"><b>INP</b><span style="color:var(--d-muted);font-size:.75rem;">Interaction to Next Paint</span></div><div style="display:flex;height:1.5rem;border-radius:5px;overflow:hidden;font-size:.7rem;color:#fff;"><div style="flex:20;background:#43a047;padding:.2rem .4rem;">Good ≤ 200 ms</div><div style="flex:30;background:#f9a825;padding:.2rem .4rem;color:#18181b;">Needs improvement 200 – 500 ms</div><div style="flex:20;background:#e53935;padding:.2rem .4rem;">Poor > 500 ms</div></div></div><div data-pop-title="CLS - Cumulative Layout Shift" data-pop="Sum of unexpected layout shift scores. Unitless (a score, not a time)." style="margin-bottom:.8rem;"><div style="display:flex;justify-content:space-between;margin-bottom:.2rem;"><b>CLS</b><span style="color:var(--d-muted);font-size:.75rem;">Cumulative Layout Shift</span></div><div style="display:flex;height:1.5rem;border-radius:5px;overflow:hidden;font-size:.7rem;color:#fff;"><div style="flex:10;background:#43a047;padding:.2rem .4rem;">Good ≤ 0.1</div><div style="flex:15;background:#f9a825;padding:.2rem .4rem;color:#18181b;">Needs improvement 0.1 – 0.25</div><div style="flex:15;background:#e53935;padding:.2rem .4rem;">Poor > 0.25</div></div></div><div data-pop-title="FCP - First Contentful Paint" data-pop="Time until the first text or image pixel is painted." style="margin-bottom:.8rem;"><div style="display:flex;justify-content:space-between;margin-bottom:.2rem;"><b>FCP</b><span style="color:var(--d-muted);font-size:.75rem;">First Contentful Paint</span></div><div style="display:flex;height:1.5rem;border-radius:5px;overflow:hidden;font-size:.7rem;color:#fff;"><div style="flex:18;background:#43a047;padding:.2rem .4rem;">Good ≤ 1.8 s</div><div style="flex:12;background:#f9a825;padding:.2rem .4rem;color:#18181b;">Needs improvement 1.8 – 3.0 s</div><div style="flex:20;background:#e53935;padding:.2rem .4rem;">Poor > 3.0 s</div></div></div><div data-pop-title="TTFB - Time to First Byte" data-pop="Time from navigation start to the first byte of HTML. A diagnostic metric, not a Core Web Vital." style="margin-bottom:.8rem;"><div style="display:flex;justify-content:space-between;margin-bottom:.2rem;"><b>TTFB</b><span style="color:var(--d-muted);font-size:.75rem;">Time to First Byte</span></div><div style="display:flex;height:1.5rem;border-radius:5px;overflow:hidden;font-size:.7rem;color:#fff;"><div style="flex:8;background:#43a047;padding:.2rem .4rem;">Good ≤ 800 ms</div><div style="flex:10;background:#f9a825;padding:.2rem .4rem;color:#18181b;">Needs improvement 0.8 – 1.8 s</div><div style="flex:20;background:#e53935;padding:.2rem .4rem;">Poor > 1.8 s</div></div></div><div data-pop-title="TBT - Total Blocking Time" data-pop="Sum of the blocking portions of long tasks between FCP and TTI. Lab-only proxy for INP; it cannot be measured in the field." style="margin-bottom:.8rem;"><div style="display:flex;justify-content:space-between;margin-bottom:.2rem;"><b>TBT</b><span style="color:var(--d-muted);font-size:.75rem;">Total Blocking Time</span></div><div style="display:flex;height:1.5rem;border-radius:5px;overflow:hidden;font-size:.7rem;color:#fff;"><div style="flex:20;background:#43a047;padding:.2rem .4rem;">Good ≤ 200 ms</div><div style="flex:40;background:#f9a825;padding:.2rem .4rem;color:#18181b;">Needs improvement 200 – 600 ms</div><div style="flex:20;background:#e53935;padding:.2rem .4rem;">Poor > 600 ms</div></div></div></div></div>
```

| Metric | Full Name | What It Measures | Good | Needs Improvement | Poor |
|---|---|---|---|---|---|
| LCP | Largest Contentful Paint | Time until the largest above-the-fold image or text block is rendered | ≤ 2.5 s | 2.5 – 4.0 s | > 4.0 s |
| INP | Interaction to Next Paint | Latency of the slowest interaction across the entire page visit (replaces FID) | ≤ 200 ms | 200 – 500 ms | > 500 ms |
| FID | First Input Delay | Delay between first user input and browser response (deprecated, replaced by INP) | ≤ 100 ms | 100 – 300 ms | > 300 ms |
| CLS | Cumulative Layout Shift | Sum of unexpected layout shift scores during the page's lifetime | ≤ 0.1 | 0.1 – 0.25 | > 0.25 |
| FCP | First Contentful Paint | Time until the first text or image pixel is painted | ≤ 1.8 s | 1.8 – 3.0 s | > 3.0 s |
| TTFB | Time to First Byte | Time from navigation start until the first byte of the HTML response arrives | ≤ 800 ms | 800 ms – 1.8 s | > 1.8 s |
| Speed Index | Speed Index | How quickly visible page content populates (computed from video frames) | ≤ 3.4 s | 3.4 – 5.8 s | > 5.8 s |
| TTI | Time to Interactive | Time until the page is reliably interactive (main thread quiet for 5 s) | ≤ 3.8 s | 3.8 – 7.3 s | > 7.3 s |
| TBT | Total Blocking Time | Sum of blocking portions of long tasks between FCP and TTI | ≤ 200 ms | 200 – 600 ms | > 600 ms |

Notes:
- INP became a Core Web Vital in March 2024. FID is no longer measured by Google Search ranking.
- CLS is unitless (a score, not a time).
- TBT is a lab-only proxy for INP; it cannot be measured in the field.
- TTFB is a diagnostic metric, not a Core Web Vital, but it is a root cause for poor LCP.

---

## UI Layout

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="border:1px solid var(--d-border-strong);border-radius:8px;overflow:hidden;min-width:620px;"><div data-pop-title="Toolbar" data-pop="Controls recording, CPU/network throttling and screenshot/memory capture." style="padding:.55rem .75rem;border-bottom:1px solid var(--d-border);background:var(--d-surface);"><div style="font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--d-muted);margin-bottom:.3rem;">TOOLBAR</div><div style="display:flex;flex-wrap:wrap;align-items:center;row-gap:.3rem;"><div style="display:flex;align-items:center;gap:.25rem;flex:none;"><span data-pop-title="Record" data-pop="Starts recording a profile. Use Ctrl/Cmd+E to toggle. Close other tabs and use an Incognito window for a clean recording." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">● Record</span><span data-pop-title="Stop" data-pop="Ends the recording and builds the timeline." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">■ Stop</span><span data-pop-title="Clear" data-pop="Discards the current profile." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">🚫 Clear</span></div><i style="flex:none;align-self:stretch;width:1px;margin:.1rem .35rem;background:var(--d-border-strong);"></i><div style="display:flex;align-items:center;gap:.25rem;flex:none;"><span data-pop-title="Import profile" data-pop="Load a saved trace (.json) from a teammate or a CI run." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Import</span><span data-pop-title="Export profile" data-pop="Save the trace to share." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Export</span></div><i style="flex:none;align-self:stretch;width:1px;margin:.1rem .35rem;background:var(--d-border-strong);"></i><div style="display:flex;align-items:center;gap:.25rem;flex:none;"><span data-pop-title="Screenshots" data-pop="Captures a filmstrip so you can see what the user saw at each moment (e.g. LCP)." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">☑ Screenshots</span><span data-pop-title="Memory" data-pop="Adds a JS heap line graph above the main timeline to spot leaks and GC pressure." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">☑ Memory</span></div><i style="flex:none;align-self:stretch;width:1px;margin:.1rem .35rem;background:var(--d-border-strong);"></i><div style="display:flex;align-items:center;gap:.25rem;flex:none;"><span data-pop-title="CPU throttling" data-pop="Slows the CPU (e.g. 4x) so low-end phone behaviour shows up on a fast laptop." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">CPU: 4x slowdown</span><span data-pop-title="Network throttling" data-pop="Simulates a slow connection so loading delays are visible." style="display:inline-block;padding:.12rem .5rem;white-space:nowrap;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Network: Slow 3G</span></div></div></div><div data-pop-title="Timeline overview strip" data-pop="A compressed view of the whole recording with FPS, CPU, NET and a screenshot filmstrip. Drag to select a range and zoom the main timeline; double-click to reset." style="padding:.4rem .75rem .2rem;"><div style="font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--d-muted);margin-bottom:.3rem;">TIMELINE OVERVIEW STRIP</div><div data-pop-title="FPS chart" data-pop="Green bars show frames per second; red bars at the top are dropped frames (jank). A gap means the page was unresponsive; a sustained 30 fps means each frame takes over 33 ms." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">FPS</div><div style="position:relative;flex:1;height:1.4rem;"><i style="position:absolute;left:0.0%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:3.3%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:6.6%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:9.899999999999999%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:13.2%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:16.5%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:19.799999999999997%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:23.099999999999998%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:26.4%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:29.7%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:33.0%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:36.3%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:39.599999999999994%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:42.9%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:46.199999999999996%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:49.5%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:52.8%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:56.099999999999994%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:59.4%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:62.699999999999996%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:66.0%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:69.3%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:72.6%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:75.89999999999999%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:79.19999999999999%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:82.5%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:85.8%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:89.1%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:92.39999999999999%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:95.69999999999999%;width:2.4%;top:15%;height:70%;background:#43a047;border-radius:2px;top:30%;height:60%;"></i><i style="position:absolute;left:40%;width:3%;top:15%;height:70%;background:#e53935;border-radius:2px;top:10%;height:30%;"></i><i style="position:absolute;left:66%;width:4%;top:15%;height:70%;background:#e53935;border-radius:2px;top:10%;height:30%;"></i></div></div><div data-pop-title="CPU chart" data-pop="Stacked area of CPU time: yellow JavaScript, purple rendering, green painting, gray system." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">CPU</div><div style="position:relative;flex:1;height:1.4rem;"><i style="position:absolute;left:0%;width:8%;top:15%;height:70%;background:#f9a825;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:8%;width:6%;top:15%;height:70%;background:#8e24aa;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:14%;width:10%;top:15%;height:70%;background:#f9a825;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:26%;width:6%;top:15%;height:70%;background:#43a047;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:32%;width:22%;top:15%;height:70%;background:#f9a825;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:54%;width:14%;top:15%;height:70%;background:#8e24aa;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:70%;width:25%;top:15%;height:70%;background:#f9a825;border-radius:2px;top:20%;height:60%;"></i></div></div><div data-pop-title="NET chart" data-pop="Thin bars for network request timing; use it to correlate resource loading with CPU spikes." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">NET</div><div style="position:relative;flex:1;height:1.2rem;"><i style="position:absolute;left:5%;width:10%;top:15%;height:70%;background:#1e88e5;border-radius:2px;top:55%;height:30%;"></i><i style="position:absolute;left:18%;width:6%;top:15%;height:70%;background:#8e24aa;border-radius:2px;top:55%;height:30%;"></i><i style="position:absolute;left:30%;width:20%;top:15%;height:70%;background:#f9a825;border-radius:2px;top:55%;height:30%;"></i></div></div><div data-pop-title="Screenshots" data-pop="Filmstrip of thumbnails at each frame. Hover to magnify; ideal for finding the moment of LCP or a layout shift." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">Screens</div><div style="position:relative;flex:1;height:1.6rem;"><i style="position:absolute;left:0.0%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:8.3%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:16.6%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:24.900000000000002%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:33.2%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:41.5%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:49.800000000000004%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:58.10000000000001%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:66.4%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:74.7%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:83.0%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i><i style="position:absolute;left:91.30000000000001%;width:6.5%;top:12%;height:76%;background:var(--d-chip);border-radius:2px;"></i></div></div></div><div style="padding:.4rem .75rem;"><div style="font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--d-muted);margin-bottom:.3rem;">MAIN TIMELINE (zoomed to selection)</div><div style="border:1px solid var(--d-border);border-radius:6px;overflow:hidden;"><div data-pop-title="Timings track" data-pop="FCP, LCP, DCL, Load markers plus your own `performance.mark()` / `performance.measure()` calls." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">Timings</div><div style="position:relative;flex:1;height:1.5rem;"><i style="position:absolute;left:5%;width:0.4%;top:15%;height:70%;background:#1e88e5;border-radius:2px;top:0;height:100%;width:2px;"></i><span style="position:absolute;left:6%;top:15%;font-size:.65rem;">FCP</span><span style="position:absolute;left:28%;top:15%;font-size:.65rem;">LCP</span><span style="position:absolute;left:55%;top:15%;font-size:.65rem;">DCL</span><span style="position:absolute;left:80%;top:15%;font-size:.65rem;">Load</span></div></div><div data-pop-title="Interactions track" data-pop="Pointer and keyboard interactions; each spans from the input event to the next paint. Interactions over 200 ms are flagged (INP)." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">Interactions</div><div style="position:relative;flex:1;height:1.5rem;"><i style="position:absolute;left:10%;width:12%;top:15%;height:70%;background:#1e88e5;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:45%;width:20%;top:15%;height:70%;background:#e53935;border-radius:2px;top:20%;height:60%;"></i></div></div><div data-pop-title="Frames track" data-pop="Each rendered frame as a block. Green frames are on time; red or yellow frames were dropped or late." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">Frames</div><div style="position:relative;flex:1;height:1.5rem;"><i style="position:absolute;left:1%;width:8.5%;top:15%;height:70%;background:#43a047;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:11%;width:8.5%;top:15%;height:70%;background:#43a047;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:21%;width:8.5%;top:15%;height:70%;background:#43a047;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:31%;width:8.5%;top:15%;height:70%;background:#43a047;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:41%;width:8.5%;top:15%;height:70%;background:#e53935;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:51%;width:8.5%;top:15%;height:70%;background:#e53935;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:61%;width:8.5%;top:15%;height:70%;background:#43a047;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:71%;width:8.5%;top:15%;height:70%;background:#43a047;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:81%;width:8.5%;top:15%;height:70%;background:#43a047;border-radius:2px;top:20%;height:60%;"></i><i style="position:absolute;left:91%;width:8.5%;top:15%;height:70%;background:#43a047;border-radius:2px;top:20%;height:60%;"></i></div></div><div data-pop-title="Main thread" data-pop="The most important track: a flame chart of every task on the main thread. Yellow = JS, purple = rendering, green = painting. A red triangle marks a long task (over 50 ms)." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">Main</div><div style="position:relative;flex:1;height:2.4rem;"><i style="position:absolute;left:2%;width:18%;top:15%;height:70%;background:#f9a825;border-radius:2px;"></i><i style="position:absolute;left:22%;width:8%;top:15%;height:70%;background:#8e24aa;border-radius:2px;"></i><i style="position:absolute;left:30%;width:6%;top:15%;height:70%;background:#43a047;border-radius:2px;"></i><i style="position:absolute;left:42%;width:36%;top:15%;height:70%;background:#f9a825;border-radius:2px;top:15%;height:70%;"></i><i style="position:absolute;left:76.5%;top:15%;width:0;height:0;border-left:8px solid transparent;border-top:8px solid #e53935;"></i><i style="position:absolute;left:80%;width:10%;top:15%;height:70%;background:#8e24aa;border-radius:2px;"></i></div></div><div data-pop-title="Compositor thread" data-pop="Moves already-painted layers without main-thread involvement. If the page is slow but Main looks idle, check here." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">Compositor</div><div style="position:relative;flex:1;height:1.5rem;"><i style="position:absolute;left:2%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:10%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:18%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:26%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:34%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:42%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:50%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:58%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:66%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:74%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:82%;width:3%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i></div></div><div data-pop-title="GPU thread" data-pop="GPU process activity. Healthy pages are mostly idle during JS work with bursts during paint and composite." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">GPU</div><div style="position:relative;flex:1;height:1.5rem;"><i style="position:absolute;left:5%;width:60%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;opacity:.7;"></i></div></div><div data-pop-title="Raster threads" data-pop="Tile rasterization on background threads; heavy when new content scrolls into view or layers are promoted." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">Raster</div><div style="position:relative;flex:1;height:1.5rem;"><i style="position:absolute;left:10%;width:10%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:40%;width:10%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i><i style="position:absolute;left:70%;width:10%;top:15%;height:70%;background:#9e9e9e;border-radius:2px;"></i></div></div><div data-pop-title="Network requests track" data-pop="Each request is a bar coloured by type: blue HTML, purple CSS, yellow JS, green images, gray other." style="display:flex;align-items:center;border-top:1px solid var(--d-border);"><div style="width:6.5rem;flex:none;padding:.25rem .5rem;font-size:.7rem;color:var(--d-muted);">Network</div><div style="position:relative;flex:1;height:1.5rem;"><i style="position:absolute;left:3%;width:10%;top:15%;height:70%;background:#1e88e5;border-radius:2px;"></i><i style="position:absolute;left:15%;width:6%;top:15%;height:70%;background:#8e24aa;border-radius:2px;"></i><i style="position:absolute;left:25%;width:22%;top:15%;height:70%;background:#f9a825;border-radius:2px;"></i></div></div></div></div><div data-pop-title="Details pane" data-pop="Context-sensitive data for whatever is selected in the timeline." style="padding:.55rem .75rem;background:var(--d-surface);"><div style="font-size:.65rem;font-weight:700;letter-spacing:.06em;color:var(--d-muted);margin-bottom:.3rem;">DETAILS PANE</div><span data-pop-title="Summary tab" data-pop="Pie chart of Scripting / Rendering / Painting / Loading / System / Idle for the selection, plus metadata. Quickly shows whether slowness is JS-heavy or layout-heavy." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Summary</span><span data-pop-title="Bottom-Up tab" data-pop="Functions sorted by self time (excluding callees); finds the hottest function." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Bottom-Up</span><span data-pop-title="Call Tree tab" data-pop="Top-down view from entry points; shows the shape of the work and which feature triggered it." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Call Tree</span><span data-pop-title="Event Log tab" data-pop="Chronological list of every event in the selection." style="display:inline-block;padding:.12rem .5rem;margin:.1rem .15rem .1rem 0;border-radius:5px;background:var(--d-chip);color:var(--d-fg);font-size:.75rem;">Event Log</span><div style="font-size:.75rem;color:var(--d-muted);margin-top:.3rem;">Summary pie: Scripting 48% · Rendering 22% · Painting 8% · Idle 22%</div></div></div></div>
```

Panel areas:

- **Toolbar** — controls recording, CPU/network throttling, and screenshot capture.
- **Timeline Overview Strip** — a compressed view of the entire recording. Drag to zoom into a range.
- **Main Timeline** — the detailed, zoomable view with all tracks stacked vertically.
- **Details Pane** — context-sensitive data for whatever is selected in the timeline.

---

## Recording a Profile

### Opening the Panel

Press `Ctrl+Shift+I` / `Cmd+Option+I` to open DevTools, then click the **Performance** tab. Alternatively press `Ctrl+Shift+P` / `Cmd+Shift+P` and type "performance".

### Steps for a Clean Recording

1. **Open an Incognito window** — eliminates extension interference.
2. **Navigate to the page** but do not interact with it yet.
3. **Set throttling** in the toolbar:
   - CPU: 4x or 6x slowdown simulates a mid-range mobile device.
   - Network: Slow 3G or Fast 3G for load recordings; no throttling for interaction recordings.
4. **Warm up first** — load the page once and discard that recording. Browser caches and JIT compilation will be in a realistic state for the second run.
5. **Start recording** — click the circle record button or press `Ctrl+E` / `Cmd+E`.
6. **Perform the interaction** you want to measure: scroll, click, type. Keep it focused.
7. **Stop after 3–5 seconds** — shorter recordings are easier to read and have less noise.
8. Wait for the profile to process (large traces can take several seconds).

### Tips

- Disable the "Disable cache" checkbox in the Network panel before a performance recording unless you specifically want a cold-cache load.
- Use "Start profiling and reload page" (the page-reload icon next to Record) to capture the full navigation, including resource loading.
- If you only care about a specific interaction (not load), navigate to the page, let it settle, then record.
- Reduce the number of open tabs; other tabs compete for CPU.

### Import and Export Profiles

Profiles are saved as JSON trace files and can be shared with teammates.

**Export:** After recording, click the download (export) icon in the toolbar. The file is saved as `Trace-<timestamp>.json`.

**Import:** Click the upload (import) icon and select a `.json` trace file. The full recording loads exactly as if you had recorded it yourself.

This is useful for:
- Sharing a hard-to-reproduce performance issue with a colleague.
- Comparing before/after profiles of an optimization.
- Archiving baseline measurements to detect regressions later.

---

## Timeline Overview Strip

The overview strip at the top shows the full recording compressed into a scrollable bar. It has three sub-charts stacked vertically:

### FPS Chart

A green bar chart where height represents frames per second. A smooth 60-fps page shows a tall, unbroken green band.

- **Red bars** at the top of the FPS area indicate dropped frames (jank). The taller the red bar, the worse the drop.
- A sustained drop to 30 fps means the main thread is spending more than 33 ms per frame.
- A complete gap in the green bars means the page was entirely unresponsive.

### CPU Chart

A stacked area chart showing CPU time broken down by category:
- Yellow = JavaScript
- Purple = Rendering (style + layout)
- Green = Painting
- Gray = System / other

A heavily yellow CPU chart means JavaScript is the bottleneck. A heavily purple chart points to layout thrashing.

### NET Chart

Thin bars showing network request timing. Useful for correlating resource loading with CPU spikes.

### Screenshots Timeline

A filmstrip row of thumbnail screenshots captured at each frame. Hovering over any screenshot shows a magnified preview so you can see exactly what the user saw at that moment. This is invaluable for identifying the moment of LCP or a layout shift.

### Selecting a Time Range

Click and drag horizontally in the overview strip to zoom the main timeline into that range. The main timeline will update to show only those milliseconds in detail. You can also drag the handles on the edges of the selection to adjust it. Double-click the overview to reset to the full recording.

---

## All Timeline Tracks Explained

### Main Thread

The most important track. It shows a flame chart of every task the browser ran on the main thread. Tasks are top-level colored blocks. Call stacks grow downward from them.

Color coding:
- **Yellow** — JavaScript execution (script evaluation, event handlers, timers)
- **Purple** — Rendering work (style recalculation, layout)
- **Green** — Painting (paint records, image decoding)
- **Blue** — Loading/parsing (HTML parsing, network callbacks)
- **Gray** — System tasks, idle

Long tasks (over 50 ms) have a **red triangle** in their top-right corner. Everything inside that task — every function call — is rendered as part of the flame chart stack below the task block.

### Compositor Thread

Shows work done by the compositor thread. Compositing moves already-painted layers without requiring main-thread involvement. If your page is slow but the main thread looks idle, check whether the compositor thread is overloaded.

### GPU Thread

Shows GPU process activity. A healthy page has the GPU thread mostly idle during JavaScript-heavy work, with bursts during paint and composite operations.

### Raster Threads

Show tile rasterization. Chrome breaks the page into tiles and rasters them on background threads. Heavy raster activity appears when new content scrolls into view or layers are promoted.

### Network Requests Track

Each network request appears as a horizontal bar. Bar color indicates:
- Blue — HTML
- Purple — CSS
- Yellow — JavaScript
- Green — images
- Gray — other

Hovering a bar shows URL, timing (queue, DNS, connect, TTFB, download), and the initiator.

### Frames Track

Shows each rendered frame as a block. Frame height indicates frame duration — short frames are fast, tall frames are slow. Green frames are on-time; red or yellow frames were dropped or late.

### Timings Track

Displays vertical markers and labeled spans for:
- **FCP** — First Contentful Paint
- **LCP** — Largest Contentful Paint
- **DCL** — DOMContentLoaded event
- **Load** — window load event
- **User Timing API marks** — your own `performance.mark()` and `performance.measure()` calls appear here as custom markers and spans (covered in detail in a later section)

### Interactions Track

Shows pointer and keyboard interactions. Each interaction is a colored block spanning from the input event to the next paint. The width represents the INP latency for that interaction. Interactions exceeding 200 ms are flagged.

### Web Workers

If your page uses `Worker` or `SharedWorker`, each worker gets its own flame chart track below the main thread. Worker tracks are labeled with the worker script URL. You can identify CPU-intensive work running off the main thread and verify it is not also competing with important tasks.

---

## The Flame Chart Deep-Dive

### Axes

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="min-width:560px;"><div style="position:relative;margin-left:2.2rem;height:1.2rem;font-size:.68rem;color:var(--d-muted);"><span style="position:absolute;left:0.0%;transform:translateX(-50%);">0 ms</span><span style="position:absolute;left:25.0%;transform:translateX(-50%);">50 ms</span><span style="position:absolute;left:50.0%;transform:translateX(-50%);">100 ms</span><span style="position:absolute;left:75.0%;transform:translateX(-50%);">150 ms</span><span style="position:absolute;left:100.0%;transform:translateX(-50%);">200 ms</span></div><div style="display:flex;"><div style="width:2.2rem;flex:none;font-size:.62rem;color:var(--d-muted);writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;">call depth ↓</div><div style="position:relative;flex:1;height:8.25rem;"><i style="position:absolute;left:0.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:25.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:50.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:75.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:100.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><div data-pop-title="Task" data-pop="The top-level block: a main-thread task. X axis is wall-clock time, so wider = slower." style="position:absolute;left:0%;width:30.0%;top:0.0rem;height:1.5rem;background:#9e9e9e;border-radius:3px;color:#fff;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">Task (60 ms)</div><div data-pop-title="evaluateScript" data-pop="Entry point of the script work. The topmost block of a stack is the entry point (event handler, timer callback ...). A wide entry point is a candidate for splitting across frames." style="position:absolute;left:0%;width:25.0%;top:1.65rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">evaluateScript</div><div data-pop-title="moduleA.init()" data-pop="Called by evaluateScript. Each row down is a function called by the one above." style="position:absolute;left:0%;width:14.000000000000002%;top:3.3rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">moduleA.init()</div><div data-pop-title="fetchConfig()" data-pop="A leaf function." style="position:absolute;left:0%;width:7.000000000000001%;top:4.949999999999999rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">fetchConfig()</div><div data-pop-title="parseConfig()" data-pop="A leaf function." style="position:absolute;left:7.000000000000001%;width:6.0%;top:4.949999999999999rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">parseConfig()</div><div data-pop-title="moduleB.init()" data-pop="Second child of evaluateScript." style="position:absolute;left:14.000000000000002%;width:11.0%;top:3.3rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">moduleB.init()</div><div data-pop-title="buildIndex()" data-pop="Calls sort() below." style="position:absolute;left:14.000000000000002%;width:10.0%;top:4.949999999999999rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">buildIndex()</div><div data-pop-title="sort() - the hot path" data-pop="A wide block at the bottom of a deep stack is an expensive leaf function: the actual hot path. Use the Bottom-Up tab to find it by self time." style="position:absolute;left:14.000000000000002%;width:9.0%;top:6.6rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">sort()</div><div data-pop-title="(GC)" data-pop="Garbage collection triggered by the work; counts as scripting." style="position:absolute;left:25.0%;width:4.0%;top:1.65rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">(GC)</div></div></div><div style="display:flex;flex-wrap:wrap;gap:1rem;margin:.6rem 0 0;font-size:.75rem;color:var(--d-muted);"><span><b>X</b> = wall-clock time (wider = slower)</span><span><b>Y</b> = call depth (child below its caller)</span></div></div></div>
```

- **X axis** = wall-clock time. Wider blocks took longer.
- **Y axis** = call stack depth. The topmost block is the entry point (event handler, timer callback, etc.). Each row below is a function called by the one above it.
- A wide block at the bottom of a deep stack is an expensive leaf function — the actual hot path.
- A wide block at the top is an expensive entry point — consider splitting it across frames.

### Color Coding

| Color | Category | Examples |
|---|---|---|
| Yellow | Scripting | JS function calls, event handlers, timers, GC |
| Purple | Rendering | Recalculate Style, Layout, Update Layer Tree |
| Green | Painting | Paint, Composite Layers, Image Decode |
| Blue | Loading | Parse HTML, Send Request, Receive Response |
| Gray | System | System (browser internals), Idle |

### Reading Top-Down vs Bottom-Up

**Top-Down (Call Tree tab / flame chart visual):**
Start at the widest top-level task and follow the tallest child blocks downward. This shows entry points and gives you the "shape" of work. Good for understanding which feature or event triggered slow work.

**Bottom-Up (Bottom-Up tab):**
Shows leaf functions sorted by self time — the time spent in that function excluding its callees. This immediately highlights the hottest individual functions. Good for finding the specific line of code consuming the most CPU.

### Zooming and Panning

| Action | Shortcut |
|---|---|
| Zoom in | Scroll wheel up, or `+` key |
| Zoom out | Scroll wheel down, or `-` key |
| Pan left/right | Hold `Shift` and scroll, or click-drag on the overview |
| Select a range | Click and drag on the main timeline |
| Reset zoom | `0` key (zero) |
| Jump to a specific time | Click in the overview strip |

Double-clicking a task block auto-zooms to fill the timeline with that task.

---

## Long Tasks

### Definition

A **long task** is any main-thread task that takes more than 50 ms. The 50 ms threshold comes from the RAIL model: to guarantee a response within 100 ms of user input, the browser needs at least 50 ms of headroom for its own work. Any task over 50 ms eats into that budget.

In the flame chart, long tasks are identified by a **red triangle in the top-right corner** of the task block.

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="min-width:560px;"><div style="position:relative;margin-left:2.2rem;height:1.2rem;font-size:.68rem;color:var(--d-muted);"><span style="position:absolute;left:0.0%;transform:translateX(-50%);">0 ms</span><span style="position:absolute;left:25.0%;transform:translateX(-50%);">25 ms</span><span style="position:absolute;left:50.0%;transform:translateX(-50%);">50 ms</span><span style="position:absolute;left:75.0%;transform:translateX(-50%);">75 ms</span><span style="position:absolute;left:100.0%;transform:translateX(-50%);">100 ms</span></div><div style="display:flex;"><div style="width:2.2rem;flex:none;font-size:.62rem;color:var(--d-muted);writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;">call depth ↓</div><div style="position:relative;flex:1;height:8.25rem;"><i style="position:absolute;left:0.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:25.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:50.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:75.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:100.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><div data-pop-title="Long task" data-pop="A main-thread task over 50 ms. The 50 ms threshold comes from the RAIL model: to respond within 100 ms of input, the browser needs 50 ms of headroom for its own work." style="position:absolute;left:0%;width:100%;top:0.0rem;height:1.5rem;background:#9e9e9e;border-radius:3px;color:#fff;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">Task (82 ms) — long task</div><i data-pop-title="Red triangle" data-pop="Long tasks get a red triangle in the top-right corner of the task block." style="position:absolute;right:0;top:0;width:0;height:0;border-left:14px solid transparent;border-top:14px solid #e53935;z-index:2;"></i><div data-pop-title="evaluateScript (bundle.js)" data-pop="Everything inside the task, every function call, is rendered as a stack below the task block." style="position:absolute;left:0%;width:95%;top:1.65rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">evaluateScript (bundle.js)</div><div data-pop-title="App.render()" data-pop="Calls processAllItems() and updateDOM()." style="position:absolute;left:0%;width:80%;top:3.3rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">App.render()</div><div data-pop-title="processAllItems()" data-pop="42 ms of self time: this function itself, not its callees, is the cost." style="position:absolute;left:0%;width:52%;top:4.949999999999999rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">processAllItems() — 42 ms self</div><div data-pop-title="heavyTransform()" data-pop="The hot loop. Fix by chunking work, yielding with `setTimeout`/`scheduler.yield()`, or moving it to a Web Worker." style="position:absolute;left:0%;width:46%;top:6.6rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">heavyTransform() ← hot loop</div><div data-pop-title="updateDOM()" data-pop="DOM updates inside the same task delay the next paint." style="position:absolute;left:52%;width:28%;top:4.949999999999999rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">updateDOM()</div></div></div></div></div>
```

### Why They Block the Main Thread

JavaScript is single-threaded on the main thread. While a long task runs, the browser cannot:
- Process user input (clicks, keypresses, scroll events)
- Run animations driven by `requestAnimationFrame`
- Respond to the compositor for smooth scrolling

The result is **jank** (dropped frames) and **high INP** (input is queued until the task finishes).

### Impact on INP

INP measures the time from user input to the next paint. If a click handler fires while a 200 ms task is running, the input is queued. INP = 200 ms queue time + handler execution time + rendering time. Even a trivial click handler will produce a 200+ ms INP if it hits a long task.

### Finding Responsible Code

1. In the Interactions track, click the interaction that felt slow (high INP).
2. The Details pane shows the interaction's processing time and the responsible task.
3. Click the task in the Main thread track.
4. In the flame chart, look for the widest yellow block at the deepest level — that is the hot function.
5. Click the function to see its source location in the Details pane. Click the link to open it in the Sources panel.
6. Check the Bottom-Up tab for the same selection to rank functions by self time.

Common culprits:
- Large synchronous `JSON.parse()` or `JSON.stringify()` on the main thread.
- Unvirtualized lists that re-render thousands of DOM nodes.
- Third-party scripts (analytics, tag managers, chat widgets) firing on every page.
- Recursive computations not yielded with `scheduler.yield()` or `setTimeout`.

---

## Details Pane — All Tabs

Select a task, event, or time range in the main timeline to populate the Details pane.

### Summary Tab

Shows a **pie chart** of time spent in each category for the selection:
- Scripting
- Rendering
- Painting
- Loading
- System
- Idle

Also displays:
- Total time of the selection.
- A "Details" section with metadata: task name, source URL, start/end time.
- For network requests: URL, status, timing breakdown (queue, stall, DNS, connect, send, wait, receive).

Use Summary to quickly diagnose whether a slowdown is JS-heavy (scripting) or CSS/layout-heavy (rendering).

### Bottom-Up Tab

Lists every function that ran in the selection, sorted by **self time** descending. Self time is the time spent in the function body, not counting time spent in functions it called.

Columns:
- **Self Time** — CPU time spent in this function's own code.
- **Total Time** — self time plus all descendant call time.
- **Activity** — function name.
- **Source URL** — file and line number.

Use the **Group by** dropdown to aggregate by:
- **No Grouping** — every individual function.
- **URL** — total cost attributed to each script file.
- **Domain** — total cost by origin (great for blaming third parties).
- **Category** — scripting vs rendering vs painting.

This is the most actionable view for finding which exact function to optimize.

### Call Tree Tab

Top-down view of the call hierarchy. Shows total time descending from the task root. Expand nodes to drill into the call chain.

The triangular expand icons let you unfurl the tree. Functions that contributed the most time have the tallest children. Use this to understand the execution path that led to the expensive code — context that Bottom-Up lacks.

### Event Log Tab

A flat, chronological list of every event in the selection. Columns:
- **Start Time** — ms from the recording start.
- **Duration** — how long the event took.
- **Self Time** — duration excluding children.
- **Activity** — event type.

Filter events using the category checkboxes at the top:
- Loading
- Experience
- Scripting
- Rendering
- Painting
- System
- Other

The Event Log is most useful when you want to see the ordering of events — for example, verifying that `DOMContentLoaded` fires before your initialization script, or that a `setInterval` fires at the expected cadence.

---

## Rendering Pipeline

Every visual change on a web page travels through some or all of these stages:

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="min-width:520px;"><div data-pop-title="Geometry change" data-pop="Triggers all stages: Style, Layout, Paint, Composite. The most expensive path." style="margin-bottom:.9rem;"><div style="margin-bottom:.35rem;"><b>width, height, margin, top, left, font-size</b> <span style="color:var(--d-muted);font-size:.78rem;">all five stages</span></div><div style="display:flex;flex-wrap:wrap;gap:.25rem 0;"><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#f9a825;color:#18181b;border:2px solid #f9a825;">JavaScript</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#8e24aa;color:#fff;border:2px solid #8e24aa;">Style</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#8e24aa;color:#fff;border:2px solid #8e24aa;">Layout</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#43a047;color:#fff;border:2px solid #43a047;">Paint</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#1e88e5;color:#fff;border:2px solid #1e88e5;">Composite</div></div></div></div><div data-pop-title="Visual-only change" data-pop="Skips Layout: Style, Paint, Composite still run." style="margin-bottom:.9rem;"><div style="margin-bottom:.35rem;"><b>color, background-color, box-shadow</b> <span style="color:var(--d-muted);font-size:.78rem;">skips Layout</span></div><div style="display:flex;flex-wrap:wrap;gap:.25rem 0;"><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#f9a825;color:#18181b;border:2px solid #f9a825;">JavaScript</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#8e24aa;color:#fff;border:2px solid #8e24aa;">Style</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:transparent;border:2px dashed var(--d-border-strong);color:var(--d-muted);text-decoration:line-through;">Layout</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#43a047;color:#fff;border:2px solid #43a047;">Paint</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#1e88e5;color:#fff;border:2px solid #1e88e5;">Composite</div></div></div></div><div data-pop-title="transform / opacity" data-pop="On a promoted layer these skip Layout and Paint entirely: the only properties you can animate cheaply. This is why `transform: translateX()` animations are smooth and `left:` ones are not." style="margin-bottom:.9rem;"><div style="margin-bottom:.35rem;"><b>transform, opacity (promoted layer)</b> <span style="color:var(--d-muted);font-size:.78rem;">skips Layout and Paint</span></div><div style="display:flex;flex-wrap:wrap;gap:.25rem 0;"><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#f9a825;color:#18181b;border:2px solid #f9a825;">JavaScript</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#8e24aa;color:#fff;border:2px solid #8e24aa;">Style</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:transparent;border:2px dashed var(--d-border-strong);color:var(--d-muted);text-decoration:line-through;">Layout</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:transparent;border:2px dashed var(--d-border-strong);color:var(--d-muted);text-decoration:line-through;">Paint</div><span style="padding:0 .3rem;color:var(--d-muted);">→</span></div><div style="display:flex;align-items:center;"><div style="padding:.35rem .7rem;border-radius:6px;font-size:.78rem;min-width:4.6rem;text-align:center;background:#1e88e5;color:#fff;border:2px solid #1e88e5;">Composite</div></div></div></div><div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.2rem;"><span data-pop-title="JavaScript" data-pop="Your code changes DOM/CSS. Triggers everything downstream." style="font-size:.72rem;padding:.1rem .5rem;border-radius:4px;background:color-mix(in srgb,#f9a825 22%,transparent);border:1px solid #f9a825;">JavaScript</span><span data-pop-title="Style" data-pop="Match CSS rules to elements and compute styles. Triggered by class changes, inline styles, element insertion/removal." style="font-size:.72rem;padding:.1rem .5rem;border-radius:4px;background:color-mix(in srgb,#8e24aa 22%,transparent);border:1px solid #8e24aa;">Style</span><span data-pop-title="Layout" data-pop="Calculate position and size of every element. Triggered by geometry changes (width, height, margin, padding, top, left, font-size)." style="font-size:.72rem;padding:.1rem .5rem;border-radius:4px;background:color-mix(in srgb,#8e24aa 22%,transparent);border:1px solid #8e24aa;">Layout</span><span data-pop-title="Paint" data-pop="Fill pixels for each layer: text, colours, images, borders, shadows. Triggered by visual-only changes (color, background, box-shadow)." style="font-size:.72rem;padding:.1rem .5rem;border-radius:4px;background:color-mix(in srgb,#43a047 22%,transparent);border:1px solid #43a047;">Paint</span><span data-pop-title="Composite" data-pop="Upload painted layers to the GPU and draw them in order. Changes to transform and opacity on promoted layers stop here." style="font-size:.72rem;padding:.1rem .5rem;border-radius:4px;background:color-mix(in srgb,#1e88e5 22%,transparent);border:1px solid #1e88e5;">Composite</span></div></div></div>
```

| Stage | What Happens | Triggered By |
|---|---|---|
| Style | Browser matches CSS rules to DOM elements and computes computed styles | Any CSS class change, inline style, element insertion/removal |
| Layout (Reflow) | Browser calculates position and size of every element in the render tree | Changes to geometry properties (width, height, margin, padding, top, left, font-size) |
| Paint | Browser fills in pixels for each layer — text, colors, images, borders, shadows | Changes to visual properties that don't affect geometry (color, background, box-shadow, outline) |
| Composite | Browser uploads painted layers to the GPU and draws them in order | Changes to transform and opacity on composited layers |

### Which CSS Properties Trigger What

| Property | Style | Layout | Paint | Composite |
|---|---|---|---|---|
| `width`, `height`, `margin`, `padding` | Yes | Yes | Yes | Yes |
| `top`, `left` (positioned) | Yes | Yes | Yes | Yes |
| `font-size`, `line-height` | Yes | Yes | Yes | Yes |
| `color`, `background-color` | Yes | No | Yes | Yes |
| `box-shadow`, `border-radius` | Yes | No | Yes | Yes |
| `transform` (composited layer) | Yes | No | No | Yes |
| `opacity` (composited layer) | Yes | No | No | Yes |
| `will-change: transform` | Yes | No | No | Yes |

Key insight: **`transform` and `opacity` on a promoted layer skip layout and paint entirely.** They are the only properties you can animate without triggering the expensive pipeline stages. This is why CSS animations using `transform: translateX()` are smooth while ones using `left:` are not.

### Spotting Pipeline Stages in the Flame Chart

In the Main thread flame chart:
- A **purple "Recalculate Style"** block followed by a **purple "Layout"** block indicates a style+layout pass.
- A **green "Paint"** block follows if pixels need to be updated.
- A **green "Composite Layers"** block is the final stage.

Consecutive style+layout blocks repeating rapidly indicate layout thrashing.

---

## Identifying Layout Thrashing

Layout thrashing occurs when JavaScript alternately reads and writes DOM geometry properties, forcing the browser to perform synchronous layout multiple times per task instead of once per frame.

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="min-width:480px;"><div data-pop-title="Layout thrashing" data-pop="Reading a geometry property (e.g. `offsetWidth`) right after a write forces the browser to flush pending style/layout synchronously. 100 boxes = 100 forced layouts in one task. In the flame chart: rapid alternating Recalculate Style and Layout, flagged `Layout Forced`." style="margin-bottom:1rem;"><div style="margin-bottom:.3rem;"><b>Thrashing: interleaved read / write</b> <span style="color:var(--d-muted);font-size:.78rem;">each read after a write forces a full layout</span></div><div style="display:flex;flex-wrap:wrap;align-items:center;"><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#1e88e5;border-radius:2px;margin-right:2px;" title="Read offsetWidth"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#f9a825;border-radius:2px;margin-right:2px;" title="Write style.width"></i><i style="display:inline-block;width:1.4rem;height:1.5rem;background:#8e24aa;border-radius:2px;margin-right:2px;" title="Forced layout"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#1e88e5;border-radius:2px;margin-right:2px;" title="Read offsetWidth"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#f9a825;border-radius:2px;margin-right:2px;" title="Write style.width"></i><i style="display:inline-block;width:1.4rem;height:1.5rem;background:#8e24aa;border-radius:2px;margin-right:2px;" title="Forced layout"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#1e88e5;border-radius:2px;margin-right:2px;" title="Read offsetWidth"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#f9a825;border-radius:2px;margin-right:2px;" title="Write style.width"></i><i style="display:inline-block;width:1.4rem;height:1.5rem;background:#8e24aa;border-radius:2px;margin-right:2px;" title="Forced layout"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#1e88e5;border-radius:2px;margin-right:2px;" title="Read offsetWidth"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#f9a825;border-radius:2px;margin-right:2px;" title="Write style.width"></i><i style="display:inline-block;width:1.4rem;height:1.5rem;background:#8e24aa;border-radius:2px;margin-right:2px;" title="Forced layout"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#1e88e5;border-radius:2px;margin-right:2px;" title="Read offsetWidth"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#f9a825;border-radius:2px;margin-right:2px;" title="Write style.width"></i><i style="display:inline-block;width:1.4rem;height:1.5rem;background:#8e24aa;border-radius:2px;margin-right:2px;" title="Forced layout"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#1e88e5;border-radius:2px;margin-right:2px;" title="Read offsetWidth"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#f9a825;border-radius:2px;margin-right:2px;" title="Write style.width"></i><i style="display:inline-block;width:1.4rem;height:1.5rem;background:#8e24aa;border-radius:2px;margin-right:2px;" title="Forced layout"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#1e88e5;border-radius:2px;margin-right:2px;" title="Read offsetWidth"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#f9a825;border-radius:2px;margin-right:2px;" title="Write style.width"></i><i style="display:inline-block;width:1.4rem;height:1.5rem;background:#8e24aa;border-radius:2px;margin-right:2px;" title="Forced layout"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#1e88e5;border-radius:2px;margin-right:2px;" title="Read offsetWidth"></i><i style="display:inline-block;width:0.6rem;height:1.5rem;background:#f9a825;border-radius:2px;margin-right:2px;" title="Write style.width"></i><i style="display:inline-block;width:1.4rem;height:1.5rem;background:#8e24aa;border-radius:2px;margin-right:2px;" title="Forced layout"></i></div></div><div data-pop-title="Batched reads then writes" data-pop="All reads first (no invalidation), then all writes: layout is invalidated once and recalculated once at the end of the task. FastDOM&#x27;s `measure()`/`mutate()` queues formalize the pattern." style="margin-bottom:1rem;"><div style="margin-bottom:.3rem;"><b>Fixed: batch reads, then writes</b> <span style="color:var(--d-muted);font-size:.78rem;">one layout per frame</span></div><div style="display:flex;flex-wrap:wrap;align-items:center;"><i style="display:inline-block;width:3.2rem;height:1.5rem;background:#1e88e5;border-radius:2px;margin-right:2px;" title="Read x8"></i><i style="display:inline-block;width:3.2rem;height:1.5rem;background:#f9a825;border-radius:2px;margin-right:2px;" title="Write x8"></i><i style="display:inline-block;width:1.4rem;height:1.5rem;background:#8e24aa;border-radius:2px;margin-right:2px;" title="One layout"></i></div></div><div style="display:flex;flex-wrap:wrap;gap:.9rem;margin-top:.8rem;font-size:.75rem;"><span data-pop-title="Read" data-pop="e.g. `offsetWidth`, `getBoundingClientRect()`. Cheap unless layout is dirty." data-pop-tour="0" style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#1e88e5;display:inline-block;"></i>Read geometry</span><span data-pop-title="Write" data-pop="Invalidates layout, so the next read must recalculate." data-pop-tour="0" style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#f9a825;display:inline-block;"></i>Write style/DOM</span><span data-pop-title="Layout" data-pop="Purple Layout block in the flame chart; look for the `Layout Forced` label in Summary." data-pop-tour="0" style="display:inline-flex;align-items:center;gap:.35rem;"><i style="width:.8rem;height:.8rem;border-radius:2px;background:#8e24aa;display:inline-block;"></i>Forced / final layout</span></div></div></div>
```

### The Problem

```js
// BAD: layout thrashing — reads and writes are interleaved
const boxes = document.querySelectorAll('.box');
boxes.forEach(box => {
  // READ: forces the browser to flush pending style/layout
  const width = box.offsetWidth;
  // WRITE: invalidates layout, so the next read must recalculate
  box.style.width = (width * 1.1) + 'px';
});
// Each iteration triggers a full synchronous layout
// 100 boxes = 100 forced layouts in one task
```

In the flame chart this appears as a rapid alternation of "Recalculate Style" and "Layout" purple blocks inside a single script task, often flagged as "Forced reflow" in the Details pane.

### The Fix

```js
// GOOD: batch all reads first, then all writes
const boxes = document.querySelectorAll('.box');

// Phase 1 — batch reads (no layout invalidation)
const widths = Array.from(boxes).map(box => box.offsetWidth);

// Phase 2 — batch writes (layout is invalidated once,
// recalculated once at the end of the task)
boxes.forEach((box, i) => {
  box.style.width = (widths[i] * 1.1) + 'px';
});
```

Alternative: use `requestAnimationFrame` to defer writes to the next frame, or use the `ResizeObserver` / `IntersectionObserver` APIs which are designed to avoid forced layout.

Libraries like **FastDOM** formalize this pattern by providing `fastdom.measure()` and `fastdom.mutate()` queues that automatically batch reads and writes.

### How to Find It in DevTools

1. Record a profile of the interaction that feels janky.
2. Look for dense clusters of purple blocks in the Main thread track.
3. Click one of the "Layout" blocks.
4. In the Summary tab, check for the label **"Layout Forced"** — this confirms a synchronous forced reflow.
5. The Details pane will show a stack trace pointing to the JS line that triggered the forced layout (the read that followed a write).

---

## Memory Track

Enable the Memory track by checking **Memory** in the toolbar before recording. This adds a continuous line graph above the main timeline showing JavaScript heap size over time.

### Reading the Graph

- **Blue line** — total JavaScript heap size (allocated objects, including live and unreachable).
- Heap size naturally rises as objects are allocated and falls when the garbage collector runs.
- **GC events** appear as sudden vertical drops in the heap line (the GC reclaims unreachable objects).

### What to Look For

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:.8rem;min-width:300px;"><div data-pop-title="Sawtooth" data-pop="Normal: allocation and GC working as expected." style="border:1px solid var(--d-border);border-radius:8px;padding:.5rem;"><div style="font-weight:700;color:#43a047;">Sawtooth</div><div style="font-size:.72rem;color:var(--d-muted);margin-bottom:.2rem;">Steady rise, periodic drops</div><svg viewBox="0 0 200 70" width="100%" height="70" preserveAspectRatio="none"><path d="M0,60 L40,20 L41,55 L80,15 L81,52 L120,12 L121,50 L160,10 L161,48 L200,8" fill="none" stroke="#43a047" stroke-width="2"/></svg></div><div data-pop-title="Staircase" data-pop="Memory leak: objects are retained across GC cycles. Use the Memory panel Heap Snapshot for object-level detail; the Performance panel tells you when growth begins, then cross-check the Interactions track." style="border:1px solid var(--d-border);border-radius:8px;padding:.5rem;"><div style="font-weight:700;color:#e53935;">Staircase</div><div style="font-size:.72rem;color:var(--d-muted);margin-bottom:.2rem;">Rises but never fully drops</div><svg viewBox="0 0 200 70" width="100%" height="70" preserveAspectRatio="none"><path d="M0,60 L35,40 L36,48 L70,28 L71,36 L105,18 L106,26 L140,10 L141,20 L200,5" fill="none" stroke="#e53935" stroke-width="2"/></svg></div><div data-pop-title="Delayed GC" data-pop="Many objects accumulated before collection." style="border:1px solid var(--d-border);border-radius:8px;padding:.5rem;"><div style="font-weight:700;color:#f9a825;">Delayed GC</div><div style="font-size:.72rem;color:var(--d-muted);margin-bottom:.2rem;">Flat, then a large drop</div><svg viewBox="0 0 200 70" width="100%" height="70" preserveAspectRatio="none"><path d="M0,52 L60,48 L110,28 L111,60 L200,58" fill="none" stroke="#f9a825" stroke-width="2"/></svg></div><div data-pop-title="GC pressure" data-pop="Too many short-lived objects force constant collection and minor GC pauses." style="border:1px solid var(--d-border);border-radius:8px;padding:.5rem;"><div style="font-weight:700;color:#8e24aa;">GC pressure</div><div style="font-size:.72rem;color:var(--d-muted);margin-bottom:.2rem;">Frequent tiny drops</div><svg viewBox="0 0 200 70" width="100%" height="70" preserveAspectRatio="none"><path d="M0,40 L10,26 L20,40 L30,26 L40,41 L50,27 L60,41 L70,27 L80,42 L90,28 L100,42 L110,28 L120,43 L130,29 L140,43 L150,29 L160,44 L170,30 L180,44 L190,30 L200,45" fill="none" stroke="#8e24aa" stroke-width="2"/></svg></div></div></div>
```

| Pattern | Meaning |
|---|---|
| Sawtooth: steady rise, periodic drops | Normal — allocation and GC working as expected |
| Staircase: rises but never fully drops | Memory leak — objects are being retained across GC cycles |
| Flat line with sudden large drop | Delayed GC — many objects accumulated before collection |
| Frequent tiny drops | GC pressure — too many short-lived objects forcing constant collection, which causes minor GC pauses |

A memory leak in the Performance panel manifests as a heap line that trends upward over the course of the recording without returning to baseline after GC events. To investigate the leak itself, use the Memory panel's Heap Snapshot or Allocation instrumentation tools, which give object-level detail. The Performance panel's memory track points you to when the leak begins — cross-reference with the Interactions track to identify which user action triggers the growth.

---

## User Timing API

The User Timing API lets you inject named markers and timed spans into the browser's performance timeline. They appear in the **Timings track** alongside LCP, FCP, and DCL, making it easy to correlate your application events with browser activity.

### API Overview

```js
// Mark a point in time (appears as a vertical line in Timings track)
performance.mark('app:init-start');

// ... do initialization work ...

performance.mark('app:init-end');

// Measure the duration between two marks (appears as a colored span)
performance.measure('app:init', 'app:init-start', 'app:init-end');
```

### Practical Example: Profiling a Data Fetch and Render

```js
async function loadDashboard() {
  performance.mark('dashboard:fetch-start');

  const data = await fetch('/api/dashboard').then(r => r.json());

  performance.mark('dashboard:fetch-end');
  performance.measure('dashboard:fetch', 'dashboard:fetch-start', 'dashboard:fetch-end');

  performance.mark('dashboard:render-start');

  renderCharts(data);

  performance.mark('dashboard:render-end');
  performance.measure('dashboard:render', 'dashboard:render-start', 'dashboard:render-end');

  performance.measure(
    'dashboard:total',
    'dashboard:fetch-start',
    'dashboard:render-end'
  );
}
```

### Accessing Marks Programmatically

```js
// Get all marks
const marks = performance.getEntriesByType('mark');
marks.forEach(m => console.log(m.name, m.startTime));

// Get all measures
const measures = performance.getEntriesByType('measure');
measures.forEach(m => console.log(m.name, m.duration));

// Use PerformanceObserver for real-time monitoring
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.entryType}: ${entry.name} — ${entry.duration?.toFixed(2) ?? entry.startTime.toFixed(2)}ms`);
  }
});
observer.observe({ entryTypes: ['mark', 'measure'] });

// Clean up marks when done
performance.clearMarks('dashboard:fetch-start');
performance.clearMeasures('dashboard:fetch');
```

### How They Appear in DevTools

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="min-width:520px;"><div style="display:flex;"><div style="width:6.5rem;font-size:.7rem;color:var(--d-muted);padding-top:.1rem;">Timings track</div><div style="position:relative;flex:1;height:4.6rem;border-top:1px solid var(--d-border);"><div data-pop-title="FCP" data-pop="Browser-generated marker." style="position:absolute;left:8%;top:0;bottom:1.2rem;border-left:2px solid #43a047;"><span style="position:absolute;top:0;left:3px;font-size:.65rem;color:#43a047;white-space:nowrap;">▼ FCP</span></div><div data-pop-title="LCP" data-pop="Browser-generated marker." style="position:absolute;left:45%;top:0;bottom:1.2rem;border-left:2px solid #43a047;"><span style="position:absolute;top:0;left:3px;font-size:.65rem;color:#43a047;white-space:nowrap;">▼ LCP</span></div><div data-pop-title="renderItems:start" data-pop="Appears as a labeled vertical line with a triangle at the top. Hover for name, start time and duration in the Details pane." style="position:absolute;left:52%;top:0;bottom:1.2rem;border-left:2px solid #1e88e5;"><span style="position:absolute;top:0;left:3px;font-size:.65rem;color:#1e88e5;white-space:nowrap;">▼ renderItems:start</span></div><div data-pop-title="renderItems:end" data-pop="The matching end mark. `performance.measure()` joins start and end into a span." style="position:absolute;left:72%;top:0;bottom:1.2rem;border-left:2px solid #1e88e5;"><span style="position:absolute;top:0;left:3px;font-size:.65rem;color:#1e88e5;white-space:nowrap;">▼ renderItems:end</span></div><div data-pop-title="renderItems (measure)" data-pop="`performance.measure()` appears as a coloured horizontal span labeled with the measure name. Answers questions like did my render start before or after LCP?" style="position:absolute;left:52%;width:20%;bottom:.2rem;height:.8rem;background:#1e88e5;border-radius:3px;color:#fff;font-size:.62rem;line-height:.8rem;padding:0 .3rem;">renderItems</div></div></div></div></div>
```

In the Performance panel Timings track:
- `performance.mark()` calls appear as **labeled vertical lines** with a triangle at the top.
- `performance.measure()` calls appear as **colored horizontal spans** labeled with the measure name.
- Hovering any mark or measure in the Timings track shows its name, start time, and duration in the Details pane.

This makes it trivial to answer questions like "did my render start before or after LCP?" or "how much of my TTI window is consumed by initializing the analytics SDK?"

---

## Complete Profiling Workflow

### Scenario: Page Scroll Feels Janky

This walkthrough demonstrates the end-to-end process of identifying and fixing a real performance problem.

#### Step 1 — Reproduce the Problem

Open the page in an Incognito window. Scroll the page and notice it stutters noticeably. Open DevTools Performance panel.

#### Step 2 — Record

1. Set CPU throttle to 4x.
2. Click Record.
3. Scroll the page continuously for 3 seconds.
4. Click Stop.

#### Step 3 — Find the Jank in the Overview

Look at the FPS chart. You see several red bars clustered together around the 1.2–2.4 second mark. Drag to select that region in the overview strip.

#### Step 4 — Locate the Long Task

Zoom into the selected region. In the Main thread track, you see a task block with a red triangle, spanning approximately 180 ms. This is the long task.

```renderhtml
<div style="font-size:.85rem;line-height:1.35;color:var(--d-fg);"><div style="min-width:560px;"><div style="position:relative;margin-left:2.2rem;height:1.2rem;font-size:.68rem;color:var(--d-muted);"><span style="position:absolute;left:0.0%;transform:translateX(-50%);">0 ms</span><span style="position:absolute;left:25.0%;transform:translateX(-50%);">45 ms</span><span style="position:absolute;left:50.0%;transform:translateX(-50%);">90 ms</span><span style="position:absolute;left:75.0%;transform:translateX(-50%);">135 ms</span><span style="position:absolute;left:100.0%;transform:translateX(-50%);">180 ms</span></div><div style="display:flex;"><div style="width:2.2rem;flex:none;font-size:.62rem;color:var(--d-muted);writing-mode:vertical-rl;transform:rotate(180deg);text-align:center;">call depth ↓</div><div style="position:relative;flex:1;height:9.899999999999999rem;"><i style="position:absolute;left:0.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:25.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:50.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:75.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><i style="position:absolute;left:100.0%;top:0;bottom:0;border-left:1px dashed var(--d-border);"></i><div data-pop-title="Long task (180 ms)" data-pop="The red-triangle task found by zooming into the 1.2–2.4 s jank region of the overview strip." style="position:absolute;left:0%;width:100%;top:0.0rem;height:1.5rem;background:#9e9e9e;border-radius:3px;color:#fff;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">Task (180 ms)</div><div data-pop-title="scroll handler" data-pop="The scroll event handler runs inside the task." style="position:absolute;left:0%;width:100%;top:1.65rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">scroll (event handler)</div><div data-pop-title="onScroll()" data-pop="Calls getVisibleItems() (12 ms) and renderItems() (155 ms)." style="position:absolute;left:0%;width:100%;top:3.3rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">onScroll()</div><div data-pop-title="getVisibleItems() — 12 ms" data-pop="Not the problem." style="position:absolute;left:0%;width:7%;top:4.949999999999999rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">getVisible…</div><div data-pop-title="renderItems() — 155 ms" data-pop="The hot function. Inside: buildCard (154 ms) and measureTextWidth (150 ms)." style="position:absolute;left:7%;width:86%;top:4.949999999999999rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">renderItems() — 155 ms  ← hot</div><div data-pop-title="buildCard()" data-pop="Almost all of renderItems&#x27; time." style="position:absolute;left:7%;width:85%;top:6.6rem;height:1.5rem;background:#f9a825;border-radius:3px;color:#18181b;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">buildCard() — 154 ms</div><div data-pop-title="measureTextWidth() — root cause" data-pop="Bottom-Up top entry (150 ms self time). It reads `offsetWidth` after appending a node on every iteration, forcing 100 synchronous layouts (layout thrashing). Fix: batch writes then reads." style="position:absolute;left:7%;width:83%;top:8.25rem;height:1.5rem;background:#8e24aa;border-radius:3px;color:#fff;font-size:.7rem;padding:0 .35rem;overflow:hidden;white-space:nowrap;line-height:1.5rem;box-sizing:border-box;border:1px solid rgb(0 0 0 / .15);">measureTextWidth() — 150 ms   [Forced Layout × 100]</div></div></div></div></div>
```

#### Step 5 — Identify the Root Cause

Click the long task. Open the Bottom-Up tab. The top entry is `measureTextWidth` with 150 ms self time. Click the source link. In the source code you find:

```js
// BEFORE (causes layout thrashing in a loop)
function renderItems(items) {
  items.forEach(item => {
    const card = createCard(item);
    container.appendChild(card);
    // Reading offsetWidth after write forces synchronous layout
    const w = card.offsetWidth;
    card.style.setProperty('--card-width', w + 'px');
  });
}
```

Each iteration appends a node (write), then reads `offsetWidth` (read), forcing a synchronous layout on every card.

#### Step 6 — Fix the Code

```js
// AFTER (batch writes, then batch reads)
function renderItems(items) {
  // Write phase: append all cards first
  const cards = items.map(item => {
    const card = createCard(item);
    container.appendChild(card);
    return card;
  });

  // Read phase: all offsetWidth reads happen after all writes
  // Browser only needs one layout pass
  cards.forEach(card => {
    const w = card.offsetWidth;
    card.style.setProperty('--card-width', w + 'px');
  });
}
```

#### Step 7 — Verify the Fix

Record the scroll interaction again with the fix applied. In the new profile:
- The FPS chart shows no red bars during scroll.
- The long task is gone; scroll event handlers complete in under 10 ms.
- The Bottom-Up tab shows `renderItems` now takes 8 ms total.

#### Step 8 — Add a User Timing Guard

To prevent regressions, add a performance measure around the render call:

```js
function renderItems(items) {
  performance.mark('renderItems:start');

  const cards = items.map(item => {
    const card = createCard(item);
    container.appendChild(card);
    return card;
  });

  cards.forEach(card => {
    const w = card.offsetWidth;
    card.style.setProperty('--card-width', w + 'px');
  });

  performance.mark('renderItems:end');
  performance.measure('renderItems', 'renderItems:start', 'renderItems:end');

  // Warn in development if render exceeds budget
  const [measure] = performance.getEntriesByName('renderItems', 'measure');
  if (measure.duration > 16) {
    console.warn(`renderItems took ${measure.duration.toFixed(1)}ms — exceeds frame budget`);
  }
}
```

Future profiles will show `renderItems` as a named span in the Timings track, making regressions immediately visible without needing to dig through the flame chart.

---

## Quick Reference

### Keyboard Shortcuts (Performance Panel)

| Shortcut | Action |
|---|---|
| `Ctrl+E` / `Cmd+E` | Start/Stop recording |
| `Scroll` | Zoom in/out on timeline |
| `Shift+Scroll` | Pan timeline left/right |
| `W` / `S` | Zoom in / Zoom out |
| `A` / `D` | Pan left / Pan right |
| `0` | Reset zoom to full recording |
| `Esc` | Close Details pane |

### At-a-Glance Diagnosis Guide

| Symptom | Where to Look | Likely Cause |
|---|---|---|
| High INP | Interactions track + Main thread | Long task blocking input processing |
| Slow LCP | Timings track + Network track | Large image, slow server, render-blocking CSS/JS |
| Layout shifts (CLS) | Timings track shows shift markers | Images without dimensions, injected content |
| Jank during scroll | FPS red bars + Main thread long tasks | Layout thrashing, unthrottled scroll handler |
| Slow initial load | Network track + Main thread | Large JS bundles, synchronous scripts in `<head>` |
| Memory growth | Memory track staircase pattern | Event listeners not removed, closures retaining data |
| GC pauses | Memory track drops + Main yellow spikes | Too many short-lived objects (object pooling can help) |

---

[← Web Devtools](/coding/web-devtools/)
