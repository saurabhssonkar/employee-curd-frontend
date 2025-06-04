'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { z } from 'zod';
import { UserPlus, Pencil, XCircle } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  email: string;
  departmentId: number;
}

interface Department {
  id: number;
  name: string;
}

interface Props {
  employee: Employee | null;
  setEmployee: (employee: Employee | null) => void;
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  departments: Department[];
}

const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  departmentId: z.string().min(1, 'Department is required').transform((val) => parseInt(val)),
});

export default function EmployeeForm({ employee, setEmployee, setEmployees, departments }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        departmentId: '',
      });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        departmentId: String(employee.departmentId),
      });
    } else {
      setFormData({ name: '', email: '', departmentId: '' });
    }
  }, [employee]);
  console.log("employee",employee)
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = employeeSchema.parse(formData);
      const token = localStorage.getItem('token');
      if (employee) {
        const res = await axios.put<Employee>(`http://localhost:5000/api/employees/${employee.id}`, validatedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees((prev) => prev.map((emp) => (emp.id === employee.id ? res.data : emp)));
      } else {
        const res = await axios.post<Employee>('http://localhost:5000/api/employees', validatedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees((prev) => [...prev, res.data]);
      }
      setEmployee(null);
      setFormData({ name: '', email: '', departmentId: '' });
      setError('');
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map((e) => e.message).join(', '));
      } else {
        setError('Error saving employee');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" mx-auto bg-white shadow-xl p-6 rounded-2xl border border-gray-200"
    >
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {employee ? <Pencil size={20} /> : <UserPlus size={20} />}
        {employee ? 'Edit Employee' : 'Add New Employee'}
      </h3>

      {error && <p className="text-sm text-red-600 mb-4 bg-red-50 p-2 rounded">{error}</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
            placeholder="example@email.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
          <select
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
            required
          >
            <option value="">-- Select Department --</option>
            {departments.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        {employee && (
          <button
            type="button"
            onClick={() => setEmployee(null)}
            className="flex items-center  cursor-pointer gap-2 px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-lg shadow-sm"
          >
            <XCircle size={18} />
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="flex  cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md"
        >
          {employee ? <Pencil size={18} /> : <UserPlus size={18} />}
          {employee ? 'Update' : 'Add'} Employee
        </button>
      </div>
    </form>
  );
}
