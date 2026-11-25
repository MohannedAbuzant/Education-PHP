import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

/** Green banner for the one-off `status` message the server flashes after an action. */
export default function FlashStatus() {
    const { flash } = usePage<SharedData>().props;

    if (!flash.status) return null;

    return <p className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm">{flash.status}</p>;
}
