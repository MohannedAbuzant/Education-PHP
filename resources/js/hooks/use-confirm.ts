import { useState } from 'react';

/**
 * State for a "are you sure?" dialog about one item.
 *
 * `target` stays set after the dialog closes, so the dialog text never goes
 * blank while it animates away. Only `open` changes on close.
 */
export function useConfirm<T>() {
    const [target, setTarget] = useState<T | null>(null);
    const [open, setOpen] = useState(false);

    return {
        target,
        open,
        ask: (item: T) => {
            setTarget(item);
            setOpen(true);
        },
        close: () => setOpen(false),
    };
}
