const { createApp } = Vue;

createApp({

        data() {
            return {
                newTodoText: '',
                todos: [],
                searchQuery: '',
                filterStatus: 'all',
                newTodoDueDate: '',
                upcomingFilter: 'all',
                editingIndex: null, 
                error: null,
            }
        },
        methods: {
            addTodo() {
                this.error = null;
    
                // Validate inputs
                if (!this.newTodoText.trim()) {
                    this.error = 'Please enter a task description';
                    return;
                }
    
                if (!this.newTodoDueDate) {
                    this.error = 'Please select a due date for the task';
                    return;
                }
    
                // Validate due date is not in the past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = new Date(this.newTodoDueDate);
    
                if (dueDate < today) {
                    this.error = 'Due date cannot be in the past';
                    return;
                }
    
                // Add the new todo
                this.todos.push({
                    text: this.newTodoText.trim(),
                    completed: false,
                    dueDate: this.newTodoDueDate,
                    createdAt: new Date().toISOString()
                });
    
                // Reset form
                this.newTodoText = '';
                this.newTodoDueDate = '';
                this.saveTodos();
            },
    
            addDays(date, days) {
                const result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
            },
    
            removeTodo(index) {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.todos.splice(index, 1);
                    this.saveTodos();
                }
            },
    
            editTodo(index) {
                this.editingIndex = index;
                this.$nextTick(() => {
                    this.$refs.editInput[index]?.focus();
                });
            },
    
            cancelEdit() {
                this.editingIndex = null;
            },
    
            saveEdit(index) {
                if (this.todos[index].text.trim() === '') {
                    this.error = 'Task cannot be empty';
                    return;
                }
                this.editingIndex = null;
                this.saveTodos();
            },
    
            saveTodos() {
                try {
                    localStorage.setItem('todos', JSON.stringify(this.todos));
                } 
                catch (error) {
                    console.error('Failed to save todos:', error);
                }
            },
    
            loadTodos() {
                try {
                    const storedTodos = localStorage.getItem('todos');
                    if (storedTodos) {
                        this.todos = JSON.parse(storedTodos);
                    }
                } catch (error) {
                    console.error('Failed to load todos:', error);
                }
            },
    
            formatDate(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            },
    
            isPastDue(dueDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return new Date(dueDate) < today;
            }
        },
    
        computed: {
            filteredTodos() {
                let filtered = this.todos.filter(todo => {
                    return todo.text.toLowerCase().includes(this.searchQuery.toLowerCase());
                });
    
                // Filter by status (active/completed)
                if (this.filterStatus === 'active') {
                    filtered = filtered.filter(todo => !todo.completed);
                } else if (this.filterStatus === 'completed') {
                    filtered = filtered.filter(todo => todo.completed);
                }
    
                // Filter by upcoming dates
                if (this.upcomingFilter !== 'all') {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
    
                    return filtered.filter(todo => {
                        const dueDate = new Date(todo.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
    
                        switch (this.upcomingFilter) {
                            case 'today':
                                return dueDate.toDateString() === today.toDateString();
                            case 'tomorrow':
                                {
                                    const tomorrow = new Date(today);
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    return dueDate.toDateString() === tomorrow.toDateString();
                                }
                            case 'thisWeek':
                                {
                                    const endOfWeek = new Date(today);
                                    endOfWeek.setDate(endOfWeek.getDate() + 7);
                                    return dueDate >= today && dueDate <= endOfWeek;
                                }
                            case 'nextWeek':
                                {
                                    const startNextWeek = new Date(today);
                                    startNextWeek.setDate(startNextWeek.getDate() + 7);
                                    const endNextWeek = new Date(startNextWeek);
                                    endNextWeek.setDate(endNextWeek.getDate() + 7);
                                    return dueDate >= startNextWeek && dueDate <= endNextWeek;
                                }
                            default:
                                return true;
                        }
                    });
                }
    
                return filtered;
            },
    
            sortedTodos() {
                // Sort by due date (earliest first), then by creation date
                return [...this.filteredTodos].sort((a, b) => {
                    const dateA = new Date(a.dueDate);
                    const dateB = new Date(b.dueDate);
                    return dateA - dateB;
                });
            }
        },
    
        mounted() {
            this.loadTodos();
        }
    
}).mount('#app')