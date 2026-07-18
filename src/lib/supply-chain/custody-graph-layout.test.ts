import { describe, expect, it } from "vitest";

import {
  CUSTODY_COLUMN_GAP,
  CUSTODY_COLUMN_PITCH,
  CUSTODY_NODE_WIDTH,
  CUSTODY_ROW_GAP,
  estimateCustodyNodeHeight,
  toCustodyFlowPosition,
} from "@/lib/supply-chain/custody-graph-layout";

describe("custody graph layout", () => {
  it("keeps a consistent horizontal gap between node boxes", () => {
    expect(CUSTODY_COLUMN_PITCH).toBe(CUSTODY_NODE_WIDTH + CUSTODY_COLUMN_GAP);
    expect(CUSTODY_COLUMN_GAP).toBeGreaterThan(0);
  });

  it("positions columns using pitch so boxes do not overlap", () => {
    const left = toCustodyFlowPosition(0, 0);
    const right = toCustodyFlowPosition(1, 0);
    expect(right.x - left.x).toBe(CUSTODY_COLUMN_PITCH);
    expect(right.x - left.x).toBeGreaterThan(CUSTODY_NODE_WIDTH);
  });

  it("grows estimated height when labels wrap", () => {
    const short = estimateCustodyNodeHeight({ label: "Farm A" });
    const long = estimateCustodyNodeHeight({
      label: "A very long farm name that should wrap across multiple lines",
      subtitle: "Another long subtitle that also wraps within the fixed node width",
    });
    expect(long).toBeGreaterThan(short);
    expect(long).toBeGreaterThan(CUSTODY_ROW_GAP);
  });
});
