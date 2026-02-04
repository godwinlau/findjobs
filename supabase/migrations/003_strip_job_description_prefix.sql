-- Strip "Job Description" prefix from description fields.
-- This text is redundant since the UI renders its own heading.

-- Clean description_plain: remove leading "Job Description" (with optional whitespace/newlines)
UPDATE jobs
SET description_plain = ltrim(
  regexp_replace(description_plain, '^\s*Job\s+Description\s*', '', 'i')
)
WHERE description_plain ~* '^\s*Job\s+Description';

-- Clean description (HTML): remove <h1-4>Job Description</h1-4> or plain text at start
UPDATE jobs
SET description = regexp_replace(
  description,
  '^\s*(<(h[1-4]|p|div|span)[^>]*>\s*)?Job\s+Description\s*(</(h[1-4]|p|div|span)>\s*)?',
  '',
  'i'
)
WHERE description ~* 'Job\s+Description';
