'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import EmployeeForm from './EmployeeForm';
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  departmentId: number;
  department: { name: string };
}

interface Department {
  id: number;
  name: string;
}

interface EmployeeResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
}

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [limit] = useState<number>(10);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');

    const fetchData = async () => {
      try {
        const [empRes, depRes] = await Promise.all([
          axios.get<EmployeeResponse>(
            `http://localhost:5000/api/employees?page=${page}&limit=${limit}&search=${search}&departmentId=${departmentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<Department[]>('http://localhost:5000/api/employees/departments', {
            headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);
        setEmployees(empRes.data.employees);
        setTotal(empRes.data.total);
        setDepartments(depRes.data);
      } catch (err: any) {
        if (err.response?.status === 401) router.push('/login');
      }
    };
    fetchData();
  }, [page, search, departmentId, router]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadCSV = () => {
    // Prepare CSV content
    const headers = ['ID', 'Name', 'Email', 'Department'];
    const rows = employees.map(emp => [
      emp.id,
      `"${emp.name.replace(/"/g, '""')}"`, // Escape quotes in name
      `"${emp.email.replace(/"/g, '""')}"`, // Escape quotes in email
      `"${emp.department.name.replace(/"/g, '""')}"` // Escape quotes in department
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Employee Directory</h2>
      <div className='flex justify-end mb-2'>
      <button
          onClick={handleDownloadCSV}
          className="flex items-center  cursor-pointer gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          title="Download CSV"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>


      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-xl shadow-md mb-6">
        <div className="relative w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          className="w-full md:w-1/3 cursor-pointer py-3 px-4 border text-black border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
        >
          <option value="">All Departments</option>
          {departments.map((dep) => (
            <option key={dep.id} value={dep.id}>{dep.name}</option>
          ))}
        </select>
      </div>

      {/* Form */}
      <div className="mb-6">
        <EmployeeForm
          employee={editingEmployee}
          setEmployee={setEditingEmployee}
          setEmployees={setEmployees}
          departments={departments}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((emp, index) => (
              <tr
                key={emp.id}
                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">{emp.name}</td>
                <td className="px-6 py-4 text-gray-600">{emp.email}</td>
                <td className="px-6 py-4 text-gray-600">{emp.department.name}</td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <button
                    onClick={() => setEditingEmployee(emp)}
                    className="p-2 bg-blue-500 cursor-pointer hover:bg-blue-600 text-white rounded-md"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="p-2 bg-red-500 cursor-pointer hover:bg-red-600 text-white rounded-md"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <span className="text-gray-700 font-medium">
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= Math.ceil(total / limit)}
          className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
