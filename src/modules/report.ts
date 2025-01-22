import { Context } from "@actions/github/lib/context";
import { Condition, QualityGate } from "./models";
import {
  formatMetricKey,
  getStatusEmoji,
  getComparatorSymbol,
  trimTrailingSlash,
  formatStringNumber,
  getCurrentDateTime,
} from "./utils";

const buildRow = (condition: Condition) => {
  const rowValues = [
    formatMetricKey(condition.metricKey), // Metric
    getStatusEmoji(condition.status), // Status
    formatStringNumber(condition.actualValue), // Value
    `${getComparatorSymbol(condition.comparator)} ${condition.errorThreshold}`, // Error Threshold
  ];

  return "|" + rowValues.join("|") + "|";
};

/**
 * Constructs a SonarQube report URL based on the provided parameters.
 *
 * @param hostUrl - The base URL of the SonarQube server.
 * @param projectKey - The unique key of the project in SonarQube.
 * @param branch - (Optional) The branch name to include in the report URL.
 * @param pullRequest - (Optional) The pull request identifier to include in the report URL.
 * @returns The constructed SonarQube report URL.
 */
const buildReportUrl = (
  hostUrl: string,
  projectKey: string,
  branch?: string,
  pullRequest?: string
) => {
  const baseUrl = `${trimTrailingSlash(hostUrl)}/dashboard`;

  const urlParams = new URLSearchParams({
    id: projectKey,
    ...(branch && { branch }),
    ...(pullRequest && { pullRequest }),
  });

  return `${baseUrl}?${urlParams}`;
};

export const buildReport = (
  result: QualityGate,
  hostURL: string,
  projectKey: string,
  context: Context,
  branch?: string,
  pullRequest?: string
) => {
  const reportUrl = buildReportUrl(hostURL, projectKey);
  const projectStatus = getStatusEmoji(result.projectStatus.status);

  const resultTable = result.projectStatus.conditions.map(buildRow).join("\n");

  const { value: updatedDate, offset: updatedOffset } = getCurrentDateTime();

  const resultContext = [
    `- **Parecer final**: ${projectStatus}`,
    // ...(branch ? [`- **Branch**: \`${branch}\``] : []),
    ...(pullRequest ? [`- **Pull Request**: #${pullRequest}`] : []),
    `- Solicitado por: @${context.actor} on \`${context.eventName}\``,
  ];

  return `### SonarQube Quality Gate Result
${resultContext.join("\n")}

| Critério | Parecer | Resultado | Threshold |
|:------:|:------:|:-----:|:---------------:|
${resultTable}

[Para análise detalhada, acesse o SonarQube](${reportUrl})
###### _updated: ${updatedDate} (${updatedOffset})_`;
};
