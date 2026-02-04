interface DashboardGridProps {
  children: React.ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="responsive-grid-2">
      {children}
    </div>
  );
}
