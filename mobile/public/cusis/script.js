const form = document.querySelector('#cusis-form');
const status = document.querySelector('#status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  status.textContent = 'Preparing your calendar…';
  try {
    const response = await fetch('/api/v2/cusis/calendar', {
      method: 'POST',
      body: new FormData(form),
      credentials: 'include',
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error?.message || 'Unable to create calendar');
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(await response.blob());
    link.download = 'cuhktimetable.ics';
    link.click();
    URL.revokeObjectURL(link.href);
    status.textContent = 'Calendar downloaded.';
    form.reset();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Unable to create calendar';
  } finally {
    button.disabled = false;
  }
});
