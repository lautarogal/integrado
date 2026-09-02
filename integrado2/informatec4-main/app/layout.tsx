import './globals.css';
import type { Metadata } from 'next';
import { Encode_Sans_Condensed } from 'next/font/google';
import { AuthProvider } from './components/AuthProvider';

const encodeSansCondensed = Encode_Sans_Condensed({
  subsets: ['latin'],
  weight: ['100', '300', '400', '600', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Portal de Noticias Escolar',
  description: 'Portal de noticias y novedades de la escuela',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={encodeSansCondensed.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}