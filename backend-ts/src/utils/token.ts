export const generateToken = (ip: string): string => {
  const chars = 'qweruiopasdfghj1234ty7890klzxcvbnm12347890QWERUIOPASDFGHJKLZXCVBNM';
  const randomString = Array.from(chars)
    .sort(() => Math.random() - 0.5)
    .join('')
    .slice(0, 10);
  
  const cleanIp = ip.replace(/[:.]/g, '').replace('ffff', '');
  
  return `${randomString}ty${cleanIp}`;
};

export const generateId = (): string => {
  const chars = 'qweruiopasdfghj1234ty7890klzxcvbnm12347890QWERUIOPASDFGHJKLZXCVBNM';
  return Array.from(chars)
    .sort(() => Math.random() - 0.5)
    .join('')
    .slice(0, 36);
};