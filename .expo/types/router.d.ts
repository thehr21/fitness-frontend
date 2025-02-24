/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/community` | `/(tabs)/gamification` | `/(tabs)/meal-planning` | `/(tabs)/workout-plan` | `/_sitemap` | `/community` | `/forget-password` | `/gamification` | `/logged-meals` | `/login` | `/meal-planning` | `/recipe` | `/register` | `/register0` | `/register1` | `/register2` | `/reset-password` | `/settings` | `/welcome` | `/workout-plan`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
