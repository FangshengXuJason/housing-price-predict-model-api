export default function JavaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-amber-500 pl-4">
        <p className="text-sm text-amber-600 font-medium">
          Java Backend (Spring Boot)
        </p>
      </div>
      {children}
    </div>
  );
}
