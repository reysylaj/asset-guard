import { Link } from 'react-router-dom';

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="text-sm text-muted-foreground">
      {items.map((item, i) => (
        <span key={i}>
          {item.href ? <Link to={item.href}>{item.label}</Link> : item.label}
          {i < items.length - 1 && ' / '}
        </span>
      ))}
    </nav>
  );
}
