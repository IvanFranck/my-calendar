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
export function EventForm() {
    const { isOpen, setIsOpen, selectedEvent } = useDisplayEventFormStore();
    const { agents } = useCalendarStore();

    const agentsOptions = agents.map((agent) => ({
        label: agent.name,
        value: agent.id,
    }));

    // Initial values pour le formulaire (création ou édition)
    const defaultValues: TaskSchemaType = useMemo(() => selectedEvent ? {
        title: selectedEvent?.title || "",
        startDate: selectedEvent?.start ? new Date(selectedEvent.start) : new Date(),
        endDate: selectedEvent?.end ? new Date(selectedEvent.end) : new Date(),
        agentId: selectedEvent?.agentId || "",
    } : {
        title: "",
        startDate: new Date(),
        endDate: new Date(),
        agentId: "",
    }, [selectedEvent]);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskSchemaType>({
        resolver: zodResolver(TaskSchema),
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
    }, [selectedEvent, reset]);

    function onSubmit(data: TaskSchemaType) {
        // Ici tu peux gérer la création ou la modification
        // Par exemple : saveTask(data)
        console.log(data);
        setIsOpen(false);
    }

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
                                {...register("startDate", {
                                    valueAsDate: true,
                                })}
                            />
                            {errors.startDate && (
                                <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Fin</label>
                            <Input
                                type="datetime-local"
                                {...register("endDate", {
                                    valueAsDate: true,
                                })}
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