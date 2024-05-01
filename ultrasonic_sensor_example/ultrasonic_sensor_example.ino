#include "SR04.h"
#define TRIG_PIN 12
#define ECHO_PIN 11

SR04 sr04 = SR04(ECHO_PIN,TRIG_PIN);
int act_dist;
int sum_dist = 0;
int avg_dist = 0;
int ref_dist = 0;
int n = 0;

void setup() {
  Serial.begin (9600);
  while (millis() < 5000) {
    act_dist = sr04.Distance();
    sum_dist = sum_dist + act_dist;
    n++;
    delay(200);
  }
  avg_dist = sum_dist / n;
  Serial.println("Done Calibration.");
}

void loop() {
  act_dist = sr04.Distance();
  ref_dist = act_dist - avg_dist;
  Serial.println(ref_dist);
  delay(500);
}
