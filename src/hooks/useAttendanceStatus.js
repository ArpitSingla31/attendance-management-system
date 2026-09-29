import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { haryanaHolidays2026 } from '../data/haryanaHolidays2026';

function dateInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
}

function rosterDayForTime(now, timeZone, startTime, endTime) {
  const parts = dateInZone(now, timeZone);
  let date = `${parts.year}-${parts.month}-${parts.day}`;
  let weekdayIndex = new Date(`${date}T00:00:00Z`).getUTCDay();
  const clock = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  const [hour, minute] = clock.split(':').map(Number);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  if (endHour * 60 + endMinute <= startHour * 60 + startMinute && hour * 60 + minute <= endHour * 60 + endMinute) {
    const previous = new Date(`${date}T00:00:00Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    date = previous.toISOString().slice(0, 10);
    weekdayIndex = (weekdayIndex + 6) % 7;
  }
  return { date, weekdayIndex };
}

function getShiftStatus(now, timeZone, startTime, endTime, graceMinutes) {
  if (!startTime || !endTime) return null;
  const currentTime = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  const [hour, minute] = currentTime.split(':').map(Number);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const current = hour * 60 + minute;
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;
  const overnight = end <= start;
  if (!overnight && current < start) return 'Before shift';
  if (!overnight && current >= end) return 'After shift';
  if (overnight && current > end && current < start) return 'Before shift';
  const elapsed = overnight ? (current >= start ? current - start : 1440 - start + current) : current - start;
  if (elapsed <= 0) return 'On time';
  if (elapsed <= graceMinutes) return 'Slightly late';
  return 'Late';
}

export function useAttendanceStatus() {
  const { apiRequest } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [schedule, setSchedule] = useState(null);
  const [closedDates, setClosedDates] = useState(() => new Set(haryanaHolidays2026.map((holiday) => holiday.date)));

  const refresh = useCallback(async () => {
    try {
      const data = await apiRequest('/attendance');
      const parts = dateInZone(new Date(), data.timeZone || 'Asia/Kolkata');
      const workDate = `${parts.year}-${parts.month}-${parts.day}`;
      setSchedule({
        workDate,
        timeZone: data.timeZone || 'Asia/Kolkata',
        start: data.shiftStartTime || '09:30',
        end: data.shiftEndTime || '18:00',
        workDays: data.workDays || [1, 2, 3, 4, 5],
        graceMinutes: data.graceMinutes ?? 15,
        punchedStatus: (data.active || data.today)?.punctualityStatus || null,
        today: data.today || null,
        active: data.active || null,
        hasOpenPunch: Boolean(data.active?.checkInAt)
      });
    } catch { setSchedule(null); }
  }, [apiRequest]);

  useEffect(() => {
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    refresh();
    const attendance = window.setInterval(refresh, 30000);
    const refreshOnPunch = () => refresh();
    window.addEventListener('attendance-updated', refreshOnPunch);
    apiRequest('/holidays').then((data) => setClosedDates(new Set([
      ...haryanaHolidays2026.map((holiday) => holiday.date),
      ...(data.holidays || []).map((holiday) => holiday.date)
    ]))).catch(() => {});
    return () => { window.clearInterval(clock); window.clearInterval(attendance); window.removeEventListener('attendance-updated', refreshOnPunch); };
  }, [apiRequest, refresh]);

  const liveStatus = schedule ? getShiftStatus(now, schedule.timeZone, schedule.start, schedule.end, schedule.graceMinutes) : null;
  const rosterDay = schedule ? rosterDayForTime(now, schedule.timeZone, schedule.start, schedule.end) : null;
  const officeClosed = !schedule?.workDays?.includes(rosterDay?.weekdayIndex) || closedDates.has(rosterDay?.date);
  const status = officeClosed
    ? 'Office closed'
    : liveStatus === 'After shift' && schedule?.hasOpenPunch
      ? 'Overtime'
      : ['Before shift', 'After shift'].includes(liveStatus)
        ? liveStatus
        : (schedule?.punchedStatus || liveStatus);
  const color = status === 'Late' ? '#E11D48' : status === 'Slightly late' ? '#D97706' : status === 'On time' ? '#16A34A' : status === 'Overtime' ? '#7C3AED' : '#94A3B8';
  return {
    now,
    timeZone: schedule?.timeZone || 'Asia/Kolkata',
    today: schedule?.active || schedule?.today || null,
    isReady: Boolean(schedule),
    refresh,
    status,
    color
  };
}
