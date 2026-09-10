import React, { createContext, useCallback, useContext, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

type AlertOptions = {
  title: string;
  message?: string;
  buttons?: AlertButton[];
};

type CrossAlertContextType = {
  showAlert: (options: AlertOptions) => void;
};

const CrossAlertContext = createContext<CrossAlertContextType | undefined>(undefined);

// Wrap your app (or just the auth stack) in this once, near the root.
export function CrossAlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<AlertOptions>({ title: "" });

  const showAlert = useCallback((opts: AlertOptions) => {
    setOptions(opts);
    setVisible(true);
  }, []);

  const handlePress = (btn: AlertButton) => {
    setVisible(false);
    // Let the modal close before firing the callback so it doesn't look laggy
    setTimeout(() => btn.onPress?.(), 50);
  };

  const buttons = options.buttons && options.buttons.length > 0 ? options.buttons : [{ text: "OK" }];

  return (
    <CrossAlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            <Text style={styles.title}>{options.title}</Text>
            {!!options.message && <Text style={styles.message}>{options.message}</Text>}
            <View style={styles.buttonRow}>
              {buttons.map((btn, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handlePress(btn)}
                  style={[
                    styles.button,
                    btn.style === "cancel" && styles.buttonCancel,
                    btn.style === "destructive" && styles.buttonDestructive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      btn.style === "cancel" && styles.buttonTextCancel,
                      btn.style === "destructive" && styles.buttonTextDestructive,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </CrossAlertContext.Provider>
  );
}

// Hook version — use inside components
export function useCrossAlert() {
  const ctx = useContext(CrossAlertContext);
  if (!ctx) {
    throw new Error("useCrossAlert must be used within a CrossAlertProvider");
  }
  return ctx.showAlert;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  button: {
    flex: 1,
    backgroundColor: "#1AADDC",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: "#F3F4F6",
  },
  buttonDestructive: {
    backgroundColor: "#EF4444",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  buttonTextCancel: {
    color: "#374151",
  },
  buttonTextDestructive: {
    color: "#FFFFFF",
  },
});
