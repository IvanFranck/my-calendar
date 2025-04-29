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

export function Layout() {
    const { addAgent, addTask } = useCalendarStore();

    useEffect(() => {
        addAgent({ id: '1', name: 'Agent 1' });
        addAgent({ id: '2', name: 'Agent 2' });
        addAgent({ id: '3', name: 'Agent 3' });
        addAgent({ id: '4', name: 'Agent 4' });

        addTask({ id: '1', title: 'Task 1', startDate: new Date('2025-04-29'), endDate: new Date('2025-04-29'), agentId: '1' });
        addTask({ id: '2', title: 'Task 2', startDate: new Date('2025-04-30'), endDate: new Date('2025-04-30'), agentId: '2' });
        addTask({ id: '3', title: 'Task 3', startDate: new Date('2024-06-12'), endDate: new Date('2024-06-12'), agentId: '3' });
        addTask({ id: '4', title: 'Task 4', startDate: new Date('2024-06-12'), endDate: new Date('2024-06-12'), agentId: null });
    }, [addAgent, addTask]);


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
