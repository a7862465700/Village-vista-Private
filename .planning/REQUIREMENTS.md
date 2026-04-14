# Requirements — v1.0 Milestone

## R1: Property Card Redesign
- **R1.1**: Property cards show large, prominent images (aspect-[4/3]) as the focal point
- **R1.2**: Hover state reveals photo carousel with left/right arrows to browse parcel photos
- **R1.3**: Arrow clicks don't navigate away — use e.preventDefault/stopPropagation
- **R1.4**: Large acreage badge (rounded pill, top-right) replaces tiny text badge
- **R1.5**: Simplified text: Lot number, title, location (left) + price/monthly (right)
- **R1.6**: "or" separator between cash price and monthly financed amount
- **R1.7**: 5 hard-coded community amenity icons: Electric, Water & Sewer, Internet, Road Access, 24hr Security
- **R1.8**: "View Details" button at bottom of card
- **R1.9**: Dot indicators showing current photo position
- **R1.10**: PropertyCardHome updated to match new visual style (no hover carousel needed)

## R2: Interactive Map Explorer
- **R2.1**: Dedicated `/map` page (separate from /properties)
- **R2.2**: Leaflet + react-leaflet with OpenStreetMap tiles
- **R2.3**: Markers for all properties with lat/lng data
- **R2.4**: Marker clustering for nearby properties
- **R2.5**: Popup on marker click: photo thumbnail, title, acreage, price, "View Details" link
- **R2.6**: Map centered on Hot Springs Village, AR area
- **R2.7**: Full-height map (viewport minus navbar)
- **R2.8**: "Explore Map" link in Navbar
- **R2.9**: "Explore on Map" link on /properties page
- **R2.10**: Custom marker icon matching green/gold theme

## R3: Dependencies
- **R3.1**: Install leaflet, react-leaflet, react-leaflet-cluster, @types/leaflet
- **R3.2**: Leaflet CSS imported in map component
- **R3.3**: Dynamic import with { ssr: false } for Leaflet component
- **R3.4**: Leaflet popup theme overrides in globals.css
