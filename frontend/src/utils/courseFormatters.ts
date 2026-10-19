/**
 * Clean and professional course and instructor formatters for Veyro LMS.
 * Removes test prefixes, audit flags, and raw numeric epoch timestamps
 * while preserving legitimate course and instructor names.
 */

export function formatCourseTitle(title?: string | null): string {
  if (!title) return 'Untitled Curriculum';

  let cleaned = title
    // Remove bracketed test tags: [Live Test], [Live Audit Test], [Test], etc.
    .replace(/^\[(?:live\s+)?(?:audit\s+)?test\]\s*/i, '')
    // Remove internal audit prefixes
    .replace(/^audit\s*-\s*/i, '')
    // Remove epoch / numeric timestamps (6+ consecutive digits)
    .replace(/\b\d{6,}\b/g, '')
    // Clean up trailing dashes, underscores, or multiple spaces
    .replace(/[-_]\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // If title was stripped completely or was just a number
  if (!cleaned || cleaned.length < 2) {
    return title.trim();
  }

  // Capitalize first letter if lowercase (e.g., "python lesson" -> "Python lesson")
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function formatInstructorName(name?: string | null): string {
  if (!name) return 'Faculty Mentor';

  const cleaned = name
    .replace(/^audit\s*instructor/i, 'Academic Faculty')
    .replace(/\b\d{6,}\b/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleaned || 'Faculty Mentor';
}

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'V';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDifficulty(level?: string | null): string {
  if (!level) return 'Intermediate';
  const lower = level.toLowerCase();
  if (lower === 'beginner') return 'Beginner';
  if (lower === 'advanced') return 'Advanced';
  return 'Intermediate';
}
