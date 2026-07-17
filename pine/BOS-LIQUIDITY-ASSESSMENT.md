# "Market Structure Setup [Quant]" — BOS / Liquidity Extraction & Continuation Assessment

**Source:** two screenshots from LuxAlgo's video *"Stupid Simple Trend Continuation Strategy"* —
an AI-generated Pine Script v6 strategy shown in the LuxAlgo "Quant" chat and the TradingView
Pine Editor (chart context: NQ1! futures).

**Extraction file:** [`market-structure-setup-quant.pine`](market-structure-setup-quant.pine)

---

## 1. What was recovered vs. reconstructed

| Original lines | Status | Content |
|---|---|---|
| 1–51 | **Verbatim** | License header, `strategy()` declaration, all inputs, EMA + ATR filters, pivot detection, swing-state `var`s |
| ~52–266 | **Reconstructed** (off-screen) | The whole BOS / zone / inducement-liquidity engine and the signal definitions |
| 267–308 | **Verbatim** | Tail of the long entry (ATR branch), full short entry, TP/SL boxes, `strategy.entry/exit`, trade-management visuals |

Right-edge truncations (screenshot cropping) were completed with the obvious values and are
flagged with inline comments in the `.pine` file: the `strategy()` arg list after
`max_boxes_count =`, the `group =` args, the `options = ["Zone", "ATR"]` list, and the
`bgcolor` of the SL/TP boxes.

The reconstruction is **anchored, not guessed blindly**: every identifier the verbatim tail
uses (`currentZoneDir`, `currentZoneTop`, `currentZoneBottom`, `activeBox`, `inducementLine`,
`activeTrade`, `longSignal`, `shortSignal`, `slBox`, `tpBox`) plus the on-screen chat notes
("stop loss at the bottom of the zone", Zone vs ATR dropdown, inducement line input) pin down
the state machine. What cannot be pinned down exactly — and must be diffed if you ever get the
full source — is listed in §4.

## 2. How the continuation logic works (the recovered pipeline)

1. **Structure:** `ta.pivothigh/pivotlow(5, 5)` define swing points (confirmed 5 bars late).
2. **BOS:** a close through the last confirmed swing high (low) = bullish (bearish) Break of
   Structure → dashed MS line at the broken level.
3. **Zone:** the pivot that *originated* the breaking leg becomes a demand/supply box
   (`bullColor`/`bearColor`) — for longs, the origin swing low; for shorts, the origin swing high.
4. **Inducement (the liquidity part):** the first pullback pivot after the BOS marks resting
   liquidity (dotted `indColor` line). Price must **sweep** it (trade through it) — the classic
   SMC "grab stops before continuing" step.
5. **Entry:** after the sweep, price **taps back into the zone** and closes back out in the
   trend direction, with the 200 EMA regime filter agreeing → `strategy.entry` at close.
6. **Risk:** SL either at the far edge of the zone (with TP = `risk × rrRatio`, default 1.5)
   or ATR-based (1.0× SL / 1.5× TP); bracket via `strategy.exit(stop, limit)`. The zone is
   consumed on entry (`currentZoneDir := 0`), so each BOS yields at most one trade.

## 3. Assessment of the continuation logic

### Sound ideas in it
- **With-trend pullback structure.** BOS-then-retest is a legitimate continuation framework;
  it only ever enters *with* the most recent structural break, and the EMA-200 filter keeps it
  aligned with the higher-timeframe regime.
- **No repainting in the structure itself.** Pivots are used only after confirmation and
  signals fire on bar close — the historical signals are reproducible (standard caveat: the
  in-progress bar can flicker until it closes).
- **Defined risk on every trade** with a bracket order, and the "zone SL + R:R TP" mode keeps
  the target proportional to the setup's own geometry rather than a fixed tick count.
- **One-shot zone consumption** prevents revenge re-entries into a level that already played out.

### Weaknesses / red flags (roughly in order of practical impact)

1. **Entry-price mismatch (backtest optimism).** `tradeEntry := close` computes the SL/TP, but
   `strategy.entry()` fills at the **next bar's open** unless the declaration (truncated at
   line 5) contained `process_orders_on_close = true`. On NQ, gaps and fast continuation bars
   mean the real fill is routinely worse than the level the bracket was computed from — the
   backtest's R:R is systematically flattering.
2. **No commissions/slippage visible in the declaration.** A scalping-frequency futures
   strategy backtested at zero cost is not evidence of anything. 1 tick of slippage + fees per
   side materially changes a 1.5R system.
3. **Uneven dollar risk in Zone-SL mode.** Stop distance = zone width, which varies wildly,
   while quantity is the default fixed contract count. Two "identical" signals can carry 5×
   different risk. Needs risk-based position sizing (`qty = riskCapital / (entry − SL)`).
