import { SafeAreaView, View, StyleSheet, Text, StatusBar, Animated } from "react-native";
import React, { useState, useEffect } from "react";
import { AxisPad, AxisPadTouchEvent } from "@fustaro/react-native-axis-pad";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

export default function App() {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);
  const [showConnectedMessage, setShowConnectedMessage] = useState(false);

  useEffect(() => {
    console.log("Initializing WebSocket...");
    const socket = new WebSocket("ws://192.168.4.1:81");

    socket.onopen = () => {
      console.log("Connected to Car");
      setIsConnected(true);
      setShowConnectedMessage(true);
      setTimeout(() => setShowConnectedMessage(false), 2000);
    };
    socket.onmessage = (event) => console.log("Message from ESP:", event.data);
    socket.onerror = (error) => console.error("WebSocket Error:", error.message);
    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    setWs(socket);

    return () => {
      if (socket) socket.close();
    };
  }, []);

  const onTouchEvent = (event: AxisPadTouchEvent) => {
    const currentTime = Date.now();

    if (event.eventType === "start") {
      console.log("start x", event.ratio.x, "start y", event.ratio.y);
    } else if (event.eventType === "end") {
      ws.send(
            JSON.stringify({ X: parseFloat(0.3), Y: parseFloat(0.0) })
          );
      console.log("end x", event.ratio.x, "end y", event.ratio.y);
    } else if (event.eventType === "pan") {
        if (ws && isConnected && currentTime - lastSentTime >= 100) {
          ws.send(
            JSON.stringify({ X: parseFloat((event.ratio.x+0.0)*2.5), Y: parseFloat(event.ratio.y) })
          );
          console.log("Sending coordinates");
          setLastSentTime(currentTime);
        }
      console.log("pan x", event.ratio.x, "pan y", event.ratio.y);
    }
  };

  return (
    <LinearGradient colors={["#1e3c72", "#2a5298"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.innerContainer}>
        <GestureHandlerRootView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={styles.header}>Formula C Car Control</Text>
          {showConnectedMessage && <Text style={styles.connectedMessage}>Connected!</Text>}
          <View style={styles.padContainer}>
            {isConnected ? (
              <AxisPad
                id={"pad-1"}
                size={250}
                padBackgroundStyle={styles.padBackground}
                stickStyle={styles.stickStyle}
                controlStyle={AxisPad.controlStyle}
                ignoreTouchDownInPadArea={false}
                initialTouchType={"no-snap"}
                onTouchEvent={onTouchEvent}
              />
            ) : (
              <Text style={styles.status}>Connecting to Car...</Text>
            )}
          </View>
        </GestureHandlerRootView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 40,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  connectedMessage: {
    fontSize: 22,
    color: "#00ff00",
    fontWeight: "bold",
    marginBottom: 10,
  },
  padContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  status: {
    fontSize: 18,
    color: "#ffffff",
    fontStyle: "italic",
    marginTop: 0,
  },
  padBackground: {
    backgroundColor: "#ffffff",
    borderRadius: 125,
    opacity: 0.8,
  },
  stickStyle: {
    backgroundColor: "#ff9800",
    borderRadius: 50,
    opacity: 0.9,
  },
});
