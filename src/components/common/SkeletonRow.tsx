export function SkeletonRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full lr-skeleton" />
        </td>
      ))}
    </tr>
  );
}