import { View, Text, Pressable, Animated, PanResponder } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { useColors } from "@/hooks/use-colors";

interface SwipeableTableRowProps {
  id: string;
  companyName: string;
  yearEndDate: string;
  dueDate: string;
  daysRemaining: number;
  overdue: boolean;
  urgencyColor: string;
  onPress: () => void;
  onDelete: (id: string) => void;
}

export function SwipeableTableRow({
  id,
  companyName,
  yearEndDate,
  dueDate,
  daysRemaining,
  overdue,
  urgencyColor,
  onPress,
  onDelete,
}: SwipeableTableRowProps) {
  const colors = useColors();
  const translateX = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow swiping left (negative dx)
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -80));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -40) {
          // Swipe left far enough - open delete button
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
          }).start();
          setIsOpen(true);
        } else {
          // Close or not far enough - snap back
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
          }).start();
          setIsOpen(false);
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.timing(translateX, {
      toValue: -400,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDelete(id);
    });
  };

  return (
    <View className="overflow-hidden border-b border-border">
      {/* Delete button background - only visible when swiped */}
      {isOpen && (
        <View className="absolute right-0 top-0 bottom-0 bg-error flex-row items-center justify-end pr-4 w-20">
          <Ionicons name="trash" size={20} color={colors.background} />
        </View>
      )}

      {/* Swipeable content */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View className="bg-background py-3 px-4 flex-row items-center gap-3">
            {/* Urgency indicator */}
            <View
              style={{
                width: 4,
                height: 60,
                backgroundColor: urgencyColor,
                borderRadius: 2,
              }}
            />

            {/* Company name */}
            <View className="flex-1">
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {companyName}
              </Text>
              <Text className="text-xs text-muted mt-1">
                Year End: {yearEndDate}
              </Text>
            </View>

            {/* Due date */}
            <View className="items-end">
              <Text className="text-xs text-muted mb-1">Due</Text>
              <Text className="text-sm font-semibold text-foreground">{dueDate}</Text>
            </View>

            {/* Days remaining */}
            <View className="items-center min-w-[50px]">
              <Text
                style={{ color: urgencyColor }}
                className="text-sm font-bold"
              >
                {overdue ? "OVERDUE" : `${daysRemaining}d`}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.muted} />
            </View>
          </View>
        </Pressable>
      </Animated.View>

      {/* Delete button overlay - only visible when swiped */}
      {isOpen && (
        <Pressable
          onPress={handleDelete}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 80,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="trash" size={20} color={colors.background} />
        </Pressable>
      )}
    </View>
  );
}
