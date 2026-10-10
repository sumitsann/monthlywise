// Private group links stop working this many days after the group is created.
export const GROUP_LINK_LIFETIME_DAYS = 15;

const dayMs = 24 * 60 * 60 * 1000;

export function getGroupLinkExpiry(createdAt: string | Date) {
  return new Date(
    new Date(createdAt).getTime() + GROUP_LINK_LIFETIME_DAYS * dayMs,
  );
}

export function isGroupLinkExpired(createdAt: string | Date, now = Date.now()) {
  return getGroupLinkExpiry(createdAt).getTime() <= now;
}

// Whole days left before the link expires, rounded up (0 once expired).
export function getGroupLinkDaysLeft(createdAt: string | Date, now = Date.now()) {
  return Math.max(
    0,
    Math.ceil((getGroupLinkExpiry(createdAt).getTime() - now) / dayMs),
  );
}
