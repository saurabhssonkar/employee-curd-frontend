'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('token');
    if (session) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/register');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Employee Management</h1>
        <div className="flex gap-4">
          <a href="/employees" className="hover:underline">Employees</a>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="hover:underline">Logout</button>
          ) : (
            <>
              <button onClick={handleLogin} className="hover:underline">Logout</button>
              <button onClick={handleSignup} className="hover:underline">Signup</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
