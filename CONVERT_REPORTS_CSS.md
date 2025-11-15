# Reports CSS Conversion Guide

All Reports pages need to:
1. Import `../Reports.css` (or `../../Reports.css` depending on folder depth)
2. Replace Tailwind classes with CSS classes from Reports.css

Key conversions:
- `p-6` → `reports-container` (for main container)
- `bg-white rounded-lg shadow-md` → `reports-card`
- `grid grid-cols-*` → `reports-grid`
- `bg-blue-500` → `stat-card stat-card-blue`
- `px-4 py-2 bg-blue-500` → `btn btn-primary`
- Table classes → `reports-table`, `table-container`
- Status badges → `status-badge status-badge-*`

