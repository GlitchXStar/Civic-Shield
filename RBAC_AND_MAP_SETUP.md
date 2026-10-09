# RBAC + OpenStreetMap changes

## Role-based access control
- `src/auth/AuthContext.jsx` stores the current demo session and role.
- `src/auth/ProtectedRoute.jsx` blocks direct navigation to another role's routes.
- `/citizen/*` requires `citizen`.
- `/police/*` requires `police`.
- `/admin/*` requires `admin`.
- Login includes a demo role selector. Replace `login()` with the real authentication response and persist the backend-issued session/token.

### Important
Frontend route guards are not a security boundary. The backend must validate the authenticated user's role/permissions on every protected API request.

## OpenStreetMap
- `src/components/CrimeMap.jsx` uses Leaflet + React Leaflet with OpenStreetMap tiles.
- Citizen, police and admin dashboards show map views.
- Citizen report creation includes a click-to-select incident location.
- The selected latitude/longitude is ready to be included in the eventual report API payload.
- OpenStreetMap attribution is included in the map.

## Install
Run:

```bash
npm install
npm run dev
```

The added dependencies are `leaflet` and `react-leaflet`.
