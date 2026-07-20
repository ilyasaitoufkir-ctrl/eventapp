export default function SkeletonCard() {
  return (
    <div className="event-card">
      <div className="skeleton h-52 w-full" style={{ borderRadius: '24px 24px 0 0' }} />
      <div className="px-4 pt-3.5 pb-4 space-y-3">
        <div className="skeleton h-5 w-4/5 rounded-lg" />
        <div className="skeleton h-4 w-3/5 rounded-lg" />
        <div className="flex justify-between items-center">
          <div className="skeleton h-3 w-1/4 rounded-lg" />
          <div className="skeleton h-7 w-1/4 rounded-full" />
        </div>
      </div>
    </div>
  )
}