4. **Pivot lag compounds.** Structure confirms 5 bars late, and the *inducement* pivot also
   confirms 5 bars late — on fast pullbacks the sweep-and-tap can complete before the script
   even knows the inducement exists, so the best continuations are the ones it misses.
5. **Trend-regime dependency.** In chop, BOS fires alternately in both directions, zones flip,
   and the inducement sweep is just... the range continuing. The EMA filter thins this out but
   does not remove it; expect the equity curve to be made in trends and bled back in ranges.
6. **`activeTrade` reset was off-screen.** The visible code only ever sets it `true`. If the
   original lacks a release-when-flat reset (included in the reconstruction), the strategy
   takes exactly one trade and stops — worth checking against the full source.
7. **Degenerate zones possible.** When the origin pivot candle closes on its extreme, the
   wick-zone has ~zero height; "tap" then requires an exact retest of the low/high. A minimum
   zone height (e.g. fraction of ATR) is a sensible patch.
8. **Short-side bracket sanity.** `float risk = tradeSl − tradeEntry` assumes entry below the
   zone top; if the signal predicate in the real source is looser than reconstructed, risk can
   go ≤ 0 and the bracket inverts. Guard with `risk > 0` before ordering.
9. **No session/time filter.** On index futures, overnight/rollover bars generate structure
   and sweeps that behave nothing like RTH — and stops gap.

### Verdict

The logic is a **coherent, honestly-constructed SMC-style continuation scaffold** — BOS →
origin zone → liquidity sweep → retest — and it's a reasonable base to build on. It is **not
a validated edge**: it comes from an AI-chat demo video, was shown without costs, sizing, or
fill alignment, and its profitability claim rests entirely on a default-settings NQ backtest.
Treat the published numbers as marketing until it survives: realistic commission + slippage,
risk-normalized sizing, `process_orders_on_close` (or next-open level computation), and
out-of-sample / walk-forward testing across trending *and* ranging periods.

## 4. v2 — Structure-trend + liquidity-sweep rework (`market-structure-liquidity-v2.pine`)

Rebuilt from the second video's model (screenshots IMG_9327 / IMG_9329) and the follow-up
requirements: EMA filter removed (disabling it raised PF in the tests shown), trend marked
from structure, and SL/TP taken from the swing that price made through the liquidity.

**Rule mapping from the screenshots:**

| On the video chart | In the script |
|---|---|
| Red block (accumulation/liquidity area) | Box from the last opposing swing to the broken level, drawn on BOS and extended right |
| Trend + break | HH/HL/LH/LL pivot labels, dashed BOS/CHoCH lines, trend background tint (replaces EMA) |
| Pink line at the pullback wick ("inner liquidity") | First post-BOS confirmed pullback pivot's wick; a later pullback pivot replaces it |
| White arrow: bounces are *not* liquidity until a lower low prints | Setup stays disarmed until a wick exceeds the impulse extreme (LL for shorts / HH for longs) |
| Entry at the inner liquidity wick | LIMIT order resting at the wick once the LL/HH confirms — the retrace is the fill |
| Stop "all over" the red block | SL at the block's far edge (+ optional ATR buffer input) |
| Trade shown ≈ 2.6 R:R, then "BE" | TP = 2.5× risk by default (or the structural LL/HH), optional break-even move at +1R |

**What v2 fixes vs v1:** limit entries fill *at the computed level* (no more close-vs-next-open
drift in the backtest), the stop is structural instead of ATR-arbitrary, and the trend filter
no longer throws away counter-EMA continuation setups.

**Still open before trusting a backtest:** zero commission/slippage in the declaration, fixed
default quantity (risk per trade still varies with block width — size off `risk = |entry − SL|`),
pivot confirmation lag (`length` bars) can miss V-shaped pullbacks that fill before the inner
wick is even confirmed, and the BE trigger fires on an intrabar touch, which is optimistic on
wide bars. Test PF with BE on *and* off — BE conversions of winners into scratches often cost
more PF than they save.

## 5. If you obtain the full original source, diff these first

1. The exact **zone top/bottom definition** (wick-to-body vs ATR-padded vs full candle).
2. The exact **inducement selection rule** (first post-BOS pivot vs pre-BOS pullback low).
3. The exact **signal predicate** (tap+reclaim-close, as reconstructed, vs simple zone touch).
4. Whether **`activeTrade` is ever reset** and whether old boxes/lines are deleted or left
   to roll off `max_boxes_count`.
5. The full `strategy()` declaration — especially `process_orders_on_close`,
   `default_qty_*`, `commission_*`, `slippage`.
