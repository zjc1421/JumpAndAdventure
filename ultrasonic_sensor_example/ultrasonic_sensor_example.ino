#include "SR04.h"
#define TRIG_PIN 12
#define ECHO_PIN 11
SR04 sr04 = SR04(ECHO_PIN,TRIG_PIN);
int initial_distance;
long a;

void setup() {
   Serial.begin(9600);
}

void loop() {
   a=sr04.Distance();
   Serial.println(a);
   delay(5);
   if (a >= 10) {
    Serial.println(1);
   } else {
    Serial.println(0);
   }

}
