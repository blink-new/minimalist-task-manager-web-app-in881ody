import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'

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

interface KanbanBoardProps {
  columns: Column[]
  tasks: Task[]
  subtasks: Subtask[]
  onTaskClick: (task: Task) => void
  onCreateTask: (title: string, columnId: string) => void
}

function DroppableColumn({ 
  column, 
  tasks, 
  subtasks, 
  onTaskClick, 
  onCreateTask 
}: {
  column: Column
  tasks: Task[]
  subtasks: Subtask[]
  onTaskClick: (task: Task) => void
  onCreateTask: (title: string, columnId: string) => void
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  })

  const columnTasks = tasks.filter(task => task.columnId === column.id)

  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-medium text-gray-900">{column.name}</h3>
          <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
            {columnTasks.length}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            const title = prompt('Task title:')
            if (title?.trim()) {
              onCreateTask(title.trim(), column.id)
            }
          }}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className="space-y-3 min-h-[200px]"
      >
        <SortableContext 
          items={columnTasks.map(task => task.id)} 
          strategy={verticalListSortingStrategy}
        >
          {columnTasks.map((task) => {
            const taskSubtasks = subtasks.filter(st => st.taskId === task.id)
            return (
              <TaskCard
                key={task.id}
                task={task}
                subtasks={taskSubtasks}
                onClick={() => onTaskClick(task)}
              />
            )
          })}
        </SortableContext>
      </div>
    </div>
  )
}

export default function KanbanBoard({ 
  columns, 
  tasks, 
  subtasks, 
  onTaskClick, 
  onCreateTask 
}: KanbanBoardProps) {
  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex space-x-6 p-6 h-full">
        {columns.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            tasks={tasks}
            subtasks={subtasks}
            onTaskClick={onTaskClick}
            onCreateTask={onCreateTask}
          />
        ))}
        
        {/* Add Column Button */}
        <div className="flex-shrink-0 w-80">
          <Button
            variant="outline"
            className="w-full h-12 border-dashed border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>
    </div>
  )
}