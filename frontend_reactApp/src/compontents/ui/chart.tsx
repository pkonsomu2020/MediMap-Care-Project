import * as React from "react";
import { View, Text, StyleSheet, ScrollView, ViewProps } from "react-native";

/**
 * React Native version of the Chart container + tooltip + legend utilities.
 *
 * NOTES:
 * - This is a portable UI wrapper for charting libraries in React Native (e.g., react-native-svg + victory-native).
 * - The original web version injected CSS variables per-theme; on React Native we can't inject CSS, so ChartStyle is a no-op (keeps API parity).
 */

/* ---------- types ---------- */

const THEMES = { light: "", dark: "dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType<any>;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> });
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

/* ---------- ChartContainer ---------- */

export type ChartContainerProps = ViewProps & {
  config: ChartConfig;
  children?: React.ReactNode;
  id?: string;
};

export const ChartContainer = React.forwardRef<View, ChartContainerProps>(({ id, style, children, config, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <View ref={ref as any} style={[styles.container, style]} {...props}>
        <ChartStyle id={id || undefined} config={config} />
        {/* Expect a charting library to render inside this container (children) */}
        {children}
      </View>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = "ChartContainer";

/* ---------- ChartStyle (no-op on RN, keeps API parity) ---------- */

export const ChartStyle: React.FC<{ id?: string; config: ChartConfig }> = () => {
  // On web the original injected CSS variables scoped to data-chart; on RN we can't,
  // so we return null. Consumers should use `config` from context to style tooltips/legends.
  return null;
};
ChartStyle.displayName = "ChartStyle";

/* ---------- ChartTooltipContent ---------- */

export type RawPayloadItem = {
  dataKey?: string;
  name?: string;
  value?: number | string;
  payload?: Record<string, any>;
  color?: string;
  fill?: string;
};

export type ChartTooltipContentProps = {
  active?: boolean;
  payload?: RawPayloadItem[] | null;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
  label?: string | React.ReactNode;
  labelFormatter?: (label: any, payload?: RawPayloadItem[]) => React.ReactNode;
  formatter?: (value: any, name?: string, item?: RawPayloadItem, index?: number, payload?: any) => React.ReactNode;
  color?: string;
  className?: string; // ignored on RN, kept for API parity
  labelClassName?: string; // ignored on RN
};

export const ChartTooltipContent = React.forwardRef<View, ChartTooltipContentProps>(
  (
    {
      active,
      payload,
      hideLabel = false,
      hideIndicator = false,
      indicator = "dot",
      label,
      labelFormatter,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) return null;

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);

      const value =
        !labelKey && typeof label === "string"
          ? (config[label as keyof typeof config]?.label as React.ReactNode) || label
          : itemConfig?.label;

      if (labelFormatter) {
        return <View style={styles.tooltipLabel}>{labelFormatter(value, payload)}</View>;
      }

      if (!value) return null;

      return <Text style={[styles.tooltipLabelText]}>{value}</Text>;
    }, [label, labelFormatter, payload, hideLabel, config, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <View ref={ref as any} style={styles.tooltipContainer}>
        {!nestLabel ? tooltipLabel : null}
        <View style={styles.tooltipList}>
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || (item.payload && item.payload.fill) || item.color;

            const valueNode =
              formatter && item?.value !== undefined && item.name
                ? formatter(item.value, item.name, item, index, item.payload)
                : null;

            return (
              <View key={`${item.dataKey ?? index}`} style={[styles.tooltipRow, indicator === "dot" ? styles.tooltipRowDot : null]}>
                {valueNode ? (
                  <View style={styles.customValueCell}>{valueNode}</View>
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <View style={styles.iconWrapper}>
                        <itemConfig.icon />
                      </View>
                    ) : (
                      !hideIndicator && (
                        <View
                          style={[
                            styles.indicatorBase,
                            indicator === "dot" && styles.indicatorDot,
                            indicator === "line" && styles.indicatorLine,
                            indicator === "dashed" && styles.indicatorDashed,
                            nestLabel && indicator === "dashed" ? styles.indicatorDashedNest : null,
                            { backgroundColor: indicatorColor, borderColor: indicatorColor },
                          ]}
                        />
                      )
                    )}

                    <View style={styles.tooltipMain}>
                      {nestLabel ? tooltipLabel : null}
                      <Text style={styles.tooltipName}>{itemConfig?.label ?? item.name}</Text>
                    </View>

                    {item.value !== undefined && (
                      <Text style={styles.tooltipValue}>
                        {typeof item.value === "number" ? item.value.toLocaleString() : `${item.value}`}
                      </Text>
                    )}
                  </>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  },
);
ChartTooltipContent.displayName = "ChartTooltipContent";

/* ---------- ChartLegendContent ---------- */

export type ChartLegendContentProps = {
  payload?: Array<{ value?: any; dataKey?: string; color?: string }>;
  verticalAlign?: "top" | "bottom";
  hideIcon?: boolean;
  nameKey?: string;
  style?: any;
};

export const ChartLegendContent = React.forwardRef<View, ChartLegendContentProps>(({ payload, verticalAlign = "bottom", hideIcon = false, nameKey, style }, ref) => {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <ScrollView horizontal contentContainerStyle={[styles.legendContainer, verticalAlign === "top" ? styles.legendTopPadding : styles.legendBottomPadding, style]} ref={ref as any}>
      {payload.map((item, i) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item as any, key);

        return (
          <View key={i} style={styles.legendItem}>
            {!hideIcon && (itemConfig?.icon ? (
              <View style={styles.legendIconWrapper}>
                <itemConfig.icon />
              </View>
            ) : (
              <View style={[styles.legendSquare, { backgroundColor: (item as any).color ?? "#000" }]} />
            ))}
            <Text style={styles.legendLabel}>{itemConfig?.label ?? (item as any).value}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

/* ---------- helpers ---------- */

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  // @ts-ignore
  const payloadPayload = "payload" in (payload as any) && typeof (payload as any).payload === "object" && (payload as any).payload !== null ? (payload as any).payload : undefined;

  let configLabelKey: string = key;

  if (key in (payload as any) && typeof (payload as any)[key] === "string") {
    // @ts-ignore
    configLabelKey = (payload as any)[key] as string;
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key as keyof typeof payloadPayload] === "string") {
    // @ts-ignore
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  // return the matching config entry if present
  // @ts-ignore
  return configLabelKey in config ? (config as any)[configLabelKey] : (config as any)[key];
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
  },
  /* tooltip */
  tooltipContainer: {
    minWidth: 128,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  tooltipLabel: {
    marginBottom: 4,
  },
  tooltipLabelText: {
    fontWeight: "600",
    fontSize: 13,
  },
  tooltipList: {
    gap: 6,
  } as any,
  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  } as any,
  tooltipRowDot: {
    alignItems: "center",
  } as any,
  iconWrapper: {
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorBase: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 0.5,
    marginRight: 8,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  indicatorLine: {
    width: 12,
    height: 6,
    borderRadius: 2,
  },
  indicatorDashed: {
    width: 12,
    height: 0,
    borderWidth: 1.5,
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  indicatorDashedNest: {
    marginVertical: 4,
  },
  tooltipMain: {
    flex: 1,
    justifyContent: "center",
  },
  tooltipName: {
    color: "#6B7280",
    fontSize: 12,
  },
  tooltipValue: {
    fontFamily: undefined,
    fontWeight: "600",
    fontSize: 13,
    color: "#111827",
    marginLeft: 8,
  },
  customValueCell: {
    flex: 1,
  },

  /* legend */
  legendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 8,
  } as any,
  legendTopPadding: {
    paddingBottom: 6,
  },
  legendBottomPadding: {
    paddingTop: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendIconWrapper: {
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  legendSquare: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 13,
  },
});

/* ---------- exports ---------- */

export { ChartTooltipContent, ChartLegendContent, ChartStyle };
export default ChartContainer;
