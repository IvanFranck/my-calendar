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
import { Form, FormField, FormItem, FormLabel, FormControl } from "./ui/form";
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

    const form = useForm<TaskSchemaType>({
        resolver: zodResolver(TaskSchema),
        defaultValues,
    });

    const { handleSubmit, formState: { errors }, reset } = form;

    function onSubmit(data: TaskSchemaType) {
        const task = {
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            agentId: data.agentId,
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
                    <Form {...form}>
                        <form
                            className="space-y-4 mt-4"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Titre</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        {errors.title && (
                                            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Début</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                {...field}
                                            />
                                        </FormControl>
                                        {errors.startDate && (
                                            <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fin</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="datetime-local"
                                                {...field}
                                            />
                                        </FormControl>
                                        {errors.endDate && (
                                            <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="agentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Agent</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} defaultValue={field.value as string}>
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
                                        </FormControl>
                                        {errors.agentId && (
                                            <p className="text-red-500 text-xs mt-1">{errors.agentId.message}</p>
                                        )}
                                    </FormItem>
                                )}
                            />
                            <SheetFooter>
                                <Button type="submit">Enregistrer</Button>
                                <SheetClose asChild>
                                    <Button type="button" variant="outline">Annuler</Button>
                                </SheetClose>
                            </SheetFooter>
                        </form>
                    </Form>
                )}
            </SheetContent>
        </Sheet>
    )
}