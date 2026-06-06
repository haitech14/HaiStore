import { Calendar, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatLeadTaskDueLabel, newLeadTask } from '@/lib/crm-lead-tasks';
import { cn } from '@/lib/utils';
import type { CrmLeadTask } from '@/types/crm-lead-form';

interface CrmLeadTasksFieldProps {
  tasks: CrmLeadTask[];
  onChange: (tasks: CrmLeadTask[]) => void;
}

export function CrmLeadTasksField({ tasks, onChange }: CrmLeadTasksFieldProps) {
  const updateTask = (id: string, patch: Partial<CrmLeadTask>, removeDueDate = false) => {
    onChange(
      tasks.map((task) => {
        if (task.id !== id) return task;
        if (removeDueDate) {
          const { dueDate: _removed, ...rest } = task;
          return { ...rest, ...patch };
        }
        return { ...task, ...patch };
      }),
    );
  };

  const removeTask = (id: string) => {
    onChange(tasks.filter((task) => task.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium text-foreground">Tareas de seguimiento</Label>
        <span className="text-[0.65rem] tabular-nums text-muted-foreground">
          {tasks.filter((task) => !task.done).length} pendiente
          {tasks.filter((task) => !task.done).length === 1 ? '' : 's'}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
          Añade tareas para planificar llamadas, cotizaciones o recordatorios.
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const dueLabel = formatLeadTaskDueLabel(task.dueDate);
            return (
              <li
                key={task.id}
                className="rounded-lg border border-border bg-muted/20 p-2.5"
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    id={`crm-task-done-${task.id}`}
                    checked={task.done}
                    onCheckedChange={(checked) =>
                      updateTask(task.id, { done: checked === true })
                    }
                    aria-label={`Marcar tarea ${task.title} como completada`}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Input
                      value={task.title}
                      onChange={(event) => updateTask(task.id, { title: event.target.value })}
                      placeholder="Descripción de la tarea"
                      aria-label="Descripción de la tarea"
                      className={cn('h-9', task.done && 'text-muted-foreground line-through')}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative min-w-[9rem] flex-1">
                        <Calendar
                          className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          type="date"
                          value={task.dueDate ?? ''}
                          onChange={(event) => {
                            const dueDate = event.target.value.trim();
                            if (dueDate) {
                              updateTask(task.id, { dueDate });
                              return;
                            }
                            updateTask(task.id, {}, true);
                          }}
                          aria-label="Fecha límite de la tarea"
                          className="h-9 pl-8"
                        />
                      </div>
                      {dueLabel ? (
                        <span
                          className={cn(
                            'text-[0.65rem] font-medium',
                            dueLabel === 'Vencida' ? 'text-destructive' : 'text-muted-foreground',
                          )}
                        >
                          {dueLabel}
                        </span>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeTask(task.id)}
                        aria-label={`Eliminar tarea ${task.title || 'sin título'}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        type="button"
        variant="link"
        className="h-auto gap-1 p-0 text-emerald-700 hover:text-emerald-800"
        onClick={() => onChange([...tasks, newLeadTask()])}
      >
        <Plus className="size-4" aria-hidden="true" />
        Añadir tarea
      </Button>
    </div>
  );
}
