import { useState, useEffect, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Settings, 
  LogOut,
  Calendar,
  Tag,
  MoreHorizontal
} from 'lucide-react'
import { blink } from '@/blink/client'
import { toast } from '@/hooks/use-toast'
import KanbanBoard from './kanban/KanbanBoard'
import ListView from './kanban/ListView'
import TaskDetailDrawer from './kanban/TaskDetailDrawer'
import QuickAddTask from './kanban/QuickAddTask'

interface User {
  id: string
  email: string
  displayName?: string
}

interface Board {
  id: string
  name: string
  description?: string
  userId: string
  isShared: boolean
  isArchived: boolean
}

interface Column {
  id: string
  name: string
  boardId: string
  position: number
  color: string
}

interface Task {
  id: string
  title: string
  description?: string
  columnId: string
  boardId: string
  userId: string
  position: number
  dueDate?: string
  completed: boolean
  tags?: string[]
  createdAt: string
  updatedAt: string
}

interface Subtask {
  id: string
  title: string
  taskId: string
  completed: boolean
  position: number
}

export default function TaskManager() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [boards, setBoards] = useState<Board[]>([])
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (state.user) {
        setUser({
          id: state.user.id,
          email: state.user.email,
          displayName: state.user.displayName
        })
      } else {
        setUser(null)
      }
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Initialize user's default board
  const initializeUserBoard = useCallback(async (userId: string) => {
    try {
      // Check if user has any boards
      const userBoards = await blink.db.boards.list({
        where: { userId },
        orderBy: { createdAt: 'asc' }
      })

      if (userBoards.length === 0) {
        // Create default board for new user
        const boardId = `board_${Date.now()}`
        await blink.db.boards.create({
          id: boardId,
          name: 'My Tasks',
          description: 'Your personal task board',
          userId,
          isShared: false,
          isArchived: false
        })

        // Create default columns
        const defaultColumns = [
          { id: `col_${Date.now()}_1`, name: 'To Do', position: 0, color: '#ef4444' },
          { id: `col_${Date.now()}_2`, name: 'In Progress', position: 1, color: '#f59e0b' },
          { id: `col_${Date.now()}_3`, name: 'Done', position: 2, color: '#10b981' }
        ]

        for (const col of defaultColumns) {
          await blink.db.columns.create({
            ...col,
            boardId
          })
        }

        // Refresh boards list
        const updatedBoards = await blink.db.boards.list({
          where: { userId },
          orderBy: { createdAt: 'asc' }
        })
        setBoards(updatedBoards)
        setCurrentBoard(updatedBoards[0])
      } else {
        setBoards(userBoards)
        setCurrentBoard(userBoards[0])
      }
    } catch (error) {
      console.error('Error initializing user board:', error)
      toast({
        title: "Setup Error",
        description: "Failed to initialize your workspace",
        variant: "destructive"
      })
    }
  }, [])

  const loadBoardData = async (boardId: string) => {
    try {
      const [boardColumns, boardTasks, allSubtasks] = await Promise.all([
        blink.db.columns.list({
          where: { boardId },
          orderBy: { position: 'asc' }
        }),
        blink.db.tasks.list({
          where: { boardId },
          orderBy: { position: 'asc' }
        }),
        blink.db.subtasks.list({
          orderBy: { position: 'asc' }
        })
      ])

      setColumns(boardColumns)
      setTasks(boardTasks.map(task => ({
        ...task,
        tags: task.tags ? JSON.parse(task.tags) : []
      })))
      setSubtasks(allSubtasks)
    } catch (error) {
      console.error('Error loading board data:', error)
      toast({
        title: "Loading Error",
        description: "Failed to load board data",
        variant: "destructive"
      })
    }
  }

  // Load data when user changes
  useEffect(() => {
    if (user) {
      initializeUserBoard(user.id)
    }
  }, [user, initializeUserBoard])

  // Load board data
  useEffect(() => {
    if (currentBoard) {
      loadBoardData(currentBoard.id)
    }
  }, [currentBoard])

  const handleSignOut = async () => {
    try {
      await blink.auth.logout()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active task
    const activeTask = tasks.find(task => task.id === activeId)
    if (!activeTask) return

    // Find the column we're over
    const overColumn = columns.find(col => col.id === overId) || 
                      columns.find(col => tasks.find(task => task.id === overId)?.columnId === col.id)
    
    if (!overColumn || activeTask.columnId === overColumn.id) return

    // Update task column optimistically
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === activeId 
          ? { ...task, columnId: overColumn.id }
          : task
      )
    )
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = tasks.find(task => task.id === activeId)
    if (!activeTask) return

    try {
      // Update task in database
      await blink.db.tasks.update(activeId, {
        columnId: activeTask.columnId,
        updatedAt: new Date().toISOString()
      })

      // Reload board data to ensure consistency
      if (currentBoard) {
        loadBoardData(currentBoard.id)
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Update Error",
        description: "Failed to move task",
        variant: "destructive"
      })
      // Reload to revert optimistic update
      if (currentBoard) {
        loadBoardData(currentBoard.id)
      }
    }
  }

  const createTask = async (title: string, columnId?: string) => {
    if (!user || !currentBoard) return

    const targetColumnId = columnId || columns[0]?.id
    if (!targetColumnId) return

    try {
      const taskId = `task_${Date.now()}`
      const newTask = {
        id: taskId,
        title,
        columnId: targetColumnId,
        boardId: currentBoard.id,
        userId: user.id,
        position: tasks.filter(t => t.columnId === targetColumnId).length,
        completed: false,
        tags: '[]'
      }

      await blink.db.tasks.create(newTask)
      
      // Reload board data
      loadBoardData(currentBoard.id)
      
      toast({
        title: "Task created",
        description: `"${title}" has been added to your board`
      })
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Creation Error",
        description: "Failed to create task",
        variant: "destructive"
      })
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Quick add with "/" key
      if (e.key === '/' && !showQuickAdd) {
        e.preventDefault()
        setShowQuickAdd(true)
      }
      // Escape to close quick add
      if (e.key === 'Escape' && showQuickAdd) {
        setShowQuickAdd(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showQuickAdd])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // This should not happen due to authRequired
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-900 text-white text-sm">
                {user.displayName?.[0] || user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Boards List */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">Boards</h2>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => setCurrentBoard(board)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  currentBoard?.id === board.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {board.name}
              </button>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              Shared with me
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
              Archived
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentBoard?.name || 'My Tasks'}
              </h1>
              <Badge variant="secondary" className="text-xs">
                {filteredTasks.length} tasks
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 border-gray-200 focus:border-gray-400"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'board' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('board')}
                  className="h-7 px-3"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="h-7 px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Add */}
              <Button
                onClick={() => setShowQuickAdd(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </div>
        </div>

        {/* Board Content */}
        <div className="flex-1 overflow-hidden">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {viewMode === 'board' ? (
              <KanbanBoard
                columns={columns}
                tasks={filteredTasks}
                subtasks={subtasks}
                onTaskClick={setSelectedTask}
                onCreateTask={createTask}
              />
            ) : (
              <ListView
                tasks={filteredTasks}
                columns={columns}
                subtasks={subtasks}
                onTaskClick={setSelectedTask}
              />
            )}
          </DndContext>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddTask
          columns={columns}
          onCreateTask={createTask}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {/* Task Detail Drawer */}
      {selectedTask && (
        <TaskDetailDrawer
          task={selectedTask}
          subtasks={subtasks.filter(st => st.taskId === selectedTask.id)}
          columns={columns}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            if (currentBoard) {
              loadBoardData(currentBoard.id)
            }
          }}
        />
      )}
    </div>
  )
}