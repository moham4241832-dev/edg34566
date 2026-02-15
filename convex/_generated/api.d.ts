/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as collections from "../collections.js";
import type * as customers from "../customers.js";
import type * as fixOverdueTypes from "../fixOverdueTypes.js";
import type * as http from "../http.js";
import type * as migrateOverdueData from "../migrateOverdueData.js";
import type * as migrateSalesData from "../migrateSalesData.js";
import type * as notifications from "../notifications.js";
import type * as overdue from "../overdue.js";
import type * as reports from "../reports.js";
import type * as router from "../router.js";
import type * as sales from "../sales.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  collections: typeof collections;
  customers: typeof customers;
  fixOverdueTypes: typeof fixOverdueTypes;
  http: typeof http;
  migrateOverdueData: typeof migrateOverdueData;
  migrateSalesData: typeof migrateSalesData;
  notifications: typeof notifications;
  overdue: typeof overdue;
  reports: typeof reports;
  router: typeof router;
  sales: typeof sales;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
