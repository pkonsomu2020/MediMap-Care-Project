import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

type AlertDialogProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onConfirm?: (event: GestureResponderEvent) => void;
  confirmText?: string;
  cancelText?: string;
};

export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            {onConfirm && (
              <TouchableOpacity
                onPress={onConfirm}
                style={[styles.button, styles.confirmButton]}
              >
                <Text style={styles.confirmText}>{confirmText}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Named exports for consistency
export const AlertDialogTrigger = ({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>
);

export const AlertDialogHeader = ({
  children,
}: {
  children: React.ReactNode;
}) => <View style={styles.header}>{children}</View>;

export const AlertDialogFooter = ({
  children,
}: {
  children: React.ReactNode;
}) => <View style={styles.footer}>{children}</View>;

export const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.title}>{children}</Text>
);

export const AlertDialogDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => <Text style={styles.description}>{children}</Text>;

export const AlertDialogAction = ({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, styles.confirmButton]}>
    <Text style={styles.confirmText}>{children}</Text>
  </TouchableOpacity>
);

export const AlertDialogCancel = ({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.button, styles.cancelButton]}>
    <Text style={styles.cancelText}>{children}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
    padding: 20,
    elevation: 5,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#2563eb",
  },
  cancelText: {
    color: "#111",
    fontWeight: "500",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "500",
  },
});
