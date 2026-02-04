-- Strip redundant heading prefixes from existing job descriptions
-- Matches: Job Description/Summary, Role Description/Summary, Position Description/Summary/Overview,
-- About, About the Role/Position/Job/Company/Opportunity, Summary, Description, Overview,
-- The Role/Opportunity/Company/Position, Who We Are, Company Overview/Profile/Background

UPDATE jobs
  SET description_plain = regexp_replace(
    description_plain,
    '^\s*(?:(?:Job|Role|Position)\s*(?:Description|Summary|Overview)|About\s*(?:the\s*(?:Role|Position|Job|Company|Opportunity))?|Summary|Description|Overview|The\s*(?:Role|Opportunity|Company|Position)|Who\s*We\s*Are|Company\s*(?:Overview|Profile|Background))\s*:?\s*',
    '',
    'i'
  )
  WHERE description_plain ~* '^\s*(?:(?:Job|Role|Position)\s*(?:Description|Summary|Overview)|About\s*(?:the\s*(?:Role|Position|Job|Company|Opportunity))?|Summary|Description|Overview|The\s*(?:Role|Opportunity|Company|Position)|Who\s*We\s*Are|Company\s*(?:Overview|Profile|Background))\s*:?';

-- Same for the HTML description column
UPDATE jobs
  SET description = regexp_replace(
    description,
    '^\s*(?:(?:Job|Role|Position)\s*(?:Description|Summary|Overview)|About\s*(?:the\s*(?:Role|Position|Job|Company|Opportunity))?|Summary|Description|Overview|The\s*(?:Role|Opportunity|Company|Position)|Who\s*We\s*Are|Company\s*(?:Overview|Profile|Background))\s*:?\s*',
    '',
    'i'
  )
  WHERE description ~* '^\s*(?:(?:Job|Role|Position)\s*(?:Description|Summary|Overview)|About\s*(?:the\s*(?:Role|Position|Job|Company|Opportunity))?|Summary|Description|Overview|The\s*(?:Role|Opportunity|Company|Position)|Who\s*We\s*Are|Company\s*(?:Overview|Profile|Background))\s*:?';

-- Fix duplicate heading concatenation: "Our ClientOur client..." → "Our client..."
UPDATE jobs
  SET description_plain = regexp_replace(
    description_plain,
    '^(Our Client|The Company|Who We Are)\s*:?\s*(?=\1)',
    '',
    'i'
  )
  WHERE description_plain ~* '^(Our Client|The Company|Who We Are)\s*:?\s*(Our Client|The Company|Who We Are)';

UPDATE jobs
  SET description = regexp_replace(
    description,
    '^(Our Client|The Company|Who We Are)\s*:?\s*(?=\1)',
    '',
    'i'
  )
  WHERE description ~* '^(Our Client|The Company|Who We Are)\s*:?\s*(Our Client|The Company|Who We Are)';
