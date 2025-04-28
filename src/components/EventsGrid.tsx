import { MissionsData, AgentsData } from '../data'

type EventsGridProps = {
    type: 'missions' | 'agents'
}

export function EventsGrid({ type }: EventsGridProps) {
    const events = type === 'missions' ? MissionsData : AgentsData
    return (
        <section className="w-full flex gap-4 flex-wrap bg-white rounded-lg p-4 border border-gray-200">
            {events.map((event) => (
                <div className="border rounded-lg p-2 flex flex-col gap-2" key={JSON.stringify(event)}>
                    <p>{event.title}</p>
                </div>
            ))}
        </section>
    )
}