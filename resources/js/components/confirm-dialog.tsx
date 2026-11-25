import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Props = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    dismissLabel: string;
    onConfirm: () => void;
    onDismiss: () => void;
};

/** A destructive action behind a "are you sure?" dialog. */
export default function ConfirmDialog({ open, title, description, confirmLabel, dismissLabel, onConfirm, onDismiss }: Props) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onDismiss}>
                        {dismissLabel}
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
