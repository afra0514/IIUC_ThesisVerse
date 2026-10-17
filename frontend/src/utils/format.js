

export function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.max(0, Date.now() - ts);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDateTime(ts);
}

export function formatDateTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getFirstName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const honorifics = /^(dr|prof|professor|mr|mrs|ms|engr)\.?$/i;
  const first = parts.find((p) => !honorifics.test(p));
  return first || parts[0] || 'User';
}

export function deptLabel(code) {
  return code === 'EEE' ? 'Dept. of EEE' : 'Dept. of CSE';
}

export function deptCode(label = '') {
  return /EEE/i.test(label) ? 'EEE' : 'CSE';
}
