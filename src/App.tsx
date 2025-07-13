// src/App.tsx

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import './index.css'; // تأكد من استيراد ملف CSS الخاص بـ Tailwind
import type { FC } from 'react';

// تعريف شكل بيانات المهمة
interface Todo {
  id: number;
  task: string;
  is_completed: boolean;
}

// أيقونة سلة المهملات
const TrashIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09a2.09 2.09 0 0 0-2.09 2.134v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
 const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(error => console.error('Error fetching todos:', error));
  }, []);

  // دالة إضافة مهمة جديدة
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: newTask }),
    })
      .then(res => res.json())
      .then(newTodo => {
        setTodos([...todos, newTodo]);
        setNewTask('');
      })
      .catch(error => console.error('Error adding todo:', error));
  };

  // دالة لتغيير حالة إكمال المهمة
  const handleToggleComplete = (id: number, currentStatus: boolean) => {
    fetch(`${apiUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_completed: !currentStatus }),
    })
      .then(res => res.json())
      .then(updatedTodo => {
        setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));
      })
      .catch(error => console.error('Error updating todo:', error));
  };

  // دالة لحذف مهمة
  const handleDelete = (id: number) => {
    fetch(`${apiUrl}/${id}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          setTodos(todos.filter(todo => todo.id !== id));
        } else {
          throw new Error('Failed to delete');
        }
      })
      .catch(error => console.error('Error deleting todo:', error));
  };


  return (
    <div className="min-h-screen bg-slate-900 text-white flex justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        {/* -- Header -- */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Todo List
            </span>
          </h1>
          <p className="mt-4 text-lg text-slate-400">Stay organized, stay productive.</p>
        </div>

        {/* -- Add Todo Form -- */}
        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            disabled={!newTask.trim()}
          >
            Add Task
          </button>
        </form>

        {/* -- Todos List -- */}
        <div className="space-y-4">
          {todos.map(todo => (
            <div 
              key={todo.id} 
              className="group flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 transition-all duration-300"
            >
              <button onClick={() => handleToggleComplete(todo.id, todo.is_completed)} className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${todo.is_completed ? 'border-green-500 bg-green-500' : 'border-slate-500'}`}>
                  {todo.is_completed && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>
              </button>
              <p className={`flex-grow text-lg transition-colors ${todo.is_completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {todo.task}
              </p>
              <button 
                onClick={() => handleDelete(todo.id)} 
                className="text-slate-600 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Delete task"
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;