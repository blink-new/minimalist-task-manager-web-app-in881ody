import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Calendar, 
  CheckSquare, 
  Tag, 
  MoreHorizontal,
  Clock
} from 'lucide-react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'

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

interface Column {
  id: string
  name: string
  boardId: string
  position: number
  color: string
}

interface Subtask {
  id: string
  title: string
  taskId: string
  completed: boolean
  position: number
}

interface ListViewProps {
  tasks: Task[]
  columns: Column[]
  subtasks: Subtask[]
  onTaskClick: (task: Task) => void
}

export default function ListView({ tasks, columns, subtasks, onTaskClick }: ListViewProps) {
  const getColumnName = (columnId: string) => {
    return columns.find(col => col.id === columnId)?.name || 'Unknown'
  }

  const getColumnColor = (columnId: string) => {
    return columns.find(col => col.id === columnId)?.color || '#6b7280'
  }

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d, yyyy')
  }

  const getDueDateColor = (dateString: string) => {
    const date = new Date(dateString)
    if (isPast(date) && !isToday(date)) return 'text-red-600'
    if (isToday(date)) return 'text-orange-600'
    return 'text-gray-600'
  }

  const getSubtaskProgress = (taskId: string) => {
    const taskSubtasks = subtasks.filter(st => st.taskId === taskId)
    const completed = taskSubtasks.filter(st => Number(st.completed) > 0).length
    return { completed, total: taskSubtasks.length }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-6">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 pb-3 mb-4 border-b border-gray-200 text-sm font-medium text-gray-500">
          <div className="col-span-1">
            <Checkbox disabled />
          </div>
          <div className="col-span-4">Task</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-2">Progress</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Task Rows */}
        <div className="space-y-2">
          {tasks.map((task) => {
            const progress = getSubtaskProgress(task.id)
            const columnColor = getColumnColor(task.columnId)
            
            return (
              <div
                key={task.id}
                className="grid grid-cols-12 gap-4 py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => onTaskClick(task)}
              >
                {/* Checkbox */}
                <div className="col-span-1 flex items-center">
                  <Checkbox 
                    checked={Number(task.completed) > 0}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Task Info */}
                <div className="col-span-4 min-w-0">
                  <div className="flex flex-col">
                    <h4 className="font-medium text-gray-900 truncate">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {task.description}
                      </p>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.slice(0, 2).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: columnColor }}
                    />
                    <span className="text-sm text-gray-700">
                      {getColumnName(task.columnId)}
                    </span>
                  </div>
                </div>

                {/* Due Date */}
                <div className="col-span-2 flex items-center">
                  {task.dueDate ? (
                    <div className={`flex items-center space-x-1 text-sm ${getDueDateColor(task.dueDate)}`}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDueDate(task.dueDate)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No due date</span>
                  )}
                </div>

                {/* Progress */}
                <div className="col-span-2 flex items-center">
                  {progress.total > 0 ? (
                    <div className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4 text-gray-400" />
                      <span className={`text-sm ${progress.completed === progress.total ? 'text-green-600' : 'text-gray-600'}`}>
                        {progress.completed}/{progress.total}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No subtasks</span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle actions menu
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <CheckSquare className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-gray-600">Create your first task to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}