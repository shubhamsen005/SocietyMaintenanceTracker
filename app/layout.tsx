import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Nivasa Pulse', description: 'From complaints to community intelligence.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="en"><body>{children}</body></html>;
}
