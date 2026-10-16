import { format, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LastUpdatedProps {
  date: string | Date;
  className?: string;
  prefix?: string;
}

export default function LastUpdated({
  date,
  className,
  prefix = "Last updated on",
}: LastUpdatedProps) {
  let dateObj: Date;
  try {
    dateObj = typeof date === 'string' ? parseISO(date) : date;
  } catch {
    dateObj = new Date();
  }

  const formattedDate = format(dateObj, 'MMMM d, yyyy');
  const isoString = dateObj.toISOString();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      <Calendar className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
      <span>
        {prefix}{' '}
        <time dateTime={isoString} className="font-medium text-foreground/80">
          {formattedDate}
        </time>
      </span>
    </div>
  );
}

