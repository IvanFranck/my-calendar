import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDisplayEventFormStore } from "@/stores/display-event.store";

export function EventForm() {
    const { isOpen, setIsOpen, selectedEvent, setSelectedEvent } = useDisplayEventFormStore()
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
                        onSubmit={e => {
                            e.preventDefault();
                            setIsOpen(false);
                        }}
                    >
                        <div>
                            <label className="block text-sm font-medium">Titre</label>
                            <Input
                                value={selectedEvent.title}
                                onChange={e =>
                                    setSelectedEvent({ ...selectedEvent, title: e.target.value })
                                }
                            />
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