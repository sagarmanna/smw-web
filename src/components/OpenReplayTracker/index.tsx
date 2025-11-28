/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useEffect } from "react";

export function OpenReplayTracker() {
  const projectKey = process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY;
  const ingestPoint = process.env.NEXT_PUBLIC_OPENREPLAY_INGEST_POINT;

  useEffect(() => {
    // Don't initialize if required env vars are missing
    if (!projectKey || !ingestPoint) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "OpenReplay: Missing required environment variables (NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY or NEXT_PUBLIC_OPENREPLAY_INGEST_POINT)"
        );
      }
      return;
    }

    // Prevent double initialization
    if ((window as any).OpenReplay) {
      return;
    }

    const initOpts = {
      projectKey,
      ingestPoint,
      defaultInputMode: 2,
      obscureTextNumbers: false,
      obscureTextEmails: true,
    };

    const startOpts = { userID: "" };

    // Initialize OpenReplay
    try {
      (function (A: string, s: any, a: any, y: any, e: any, r: any) {
        r = (window as any).OpenReplay = [e, r, y, [s - 1, e]];
        s = document.createElement("script");
        s.src = A;
        s.async = !a;
        document.getElementsByTagName("head")[0].appendChild(s);
        r.start = function (v: any) {
          r.push([0]);
        };
        r.stop = function (v: any) {
          r.push([1]);
        };
        r.setUserID = function (id: string) {
          r.push([2, id]);
        };
        r.setUserAnonymousID = function (id: string) {
          r.push([3, id]);
        };
        r.setMetadata = function (k: string, v: any) {
          r.push([4, k, v]);
        };
        r.event = function (k: string, p: any, i: any) {
          r.push([5, k, p, i]);
        };
        r.issue = function (k: string, p: any) {
          r.push([6, k, p]);
        };
        r.isActive = function () {
          return false;
        };
        r.getSessionToken = function () {};
      })(
        "https://static.openreplay.com/17.0.0/openreplay.js",
        1,
        0,
        initOpts,
        startOpts,
        undefined
      );
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("OpenReplay: Failed to initialize", error);
      }
    }
  }, [projectKey, ingestPoint]);

  return null;
}

