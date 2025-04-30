import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { MissionsCalendar } from "./components/MissionCalendar"
import { AgentCalendar } from "./components/agent-calendar/AgentCalendar"
import { useCalendarStore } from "./stores/calendar.store";
import { useEffect } from "react";
import { EventForm } from "./components/EventForm";
import { TaskInterface } from "./types";
import { addDays } from "date-fns";


// Définir les événements de base
const initialsEvents: TaskInterface[] = [
    {
        id: '1',
        title: 'task 1',
        agentId: '1',
        startDate: addDays(new Date(), 1),
        endDate: addDays(new Date(), 1),
    },
    {
        id: '2',
        title: 'task 2',
        agentId: '2',
        startDate: addDays(new Date(), 2),
        endDate: addDays(new Date(), 2),
    },
    {
        id: '3',
        title: 'task 3',
        agentId: '3',
        startDate: addDays(new Date(), 3),
        endDate: addDays(new Date(), 3),
    },
    {
        id: '4',
        title: 'task 4',
        agentId: '3',
        startDate: addDays(new Date(), 4),
        endDate: addDays(new Date(), 4),
    },
]


export function Layout() {
    const { addAgent, setInitialTasks } = useCalendarStore();

    useEffect(() => {
        addAgent({ id: '1', name: 'Agent 1' });
        addAgent({ id: '2', name: 'Agent 2' });
        addAgent({ id: '3', name: 'Agent 3' });
        addAgent({ id: '4', name: 'Agent 4' });

        setInitialTasks(initialsEvents)
    }, [addAgent, setInitialTasks]);


    return (
        <div className=" h-screen bg-gray-100">
            <div className="container mx-auto p-4">
                <Tabs defaultValue="account" className="w-full">
                    <TabsList className="w-[400px] bg-white rounded-lg border border-gray-200 py-5">
                        <TabsTrigger value="missions" className="p-4 data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900">Missions</TabsTrigger>
                        <TabsTrigger value="agents" className="p-4 data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900">Agents</TabsTrigger>
                    </TabsList>
                    <TabsContent value="missions">
                        <div className="w-full mt-4 space-y-4">
                            <h1 className="text-2xl font-bold">Missions</h1>
                            <div className="w-full mt-4">
                                <MissionsCalendar />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="agents">
                        <div className="w-full mt-4">
                            <h1 className="text-2xl font-bold mb-4">Agents</h1>
                            <AgentCalendar />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <EventForm />
        </div>
    )
}
