import React from "react";
import PullToRefresh from "react-simple-pull-to-refresh";
import { RiAlertFill, RiInformation2Fill } from "react-icons/ri";
import RouteResultCard from "./RouteResultCard";
import { useTranslation } from "react-i18next";

type Props = {
  routeResult: any;
  onRefresh: () => Promise<void>;
  onSelect: (payload: any[]) => void;
  networkErrorRealtime: boolean;
  fetchError: boolean;
  token?: string;
};

const ResultsList: React.FC<Props> = ({
  routeResult,
  onRefresh,
  onSelect,
  networkErrorRealtime,
  fetchError,
  token,
}) => {
  const { t } = useTranslation("global");
  return (
    <PullToRefresh onRefresh={onRefresh} pullingContent="">
      <>
        {networkErrorRealtime && (
          <div className="bus-offline">
            <RiAlertFill className="bus-offline-icon" />
            {t("internet_offline")}
          </div>
        )}
        {fetchError && (
          <div className="bus-offline">
            <RiAlertFill className="bus-offline-icon" />
            {t("fetch-error")}
          </div>
        )}
        {routeResult.samestation && (
          <div className="bus-offline">
            <RiInformation2Fill className="bus-offline-icon" />
            {t("samestation-info")}
          </div>
        )}

        {routeResult.sortedResults ? (
          routeResult.sortedResults.slice(0, 15).map((result: any, idx: number) => (
            <RouteResultCard
              key={idx}
              result={result}
              onClick={() =>
                onSelect([
                  result.route,
                  result.routeIndex,
                  { busNo: result.busNo, stationIndex: result.routeIndex, token },
                ])
              }
            />
          ))
        ) : routeResult.error ? (
          <div className="bus-offline">
            <RiInformation2Fill className="bus-offline-icon" />
            {t(routeResult.message)}
          </div>
        ) : null}
      </>
    </PullToRefresh>
  );
};

export default ResultsList;
