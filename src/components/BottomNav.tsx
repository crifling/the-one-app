import { NavLink } from 'react-router-dom';

const ITEMS = [
  { to: '/today', label: 'I dag', icon: '⌂' },
  { to: '/tasks', label: 'Opgaver', icon: '✓' },
  { to: '/workouts', label: 'Træning', icon: '◫' },
  { to: '/routines', label: 'Rutiner', icon: '↻' },
  { to: '/tracks', label: 'Spor', icon: '◎' },
];

export function BottomNav() {
  return (
    <nav className="nav" aria-label="Hovednavigation">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `navlink${isActive ? ' active' : ''}`}
        >
          <span className="navicon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
