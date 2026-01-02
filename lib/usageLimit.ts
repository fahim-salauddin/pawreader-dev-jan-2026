const FREE_DAILY_LIMIT = 3;

export function checkUsageLimit(): { canUse: boolean; remaining: number } {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('pawreader_usage');
  
  if (!stored) {
    return { canUse: true, remaining: FREE_DAILY_LIMIT };
  }

  const data = JSON.parse(stored);
  
  // Reset if it's a new day
  if (data.date !== today) {
    localStorage.setItem('pawreader_usage', JSON.stringify({
      date: today,
      count: 0
    }));
    return { canUse: true, remaining: FREE_DAILY_LIMIT };
  }

  const remaining = FREE_DAILY_LIMIT - data.count;
  return { 
    canUse: remaining > 0, 
    remaining: Math.max(0, remaining)
  };
}

export function incrementUsage(): void {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('pawreader_usage');
  
  if (!stored) {
    localStorage.setItem('pawreader_usage', JSON.stringify({
      date: today,
      count: 1
    }));
    return;
  }

  const data = JSON.parse(stored);
  
  if (data.date !== today) {
    localStorage.setItem('pawreader_usage', JSON.stringify({
      date: today,
      count: 1
    }));
  } else {
    data.count += 1;
    localStorage.setItem('pawreader_usage', JSON.stringify(data));
  }
}

export function getRemainingReadings(): number {
  const { remaining } = checkUsageLimit();
  return remaining;
}