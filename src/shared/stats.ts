import type { GuardEvent, RuleGroup, StatsSummary } from "./types";
import { getSleepSessionId, toLocalDateKey } from "./time";

export function buildStatsSummary(
  events: GuardEvent[],
  groupOrSchedule: RuleGroup | RuleGroup["schedule"],
  date = new Date()
): StatsSummary {
  const schedule = "schedule" in groupOrSchedule ? groupOrSchedule.schedule : groupOrSchedule;
  const ruleGroupId = "schedule" in groupOrSchedule ? groupOrSchedule.id : undefined;
  const scopedEvents = ruleGroupId ? events.filter((event) => event.ruleGroupId === ruleGroupId) : events;
  const today = toLocalDateKey(date);
  const tonight = getSleepSessionId(schedule, date);
  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const bucketDate = new Date(date);
    bucketDate.setDate(bucketDate.getDate() - (6 - index));
      const key = toLocalDateKey(bucketDate);
      return {
        date: key,
        blocked: countEvents(scopedEvents, "blocked", key),
        unlocked: countEvents(scopedEvents, "unlocked", key)
      };
  });

  const blockedEvents = scopedEvents.filter((event) => event.type === "blocked");
  const topBlockedHosts = Object.entries(
    blockedEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.host] = (acc[event.host] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count || a.host.localeCompare(b.host))
    .slice(0, 5);

  return {
    todayBlocked: countEvents(scopedEvents, "blocked", today),
    todayUnlocked: countEvents(scopedEvents, "unlocked", today),
    tonightBlocked: scopedEvents.filter((event) => event.type === "blocked" && event.sessionId === tonight).length,
    tonightUnlocked: scopedEvents.filter((event) => event.type === "unlocked" && event.sessionId === tonight).length,
    lastSevenDays,
    topBlockedHosts,
    latestBlockAt: blockedEvents.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt
  };
}

function countEvents(events: GuardEvent[], type: GuardEvent["type"], dateKey: string): number {
  return events.filter((event) => event.type === type && toLocalDateKey(new Date(event.createdAt)) === dateKey).length;
}
