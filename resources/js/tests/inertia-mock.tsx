import { useState } from 'react';
import { vi } from 'vitest';

export const router = { post: vi.fn(), delete: vi.fn(), put: vi.fn() };
export const formActions = { post: vi.fn(), put: vi.fn() };
export const pageProps: Record<string, unknown> = { flash: { status: null }, errors: {}, auth: { user: { role: 'student' } } };

export const inertiaMock = {
    router,
    Head: () => null,
    Link: ({ href, children, ...rest }: { href: string; children?: React.ReactNode }) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
    usePage: () => ({ props: pageProps }),
    useForm: <T extends Record<string, unknown>>(initial: T) => {
        const [data, setData] = useState(initial);
        return {
            data,
            setData: (key: keyof T, value: unknown) => setData((current) => ({ ...current, [key]: value })),
            errors: {} as Record<string, string>,
            processing: false,
            ...formActions,
        };
    },
};
