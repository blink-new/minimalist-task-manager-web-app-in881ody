import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  X, 
  Calendar as CalendarIcon, 
  Tag, 
  Plus,
  Hash
} from 'lucide-react'
import { format } from 'date-fns'
import * as chrono from 'chrono-node'

interface Column {
  id: string
  name: string
  boardId: string
  position: number
  color: string
}

interface QuickAddTaskProps {
  columns: Column[]
  onCreateTask: (title: string, columnId?: string) => void
  onClose: () => void
}

export default function QuickAddTask({ columns, onCreateTask, onClose }: QuickAddTaskProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColumn, setSelectedColumn] = useState<string>(columns[0]?.id || '')
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus on title input when modal opens
    titleInputRef.current?.focus()
  }, [])

  useEffect(() => {
    // Parse natural language dates from title
    if (title) {
      const parsed = chrono.parseDate(title)
      if (parsed && !dueDate) {
        setDueDate(parsed)
      }
    }
  }, [title, dueDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    // Create the task
    onCreateTask(title.trim(), selectedColumn)
    
    // Reset form
    setTitle('')
    setDescription('')
    setDueDate(undefined)
    setTags([])
    setTagInput('')
    
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e as any)
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

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Add Task</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <Input
              ref={titleInputRef}
              placeholder="Task title (try 'Review docs tomorrow 3pm')"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-gray-200 focus:border-gray-400"
              required
            />
            {title && chrono.parseDate(title) && (
              <p className="text-xs text-green-600 mt-1">
                📅 Detected date: {format(chrono.parseDate(title)!, 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-gray-200 focus:border-gray-400 resize-none"
              rows={2}
            />
          </div>

          {/* Column Selection */}
          <div>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger className="border-gray-200 focus:border-gray-400">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column.id} value={column.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <span>{column.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
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

          {/* Tags */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex-1 flex items-center space-x-1 border border-gray-200 rounded-md px-3 py-2">
                <Hash className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Add tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
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

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">⌘ + Enter</kbd> to save
            </p>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white"
                disabled={!title.trim()}
              >
                Create Task
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}