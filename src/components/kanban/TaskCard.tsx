import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  CheckSquare, 
  GripVertical, 
  Tag, 
  Clock,
  MoreHorizontal 
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

interface Subtask {
  id: string
  title: string
  taskId: string
  completed: boolean
  position: number
}

interface TaskCardProps {
  task: Task
  subtasks: Subtask[]
  onClick: () => void
}

export default function TaskCard({ task, subtasks, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const completedSubtasks = subtasks.filter(st => Number(st.completed) > 0).length
  const totalSubtasks = subtasks.length

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  const getDueDateColor = (dateString: string) => {
    const date = new Date(dateString)
    if (isPast(date) && !isToday(date)) return 'text-red-600 bg-red-50'
    if (isToday(date)) return 'text-orange-600 bg-orange-50'
    return 'text-gray-600 bg-gray-50'
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md group ${
        isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Task Title */}
        <h4 className="font-medium text-gray-900 mb-2 pr-6 leading-tight">
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {/* Subtasks Progress */}
            {totalSubtasks > 0 && (
              <div className="flex items-center space-x-1">
                <CheckSquare className="h-3 w-3" />
                <span className={completedSubtasks === totalSubtasks ? 'text-green-600' : ''}>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getDueDateColor(task.dueDate)}`}>
                <Calendar className="h-3 w-3" />
                <span className="font-medium">
                  {formatDueDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation()
                // Handle quick actions menu
              }}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}