import { vi } from 'vitest';

export const router = { post: vi.fn(), delete: vi.fn(), put: vi.fn() };
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
};
