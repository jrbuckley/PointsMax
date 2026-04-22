import type { RewardBalance, RewardProgramId } from "../types/models";

export type ProgramCatalogItem = {
  id: RewardProgramId;
  label: string;
};

export const PROGRAM_CATALOG: ProgramCatalogItem[] = [
  { id: "AMEX_MR", label: "Amex Membership Rewards" },
  { id: "CHASE_UR", label: "Chase Ultimate Rewards" },
  { id: "CAPITAL_ONE_MILES", label: "Capital One Miles" },
  { id: "CITI_TY", label: "Citi ThankYou Points" },
  { id: "CASHBACK", label: "Cash back / statement credit" },
];

export const PROGRAM_LABELS: Record<RewardProgramId, string> = PROGRAM_CATALOG.reduce(
  (acc, p) => {
    acc[p.id] = p.label;
    return acc;
  },
  {} as Record<RewardProgramId, string>,
);

export const PROGRAM_IDS: RewardProgramId[] = PROGRAM_CATALOG.map((p) => p.id);

export function emptyBalances(): RewardBalance[] {
  return [];
}
