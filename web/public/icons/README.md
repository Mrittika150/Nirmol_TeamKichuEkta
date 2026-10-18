# Your icons (Flaticon or any other source)

How it works
1. Download an icon (PNG, about 128x128, transparent background) from Flaticon.
2. Save it here with the exact name from the table below, e.g. `pin.png`.
3. Open `src/lib/icon-slots.ts` and add the name to `CUSTOM_ICONS`, e.g. `["pin", "wind"]`.
4. Refresh the page. Icons you did not add keep the built-in drawing.

Prefer SVG? Save `pin.svg` and set `ICON_EXTENSION = "svg"` in the same file.

Flaticon licence: free icons need a credit. Keep a line such as
"Icons by <author> from Flaticon" in the footer (see `src/components/Dashboard.tsx`).

| File name       | Where it appears                                        |
|-----------------|---------------------------------------------------------|
| wind.png        | Air card on My Nirmol, logo tiles                       |
| pin.png         | Location picker, saved place cards, step 1              |
| trend.png       | Forecast, step 2                                        |
| activity.png    | Exposure tool cards                                     |
| route.png       | Travel planner cards, step 3                            |
| sliders.png     | What-if simulator cards                                 |
| book.png        | Diary cards                                             |
| bell.png        | Alerts cards, step 4                                    |
| flag.png        | Report pollution                                        |
| map.png         | Community cards                                         |
| chat.png        | AI advisor cards                                        |
| user.png        | Profile card on My Nirmol                               |
| lock.png        | Account settings card                                   |
| thermometer.png | Temperature tile on the dashboard                       |
| droplet.png     | Humidity tile on the dashboard                          |
