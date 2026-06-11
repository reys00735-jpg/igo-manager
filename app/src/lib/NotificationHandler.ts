import * as Notifications from 'expo-notifications';

export const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleDeadlineAlerts = async (deadline: string, title: string) => {
  if (!deadline) return;
  const date = new Date(deadline);
  const dayBefore = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const oneHourBefore = new Date(date.getTime() - 60 * 60 * 1000);

  await Notifications.scheduleNotificationAsync({
    content: { title: 'Recordatorio IGO', body: `${title} vence mañana.` },
    trigger: dayBefore,
  });

  await Notifications.scheduleNotificationAsync({
    content: { title: 'Recordatorio IGO', body: `${title} vence en una hora.` },
    trigger: oneHourBefore,
  });
};

export const scheduleInactivityAlert = async () => {
  const trigger = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Tu plan necesita atención', body: 'Hace 7 días no revisas tus prioridades.' },
    trigger,
  });
};

export const scheduleWeeklySummary = async () => {
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));
  nextMonday.setHours(9, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: { title: 'Resumen semanal IGO', body: 'Revisa tus tareas completadas esta semana.' },
    trigger: nextMonday,
  });
};
