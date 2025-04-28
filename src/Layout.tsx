import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { EventsGrid } from "./components/EventsGrid"
import { MissionsCalendar } from "./components/MissionCalendar"
export function Layout() {
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
                            <EventsGrid type="missions" />
                            <div className="w-full mt-4">
                                <MissionsCalendar />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="agents">
                        <div className="w-full mt-4">
                            <h1 className="text-2xl font-bold">Agents</h1>
                            <EventsGrid type="agents" />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
