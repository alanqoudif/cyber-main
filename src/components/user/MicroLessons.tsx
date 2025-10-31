import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react'

export interface MicroLesson {
  id: string
  slug: string
  title: string
  description?: string | null
  duration?: number | null
  completed?: boolean
}

interface MicroLessonsProps {
  lessons: MicroLesson[]
}

export function MicroLessons({ lessons }: MicroLessonsProps) {
  if (!lessons || lessons.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-8 w-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">No micro lessons assigned yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Micro Lessons</CardTitle>
        <Link href="/learn" className="text-xs text-accent hover:underline">
          Browse all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{lesson.title}</p>
                {lesson.completed && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </div>
              {lesson.description && (
                <p className="text-xs text-muted line-clamp-2 mt-1">{lesson.description}</p>
              )}
              {lesson.duration && (
                <p className="text-[11px] text-muted mt-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {lesson.duration} min
                </p>
              )}
            </div>
            <Link href={`/learn/${lesson.slug}`}>
              <Button variant="outline" className="text-xs">
                Continue
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
