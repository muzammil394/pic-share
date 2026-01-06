export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@gmail.com')
    .split(',')
    .map(email => email.trim().toLowerCase());

export const isAdmin = (email: string): boolean => {
    return ADMIN_EMAILS.includes(email.toLowerCase());
};