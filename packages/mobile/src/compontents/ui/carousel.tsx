import React, { createContext, useContext, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from "react-native";
import CarouselLib from "react-native-reanimated-carousel";
import { ArrowLeft, ArrowRight } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

type Orientation = "horizontal" | "vertical";

export interface CarouselProps {
  orientation?: Orientation;
  data: any[];
  renderItem: ({ item, index }: { item: any; index: number }) => React.ReactNode;
  loop?: boolean;
  autoPlay?: boolean;
  onSnapToItem?: (index: number) => void;
}

interface CarouselContextProps {
  scrollPrev: () => void;
  scrollNext: () => void;
  currentIndex: number;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: Orientation;
}

const CarouselContext = createContext<CarouselContextProps | null>(null);

export const useCarousel = () => {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error("useCarousel must be used within a <Carousel />");
  return ctx;
};

export const Carousel: React.FC<CarouselProps> = ({
  orientation = "horizontal",
  data,
  renderItem,
  loop = false,
  autoPlay = false,
  onSnapToItem,
}) => {
  const carouselRef = useRef<CarouselLib<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollPrev = () => {
    carouselRef.current?.scrollTo({ index: currentIndex - 1, animated: true });
  };

  const scrollNext = () => {
    carouselRef.current?.scrollTo({ index: currentIndex + 1, animated: true });
  };

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < data.length - 1;

  return (
    <CarouselContext.Provider
      value={{
        scrollPrev,
        scrollNext,
        currentIndex,
        canScrollPrev,
        canScrollNext,
        orientation,
      }}
    >
      <View
        style={[
          styles.container,
          orientation === "horizontal" ? { width } : { height: height * 0.4 },
        ]}
      >
        <CarouselLib
          ref={carouselRef}
          data={data}
          width={width}
          height={orientation === "horizontal" ? 200 : height * 0.4}
          autoPlay={autoPlay}
          loop={loop}
          vertical={orientation === "vertical"}
          onSnapToItem={(index) => {
            setCurrentIndex(index);
            onSnapToItem?.(index);
          }}
          renderItem={renderItem}
        />
      </View>
    </CarouselContext.Provider>
  );
};

// Carousel content & items (for API parity)
export const CarouselContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <View style={styles.content}>{children}</View>
);

export const CarouselItem: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <View style={styles.item}>{children}</View>
);

// Navigation buttons
export const CarouselPrevious: React.FC = () => {
  const { scrollPrev, canScrollPrev, orientation } = useCarousel();

  return (
    <TouchableOpacity
      disabled={!canScrollPrev}
      onPress={scrollPrev}
      style={[
        styles.navButton,
        orientation === "horizontal"
          ? { left: 8, top: "50%", transform: [{ translateY: -20 }] }
          : { top: 8, left: "50%", transform: [{ translateX: -20 }, { rotate: "90deg" }] },
        !canScrollPrev && styles.disabled,
      ]}
    >
      <ArrowLeft size={20} color="#111" />
    </TouchableOpacity>
  );
};

export const CarouselNext: React.FC = () => {
  const { scrollNext, canScrollNext, orientation } = useCarousel();

  return (
    <TouchableOpacity
      disabled={!canScrollNext}
      onPress={scrollNext}
      style={[
        styles.navButton,
        orientation === "horizontal"
          ? { right: 8, top: "50%", transform: [{ translateY: -20 }] }
          : { bottom: 8, left: "50%", transform: [{ translateX: -20 }, { rotate: "90deg" }] },
        !canScrollNext && styles.disabled,
      ]}
    >
      <ArrowRight size={20} color="#111" />
    </TouchableOpacity>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    overflow: "hidden",
  },
  item: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  navButton: {
    position: "absolute",
    backgroundColor: "#FFF",
    borderRadius: 50,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  disabled: {
    opacity: 0.3,
  },
});
