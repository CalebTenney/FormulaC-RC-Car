#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <Servo.h>
Servo steering;

const char* ssid = "Calebs_Car";
const char* password = "12345678";

WebSocketsServer webSocket = WebSocketsServer(81);

// Motor control pins
int goPin = 3;
int reversePin = 0;

void setup() {
  pinMode(goPin, OUTPUT);
  pinMode(reversePin, OUTPUT);
  steering.attach(2);
  //Serial.begin(115200);
  WiFi.softAP(ssid, password);
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
  //Serial.println("WebSocket server started");
}

void loop() {
  webSocket.loop();
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
    String command = String((char*)payload);
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc,command);
    if(error) return;
    double X = doc["X"];
    double Y = doc["Y"];
    //Serial.println(command);
    if (Y<-0.2) {
     // Serial.println("forward");
      digitalWrite(goPin, HIGH);
      digitalWrite(reversePin, LOW);
    } else if (Y>0.2) {
     // Serial.println("reverse");
      digitalWrite(goPin, LOW);
      digitalWrite(reversePin, HIGH);
    }
    else {
      digitalWrite(goPin,LOW);
      digitalWrite(reversePin,LOW);
    }
      steering.write(103+X*-20);
      //Serial.println("Servo: ");
      //Serial.println(100+X*10);
    delay(10);
}
