function isPopulatedRow(item, keys) {
  if (!item || typeof item !== 'object') return false;
  return keys.some((key) => {
    const value = item[key];
    if (value === 0) return true;
    return String(value || '').trim().length > 0;
  });
}

function asNumber(value) {
  return Number(value) || 0;
}

function populatedActivities(record) {
  const rows = Array.isArray(record.activities) ? record.activities : [];
  return rows.filter((item) => String(item?.name || '').trim().length > 0);
}

export function parseActivityProgress(item) {
  if (item?.progress === '' || item?.progress == null || item?.progress === undefined) {
    return null;
  }
  const progress = Number(item.progress);
  if (Number.isNaN(progress)) return null;
  return Math.max(0, Math.min(100, progress));
}

function populatedIndicators(record) {
  const rows = Array.isArray(record.indicators) ? record.indicators : [];
  return rows.filter((item) =>
    isPopulatedRow(item, ['name', 'description', 'type', 'target', 'current', 'baseline'])
  );
}

function populatedBeneficiaries(record) {
  const rows = Array.isArray(record.beneficiaries) ? record.beneficiaries : [];
  return rows.filter((item) =>
    isPopulatedRow(item, ['name', 'category', 'location', 'numberReached', 'servicesReceived'])
  );
}

export function isActivityCompleted(activity) {
  const status = String(activity?.status || '').toLowerCase();
  const progress = asNumber(activity?.progress);
  return status === 'completed' || progress >= 100;
}

function activityProgressPercents(activities) {
  return activities
    .map((item) => parseActivityProgress(item))
    .filter((value) => value != null);
}

function indicatorProgressPercent(indicator) {
  const target = asNumber(indicator.target);
  const current = asNumber(indicator.current);
  if (target <= 0) return null;
  return Math.min(100, Math.round((current / target) * 100));
}

function averagePercent(values) {
  const nums = values.filter((value) => value != null && !Number.isNaN(value));
  if (!nums.length) return null;
  return Math.round(nums.reduce((sum, value) => sum + value, 0) / nums.length);
}

export function deriveMeMetrics(record = {}) {
  const activities = populatedActivities(record);
  const indicators = populatedIndicators(record);
  const beneficiaries = populatedBeneficiaries(record);

  const beneficiariesFromNumbers = beneficiaries.reduce(
    (sum, item) => sum + asNumber(item.numberReached),
    0
  );
  const beneficiariesReached =
    beneficiariesFromNumbers ||
    beneficiaries.length ||
    asNumber(record.beneficiaryTotal);

  const expenseFromActivities = activities.reduce(
    (sum, item) => sum + asNumber(item.budgetUsed),
    0
  );
  const expense = asNumber(record.expense) || expenseFromActivities;

  const activityProgressValues = activityProgressPercents(activities);
  const activitiesCompleted = activities.filter(isActivityCompleted).length;
  const activityCompletion = activityProgressValues.length
    ? averagePercent(activityProgressValues) ?? 0
    : activities.length
      ? asNumber(record.completion)
      : 0;

  const indicatorScores = indicators
    .map(indicatorProgressPercent)
    .filter((value) => value != null);

  const storedPerformance = asNumber(record.performance);
  const storedCompletion = asNumber(record.completion);

  const computedPerformance =
    averagePercent(indicatorScores) ?? averagePercent(activityProgressValues);
  const computedCompletion = averagePercent(activityProgressValues);

  const performance = computedPerformance ?? (storedPerformance > 0 ? storedPerformance : 0);
  const completion =
    computedCompletion ??
    (storedCompletion > 0 ? storedCompletion : performance);

  const budget = asNumber(record.budget);
  const budgetUtilization = budget ? (expense / budget) * 100 : 0;

  return {
    beneficiariesReached,
    expense,
    activities: activities.length,
    activitiesCompleted,
    performance,
    completion,
    budget,
    budgetUtilization,
    activityCompletion
  };
}

export function aggregateMeMetrics(records = []) {
  const totals = records.reduce(
    (acc, record) => {
      const metrics = deriveMeMetrics(record);
      const activities = populatedActivities(record);
      acc.projects += 1;
      acc.budget += metrics.budget;
      acc.expense += metrics.expense;
      acc.activities += metrics.activities;
      acc.activitiesCompleted += metrics.activitiesCompleted;
      acc.beneficiariesReached += metrics.beneficiariesReached;
      acc.performance += metrics.performance;
      acc.completion += metrics.completion;
      acc.activityProgressValues.push(...activityProgressPercents(activities));
      return acc;
    },
    {
      projects: 0,
      budget: 0,
      expense: 0,
      activities: 0,
      activitiesCompleted: 0,
      beneficiariesReached: 0,
      performance: 0,
      completion: 0,
      activityProgressValues: []
    }
  );

  const denominator = totals.projects || 1;
  const budgetUtilization = totals.budget ? (totals.expense / totals.budget) * 100 : 0;
  const { activityProgressValues, ...rest } = totals;

  return {
    ...rest,
    budgetUtilization,
    activityCompletion: averagePercent(activityProgressValues) ?? 0,
    performance: totals.performance / denominator,
    projectCompletion: totals.completion / denominator
  };
}

export function formatUtilizationPercent(value) {
  const numeric = Number(value) || 0;
  if (numeric > 0 && numeric < 1) return Math.round(numeric * 10) / 10;
  return Math.round(numeric);
}

export function formatPercentDisplay(value) {
  const numeric = Number(value) || 0;
  if (numeric > 0 && numeric < 1) return `${numeric.toFixed(1)}%`;
  return `${Math.max(0, Math.min(100, Math.round(numeric)))}%`;
}
