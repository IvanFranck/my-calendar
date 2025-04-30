import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDisplayEventFormStore } from "@/stores/display-event.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskSchema, TaskSchemaType } from "@/types";
import { useEffect, useMemo } from "react";
import { useCalendarStore } from "@/stores/calendar.store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTimeLocal } from "@/lib/utils";
export function EventForm() {
    const { isOpen, setIsOpen, selectedEvent } = useDisplayEventFormStore();
    const { agents, updateTask } = useCalendarStore();

    const agentsOptions = useMemo(() => agents.map((agent) => ({
        label: agent.name,
        value: agent.id,
    })), [agents]);

    // Initial values pour le formulaire (création ou édition)
    const defaultValues: TaskSchemaType = useMemo(() => {
        if (selectedEvent) {
            //if selectedEvent is a CalendarEvent
            if ('start' in selectedEvent) {
                return {
                    title: selectedEvent.title,
                    startDate: selectedEvent.start ? formatDateTimeLocal(selectedEvent.start) : formatDateTimeLocal(new Date()),
                    endDate: selectedEvent.end ? formatDateTimeLocal(selectedEvent.end) : formatDateTimeLocal(new Date()),
                    agentId: selectedEvent.agentId,
                }
            }
            return {
                title: selectedEvent.title,
                startDate: selectedEvent.startDate ? formatDateTimeLocal(selectedEvent.startDate) : formatDateTimeLocal(new Date()),
                endDate: selectedEvent.endDate ? formatDateTimeLocal(selectedEvent.endDate) : formatDateTimeLocal(new Date()),
                agentId: selectedEvent.agentId,
            }
        } else {
            return {
                title: "",
                startDate: formatDateTimeLocal(new Date()),
                endDate: formatDateTimeLocal(new Date()),
                agentId: "",
            }
        }
    }, [selectedEvent]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskSchemaType>({
        resolver: zodResolver(TaskSchema),
        defaultValues,
    });

    function onSubmit(data: TaskSchemaType) {
        const task = {
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
        };
        console.log(task);
        const taskId = selectedEvent?.id;
        if (taskId) {
            updateTask(taskId.toString(), task);
        }
        setIsOpen(false);
    }

    useEffect(() => {
        reset(defaultValues);
    }, [selectedEvent, reset]);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="w-[400px]">
                <SheetHeader>
                    <SheetTitle>Modifier l'évènement</SheetTitle>
                    <SheetDescription>
                        Modifiez les informations de l'évènement puis validez.
                    </SheetDescription>
                </SheetHeader>
                {selectedEvent && (
                    <form
                        className="space-y-4 mt-4"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div>
                            <label className="block text-sm font-medium">Titre</label>
                            <Input {...register("title")} />
                            {errors.title && (
                                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Début</label>
                            <Input
                                type="datetime-local"
                                {...register("startDate")}
                            />
                            {errors.startDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Fin</label>
                            <Input
                                type="datetime-local"
                                {...register("endDate")}
                            />
                            {errors.endDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Agent</label>
                            <Select {...register("agentId")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un agent" />
                                </SelectTrigger>
                                <SelectContent>
                                    {agentsOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.agentId && (
                                <p className="text-red-500 text-xs mt-1">{errors.agentId.message}</p>
                            )}
                        </div>
                        <SheetFooter>
                            <Button type="submit">Enregistrer</Button>
                            <SheetClose asChild>
                                <Button type="button" variant="outline">Annuler</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                )}
            </SheetContent>
        </Sheet>
    )
}