/**
 * Deadline Calculation Utilities
 * Calculates filing deadlines based on Companies House rules
 */

import { Deadline } from "@/lib/types";

/**
 * Calculate days remaining until a deadline
 */
export function calculateDaysRemaining(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(dueDate);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Determine urgency level based on days remaining
 */
export function getUrgencyLevel(daysRemaining: number): "critical" | "urgent" | "normal" {
  if (daysRemaining < 14) {
    return "critical";
  } else if (daysRemaining < 30) {
    return "urgent";
  }
  return "normal";
}

/**
 * Get color for urgency level
 */
export function getUrgencyColor(urgency: "critical" | "urgent" | "normal"): string {
  switch (urgency) {
    case "critical":
      return "#EF4444"; // Red
    case "urgent":
      return "#F59E0B"; // Amber
    case "normal":
      return "#22C55E"; // Green
  }
}

/**
 * Create a deadline object from company data
 */
export function createDeadline(
  companyId: string,
  companyName: string,
  type: "accounts" | "confirmation_statement",
  dueDate: string | null
): Deadline | null {
  if (!dueDate) {
    return null;
  }

  const daysRemaining = calculateDaysRemaining(dueDate);
  const urgency = getUrgencyLevel(daysRemaining);
  const overdue = daysRemaining < 0;

  return {
    companyId,
    companyName,
    type,
    dueDate,
    daysRemaining: Math.abs(daysRemaining),
    overdue,
    urgency,
  };
}

/**
 * Get all deadlines for a company
 */
export function getCompanyDeadlines(
  companyId: string,
  companyName: string,
  nextAccountsDueDate: string | null,
  confirmationStatementNextDueDate: string | null
): Deadline[] {
  const deadlines: Deadline[] = [];

  const accountsDeadline = createDeadline(
    companyId,
    companyName,
    "accounts",
    nextAccountsDueDate
  );
  if (accountsDeadline) {
    deadlines.push(accountsDeadline);
  }

  const confirmationDeadline = createDeadline(
    companyId,
    companyName,
    "confirmation_statement",
    confirmationStatementNextDueDate
  );
  if (confirmationDeadline) {
    deadlines.push(confirmationDeadline);
  }

  return deadlines;
}

/**
 * Get the next upcoming deadline from a list of deadlines
 */
export function getNextDeadline(deadlines: Deadline[]): Deadline | null {
  if (deadlines.length === 0) {
    return null;
  }

  // Sort by due date (earliest first)
  return deadlines.reduce((earliest, current) => {
    const earliestDate = new Date(earliest.dueDate);
    const currentDate = new Date(current.dueDate);
    return currentDate < earliestDate ? current : earliest;
  });
}

/**
 * Format deadline type for display
 */
export function formatDeadlineType(type: "accounts" | "confirmation_statement"): string {
  return type === "accounts" ? "Annual Accounts" : "Confirmation Statement";
}

/**
 * Format days remaining for display
 */
export function formatDaysRemaining(daysRemaining: number, overdue: boolean): string {
  if (overdue) {
    return `Overdue by ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`;
  }
  if (daysRemaining === 0) {
    return "Due today";
  }
  if (daysRemaining === 1) {
    return "Due tomorrow";
  }
  return `Due in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`;
}

/**
 * Format date for display (e.g., "15 Mar 2025")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("en-GB", options);
}
