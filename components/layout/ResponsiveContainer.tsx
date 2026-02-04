interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export function ResponsiveContainer({ children, maxWidth = 1300 }: ResponsiveContainerProps) {
  return (
    <div
      className="responsive-container"
      style={{
        maxWidth,
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}
