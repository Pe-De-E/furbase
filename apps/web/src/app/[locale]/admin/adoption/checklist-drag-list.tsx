'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { reorderChecklistItems } from './actions'
import DeleteButton from './delete-button'

type Item = {
  id: string
  textDe: string
  textEn: string
}

function SortableRow({ item, index }: { item: Item; index: number }) {
  const t = useTranslations('AdminAdoption')
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="checklist-item"
      className="flex items-center gap-3 bg-card border border-border rounded-2xl px-4 py-3"
    >
      <Button
        {...attributes}
        {...listeners}
        variant="ghost"
        size="icon-xs"
        className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </Button>
      <span className="text-xs text-muted-foreground w-5 shrink-0">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{item.textDe}</p>
        <p className="text-xs text-muted-foreground truncate">{item.textEn}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          render={<Link href={`/admin/adoption/${item.id}`} />}
          nativeButton={false}
          variant="ghost"
          size="xs"
        >
          {t('edit')}
        </Button>
        <DeleteButton id={item.id} text={item.textDe} />
      </div>
    </div>
  )
}

export default function ChecklistDragList({ items: initialItems }: { items: Item[] }) {
  const [items, setItems] = useState(initialItems)

  // Re-sync when the server re-renders with fresh data (e.g. after an item
  // is added/edited/deleted elsewhere) — useState's initializer only runs
  // once on mount, so without this the list would go stale after those
  // actions revalidate the page. Adjusting state during render (rather than
  // in an effect) avoids an extra cascading render pass.
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems)
  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems)
    setItems(initialItems)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next)
    reorderChecklistItems(next.map((i) => i.id))
  }

  return (
    <DndContext
      id="adoption-checklist"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <SortableRow key={item.id} item={item} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
