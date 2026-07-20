export default function SkeletonCard() {
  return (
    <div className="event-card">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-1/2 rounded-lg" />
        <div className="flex justify-between">
          <div className="skeleton h-3 w-1/4 rounded-lg" />
          <div className="skeleton h-3 w-1/4 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
