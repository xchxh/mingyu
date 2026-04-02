export interface RuleMatchContext {
  strengthStatus?: string;
  monthBranch?: string;
  dayMaster?: string;
  pattern?: string;
}

export interface MatchableRule {
  id: string;
  priority?: number;
  strengths?: string[];
  months?: string[];
  dayMasters?: string[];
  patterns?: string[];
}

function includesOrWildcard(values: string[] | undefined, target: string | undefined): boolean {
  if (!values || values.length === 0) {
    return true
  }

  if (!target) {
    return false
  }

  return values.includes(target)
}

export function matchesRule<T extends MatchableRule>(rule: T, context: RuleMatchContext): boolean {
  return includesOrWildcard(rule.strengths, context.strengthStatus) &&
    includesOrWildcard(rule.months, context.monthBranch) &&
    includesOrWildcard(rule.dayMasters, context.dayMaster) &&
    includesOrWildcard(rule.patterns, context.pattern)
}

export function matchFirstRule<T extends MatchableRule>(rules: T[], context: RuleMatchContext): T | undefined {
  return [...rules]
    .sort((left, right) => (right.priority || 0) - (left.priority || 0))
    .find(rule => matchesRule(rule, context))
}
