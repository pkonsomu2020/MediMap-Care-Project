import React from "react";
import { StyleSheet, View } from "react-native";
import { Calendar as RNCalendar, DateData } from "react-native-calendars";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

type CalendarProps = {
  selected?: string;
  onSelectDate?: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  markedDates?: Record<string, any>;
  showOutsideDays?: boolean;
  theme?: Record<string, any>;
};

export const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelectDate,
  minDate,
  maxDate,
  markedDates,
  showOutsideDays = true,
  theme = {},
}) => {
  return (
    <View style={styles.container}>
      <RNCalendar
        current={selected}
        minDate={minDate}
        maxDate={maxDate}
        onDayPress={(day: DateData) => onSelectDate?.(day.dateString)}
        markedDates={markedDates || (selected ? { [selected]: { selected: true } } : {})}
        theme={{
          todayTextColor: "#007AFF",
          selectedDayBackgroundColor: "#007AFF",
          selectedDayTextColor: "#FFFFFF",
          arrowColor: "#007AFF",
          monthTextColor: "#111",
          textMonthFontWeight: "bold",
          textDayFontWeight: "500",
          textDayHeaderFontWeight: "500",
          ...theme,
        }}
        hideExtraDays={!showOutsideDays}
        renderArrow={(direction) =>
          direction === "left" ? (
            <ChevronLeft size={18} color="#111" />
          ) : (
            <ChevronRight size={18} color="#111" />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
});
