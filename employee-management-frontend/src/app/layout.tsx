import './globals.css';
import { Navbar } from '../app/components/Navbar';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Employee Management',
  description: 'A simple employee management system',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <Navbar />
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}