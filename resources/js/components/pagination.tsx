import { Button } from '@/components/ui/button';
import { type Paginated } from '@/types';
import { Link } from '@inertiajs/react';

/** Page links for a Laravel paginator. Renders nothing when there is only one page. */
export default function Pagination<T>({ page }: { page: Paginated<T> }) {
    if (page.last_page <= 1) return null;

    return (
        <nav className="flex flex-wrap gap-1">
            {page.links.map((link, i) =>
                link.url ? (
                    <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" asChild>
                        <Link href={link.url} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
                    </Button>
                ) : (
                    <Button key={i} variant="outline" size="sm" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                ),
            )}
        </nav>
    );
}
