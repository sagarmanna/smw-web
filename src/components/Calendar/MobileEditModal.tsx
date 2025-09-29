"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarEvent } from './ReactBigCalendarWrapper';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface MobileEditModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEvent: CalendarEvent) => void;
  teachers: Array<{ id: number; title: string }>;
  classrooms: Array<{ id: number; title: string }>;
  viewType: 'teacher' | 'classroom';
}

export function MobileEditModal({
  event,
  isOpen,
  onClose,
  onSave,
  teachers,
  classrooms,
  viewType
}: MobileEditModalProps) {
  const [editedEvent, setEditedEvent] = useState<CalendarEvent | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');

  // Initialize form when event changes
  useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
      
      // Format times for input fields (HH:mm format)
      const start = new Date(event.start);
      const end = new Date(event.end);
      setStartTime(format(start, 'HH:mm'));
      setEndTime(format(end, 'HH:mm'));
      
      // Set current teacher/classroom
      setSelectedTeacher(event.resourceId?.toString() || '');
      setSelectedClassroom(event.resourceId?.toString() || '');
    }
  }, [event]);

  const handleSave = () => {
    if (!editedEvent) {
      toast.error('No event selected');
      return;
    }

    // Parse the new times and validate (only for teacher view)
    let newStart = editedEvent.start;
    let newEnd = editedEvent.end;
    
    if (viewType === 'teacher') {
      // Validate time inputs for teacher view
      if (!startTime || !endTime) {
        toast.error('Please select both start and end times');
        return;
      }

      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      
      // Create new start and end dates
      newStart = new Date(editedEvent.start);
      newStart.setHours(startHours, startMinutes, 0, 0);
      
      newEnd = new Date(editedEvent.end);
      newEnd.setHours(endHours, endMinutes, 0, 0);
      
      // Validate times
      if (newStart >= newEnd) {
        toast.error('End time must be after start time');
        return;
      }

      // Validate minimum lesson duration (15 minutes)
      const durationMinutes = (newEnd.getTime() - newStart.getTime()) / (1000 * 60);
      if (durationMinutes < 15) {
        toast.error('Lesson must be at least 15 minutes long');
        return;
      }
    }

    // Validate teacher/classroom selection
    if (viewType === 'teacher' && !selectedTeacher) {
      toast.error('Please select a teacher');
      return;
    }

    if (viewType === 'classroom' && !selectedClassroom) {
      toast.error('Please select a classroom');
      return;
    }

    // Create updated event
    const updatedEvent: CalendarEvent = {
      ...editedEvent,
      start: newStart,
      end: newEnd,
      resourceId: viewType === 'teacher' 
        ? parseInt(selectedTeacher) 
        : parseInt(selectedClassroom)
    };

    onSave(updatedEvent);
    onClose();
  };

  // Generate time options with 15-minute intervals
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[80vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Time Section - Only show in teacher view */}
          {viewType === 'teacher' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-time" className="text-xs">Start Time</Label>
                  <Select value={startTime} onValueChange={setStartTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-xs">End Time</Label>
                  <Select value={endTime} onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateTimeOptions().map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}


          {/* Teacher Selection (Teacher View) */}
          {viewType === 'teacher' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Teacher</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Classroom Selection (Classroom View) */}
          {viewType === 'classroom' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Classroom</Label>
              <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id.toString()}>
                      {classroom.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
