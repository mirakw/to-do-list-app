import React, { useState } from 'react';
import { PlusCircle, Trash2, CheckCircle, Circle, Sparkles, Loader2 } from 'lucide-react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  subtasks?: Todo[];
  parentId?: number;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo.trim(), completed: false }]);
      setNewTodo('');
    }
  };

  const breakdownTask = async () => {
    if (!newTodo.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://cloud.activepieces.com/api/v1/webhooks/trXZei9puOxBNxrk0YFka/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newTodo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get task breakdown');
      }

      const data = await response.json();
      const subtasks = data.message
        .split('\n')
        .filter(Boolean)
        .map((task: string) => ({
          id: Date.now() + Math.random(),
          text: task.trim(),
          completed: false,
        }));

      const parentTask: Todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        subtasks,
      };

      setTodos([...todos, parentTask]);
      setNewTodo('');
    } catch (err) {
      setError('Failed to break down task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      if (todo.subtasks) {
        return {
          ...todo,
          subtasks: todo.subtasks.map(subtask =>
            subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
          ),
        };
      }
      return todo;
    }));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id && !todo.parentId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Smart Todo List
          </h1>

          <form onSubmit={addTodo} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                disabled={isLoading || !newTodo.trim()}
              >
                <PlusCircle size={20} />
                Add
              </button>
              <button
                type="button"
                onClick={breakdownTask}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                disabled={isLoading || !newTodo.trim()}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Sparkles size={20} />
                )}
                Break Down
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {todos.map(todo => (
              <div key={todo.id}>
                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="text-gray-500 hover:text-purple-500 transition-colors duration-200"
                  >
                    {todo.completed ? (
                      <CheckCircle className="text-green-500" size={24} />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>
                  <span
                    className={`flex-1 ${
                      todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                    }`}
                  >
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {todo.subtasks && (
                  <div className="ml-8 mt-2 space-y-2">
                    {todo.subtasks.map(subtask => (
                      <div
                        key={subtask.id}
                        className="flex items-center gap-3 p-2 bg-gray-50/50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <button
                          onClick={() => toggleTodo(subtask.id)}
                          className="text-gray-500 hover:text-purple-500 transition-colors duration-200"
                        >
                          {subtask.completed ? (
                            <CheckCircle className="text-green-500" size={20} />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            subtask.completed ? 'text-gray-400 line-through' : 'text-gray-600'
                          }`}
                        >
                          {subtask.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {todos.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              No todos yet. Add one above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;