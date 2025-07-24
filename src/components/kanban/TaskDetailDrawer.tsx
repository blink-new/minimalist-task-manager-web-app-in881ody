import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  X, 
  Calendar as CalendarIcon, 
  Tag, 
  Plus,
  Trash2,
  Edit3,
  Check,
  Hash
} from 'lucide-react'
import { format } from 'date-fns'
import { blink } from '@/blink/client'
import { toast } from '@/hooks/use-toast'

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

interface Column {
  id: string
  name: string
  boardId: string
  position: number
  color: string
}

interface TaskDetailDrawerProps {
  task: Task
  subtasks: Subtask[]
  columns: Column[]
  onClose: () => void
  onUpdate: () => void
}

export default function TaskDetailDrawer({ 
  task, 
  subtasks, 
  columns, 
  onClose, 
  onUpdate 
}: TaskDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  )
  const [tags, setTags] = useState<string[]>(task.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)

  const currentColumn = columns.find(col => col.id === task.columnId)

  const handleSave = async () => {
    try {
      await blink.db.tasks.update(task.id, {
        title,
        description: description || null,
        dueDate: dueDate?.toISOString() || null,
        tags: JSON.stringify(tags),
        updatedAt: new Date().toISOString()
      })

      setIsEditing(false)
      onUpdate()
      toast({
        title: "Task updated",
        description: "Your changes have been saved"
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Update failed",
        description: "Failed to save changes",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await blink.db.tasks.delete(task.id)
      onUpdate()
      onClose()
      toast({
        title: "Task deleted",
        description: "The task has been removed"
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Delete failed",
        description: "Failed to delete task",
        variant: "destructive"
      })
    }
  }

  const toggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      await blink.db.subtasks.update(subtaskId, {
        completed: completed ? 1 : 0
      })
      onUpdate()
    } catch (error) {
      console.error('Error updating subtask:', error)
      toast({
        title: "Update failed",
        description: "Failed to update subtask",
        variant: "destructive"
      })
    }
  }

  const addSubtask = async () => {
    if (!newSubtaskTitle.trim()) return

    try {
      const subtaskId = `subtask_${Date.now()}`
      await blink.db.subtasks.create({
        id: subtaskId,
        title: newSubtaskTitle.trim(),
        taskId: task.id,
        completed: false,
        position: subtasks.length
      })

      setNewSubtaskTitle('')
      onUpdate()
      toast({
        title: "Subtask added",
        description: "New subtask has been created"
      })
    } catch (error) {
      console.error('Error creating subtask:', error)
      toast({
        title: "Creation failed",
        description: "Failed to create subtask",
        variant: "destructive"
      })
    }
  }

  const deleteSubtask = async (subtaskId: string) => {
    try {
      await blink.db.subtasks.delete(subtaskId)
      onUpdate()
      toast({
        title: "Subtask deleted",
        description: "Subtask has been removed"
      })
    } catch (error) {
      console.error('Error deleting subtask:', error)
      toast({
        title: "Delete failed",
        description: "Failed to delete subtask",
        variant: "destructive"
      })
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Title */}
        <div>
          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-gray-200 focus:border-gray-400"
              placeholder="Task title"
            />
          ) : (
            <h1 className="text-lg font-semibold text-gray-900">{task.title}</h1>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentColumn?.color }}
          />
          <span className="text-sm text-gray-600">
            {currentColumn?.name || 'Unknown Status'}
          </span>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
          {isEditing ? (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="border-gray-200 focus:border-gray-400 resize-none"
              rows={3}
            />
          ) : (
            <p className="text-sm text-gray-600">
              {task.description || 'No description'}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Due Date</h3>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal border-gray-200"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'MMM d, yyyy') : 'Set due date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date)
                      setShowCalendar(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dueDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDueDate(undefined)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
            </p>
          )}
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center space-x-1 border border-gray-200 rounded-md px-3 py-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    className="border-0 p-0 focus:ring-0 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-gray-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {task.tags && task.tags.length > 0 ? (
                task.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700"
                  >
                    {tag}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-600">No tags</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Subtasks */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Subtasks ({subtasks.filter(st => Number(st.completed) > 0).length}/{subtasks.length})
          </h3>
          
          <div className="space-y-2">
            {subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center space-x-2 group">
                <Checkbox
                  checked={Number(subtask.completed) > 0}
                  onCheckedChange={(checked) => toggleSubtask(subtask.id, checked as boolean)}
                />
                <span className={`flex-1 text-sm ${
                  Number(subtask.completed) > 0 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-900'
                }`}>
                  {subtask.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSubtask(subtask.id)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add Subtask */}
          <div className="flex items-center space-x-2 mt-3">
            <Input
              placeholder="Add subtask"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSubtask()
                }
              }}
              className="flex-1 text-sm border-gray-200 focus:border-gray-400"
            />
            <Button
              size="sm"
              onClick={addSubtask}
              disabled={!newSubtaskTitle.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Activity Log */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Activity</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Created {format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}</p>
            {task.updatedAt !== task.createdAt && (
              <p>Updated {format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handleDelete}
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Task
        </Button>
      </div>
    </div>
  )
}