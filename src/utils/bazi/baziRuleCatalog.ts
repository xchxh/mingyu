import { BASE_USEFUL_GOD_RULES } from './baziUsefulGodRules'
import { CLIMATE_RULES, STRENGTH_HINT_RULES, THERAPEUTIC_PRIORITY_RULES } from './baziTherapeuticRules'

export interface RuleMetadata {
  id: string;
  label: string;
  description: string;
}

const RULE_CATALOG = [
  ...BASE_USEFUL_GOD_RULES,
  ...CLIMATE_RULES,
  ...STRENGTH_HINT_RULES,
  ...THERAPEUTIC_PRIORITY_RULES
].reduce<Record<string, RuleMetadata>>((catalog, rule) => {
  catalog[rule.id] = {
    id: rule.id,
    label: rule.label,
    description: rule.description
  }
  return catalog
}, {})

export function resolveRuleMetadata(ruleId: string): RuleMetadata | null {
  return RULE_CATALOG[ruleId] || null
}

export function resolveRuleMetadataList(ruleIds: string[]): RuleMetadata[] {
  return ruleIds
    .map(ruleId => resolveRuleMetadata(ruleId))
    .filter((rule): rule is RuleMetadata => Boolean(rule))
}
